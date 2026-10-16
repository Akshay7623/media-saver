import { useState, useRef, useCallback, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { helperRequest, parseHeaders } from "../youtube/bridge";
import { isAndroid } from "../bookmarkSetup";
import { safeFileName } from "../download";
import { MediaHeader, ProgressBar, QualityPicker, SavedNote } from "./MediaResult";
import { Alert, Spinner } from "./ui";
import { IconCheck, IconDownload, IconFilm, IconInfo, IconMusic } from "./icons";

// ─── constants ──────────────────────────────────────────────────────────────────
const CHUNK_SIZE  = 8 * 1024 * 1024; // 8 MB per chunk
const CONCURRENCY = 4;               // parallel range-fetches per stream

// ffmpeg-core.wasm is ~32 MB — over Cloudflare Pages' 25 MiB per-file limit —
// so the core loads from a CDN. Keep the version in step with the
// CORE_VERSION that @ffmpeg/ffmpeg expects.
const FFMPEG_CORE_URL = "https://unpkg.com/@ffmpeg/core@0.12.9/dist/esm";

// ─── helpers ───────────────────────────────────────────────────────────────────

function fmtBytes(b) {
  if (!b) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDuration(secs) {
  const s = Math.round(secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// YouTube's CDN only lets youtube.com read its responses, so every byte is
// fetched by the helper userscript (see ../youtube/bridge.js).

const isRetryable = (status) => status >= 500 || status === 408 || status === 429;

/**
 * Download one byte range, with backoff retry.
 *
 * Over a long multi-chunk download googlevideo occasionally drops a
 * connection; without a retry a single blip 40 chunks in throws away the whole
 * download. Retries network errors, 5xx, 408 and 429 — not other 4xx: a 403
 * means YouTube refused the URL and hammering it will not help.
 *
 * onBytes receives byte deltas as data arrives, so the progress bar moves
 * during a chunk, and a negative delta when an attempt fails, so a retry does
 * not double-count the bytes it already reported.
 */
async function fetchRange(url, { start, end, signal, label = "", onBytes, attempts = 4 }) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let counted = 0;
    let res = null;
    try {
      res = await helperRequest(url, {
        headers: { Range: `bytes=${start}-${end}` },
        signal,
        onProgress: (loaded) => {
          onBytes?.(loaded - counted);
          counted = loaded;
        },
      });
    } catch (e) {
      onBytes?.(-counted);
      if (e.name === "AbortError" || e.permanent) throw e;
      lastErr = e;
    }

    if (res) {
      if (res.status === 200 || res.status === 206) {
        onBytes?.(res.body.byteLength - counted); // settle to the exact size
        return new Uint8Array(res.body);
      }
      onBytes?.(-counted);
      if (res.status === 403) {
        throw new Error("YouTube refused the download (HTTP 403). Fetch the video again and retry.");
      }
      lastErr = new Error(`HTTP ${res.status}${label}`);
      if (!isRetryable(res.status)) throw lastErr;
    }

    // 0.5s, 1s, 2s — gives the CDN a moment before re-opening the connection
    if (attempt < attempts) await sleep(500 * 2 ** (attempt - 1));
  }
  throw new Error(`${lastErr.message} (after ${attempts} attempts)`);
}

/** Total stream size from a bytes=0-0 Range request, or 0 if unknown. */
async function probeSize(url, signal) {
  const res = await helperRequest(url, { headers: { Range: "bytes=0-0" }, signal });
  const range = parseHeaders(res.headers).get("content-range"); // "bytes 0-0/TOTAL"
  return Number(range?.split("/")[1]) || 0;
}

/**
 * Download url in parallel byte-range chunks.
 * @returns {Promise<Uint8Array>}
 */
async function fetchChunked(url, {
  totalSize,  // known from the format list; probed if missing
  chunkSize   = CHUNK_SIZE,
  concurrency = CONCURRENCY,
  onChunk,    // (done: number, total: number) => void
  onProgress, // (pct: number) => void
  signal,
} = {}) {
  const size = totalSize || await probeSize(url, signal);
  if (!size) throw new Error("Could not determine the stream size");

  // Build chunk descriptors
  const chunkList = [];
  for (let start = 0; start < size; start += chunkSize) {
    chunkList.push({ index: chunkList.length, start, end: Math.min(start + chunkSize - 1, size - 1) });
  }
  const total = chunkList.length;
  onChunk?.(0, total);

  const results  = new Array(total);
  let doneCount  = 0;
  let nextIdx    = 0;
  let downloaded = 0; // bytes across all chunks, for smooth progress

  const reportBytes = (delta) => {
    downloaded += delta;
    // Cap at 99 so the bar only reads 100% once every chunk is assembled.
    onProgress?.(Math.max(0, Math.min(99, Math.round((downloaded / size) * 100))));
  };

  // Worker pool — JS is single-threaded so nextIdx++ is race-free
  async function worker() {
    while (nextIdx < total) {
      const myIdx = nextIdx++;
      if (myIdx >= total) break;
      const { index, start, end } = chunkList[myIdx];
      results[index] = await fetchRange(url, {
        start,
        end,
        signal,
        label: ` on chunk ${index}`,
        onBytes: reportBytes,
      });
      doneCount++;
      onChunk?.(doneCount, total);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  onProgress?.(100);

  // Assemble ordered chunks
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of results) { out.set(chunk, offset); offset += chunk.length; }
  return out;
}

/** Save a Uint8Array to disk via a temporary object URL. */
function saveBlob(data, filename, mime = "video/mp4") {
  // Pass the view itself, not .buffer — a Uint8Array returned by ffmpeg's
  // readFile can be a window into a larger heap buffer, and .buffer would
  // then write the whole heap instead of just this file's bytes.
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// ─── FFmpeg singleton (lazy-loaded once) ──────────────────────────────────────
let _ff = null;

async function getFFmpeg(onLog) {
  if (_ff) return _ff;
  const ff = new FFmpeg();
  ff.on("log", ({ message }) => onLog?.(message));
  await ff.load({
    coreURL: await toBlobURL(`${FFMPEG_CORE_URL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${FFMPEG_CORE_URL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  _ff = ff;
  return ff;
}

// ─── TrackRow ─────────────────────────────────────────────────────────────────
// Download progress for one stream, then whether it's ready for FFmpeg.

function TrackRow({ label, icon, pct, chunks, write }) {
  const ready = write === "done";
  let status;
  if (ready) status = null;
  else if (write === "writing") status = "Preparing…";
  else if (chunks.total > 0) status = `${pct}%`;
  else status = "Starting…";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="flex items-center gap-2 font-medium text-fg">
          {icon}
          {label}
        </span>
        {ready ? (
          <span className="flex items-center gap-1 font-semibold text-accent-ink">
            <IconCheck size={14} strokeWidth={2.6} />
            Ready
          </span>
        ) : (
          <span className="tabular-nums text-subtle">{status}</span>
        )}
      </div>
      <ProgressBar value={ready ? 100 : pct === -1 ? null : pct} />
    </div>
  );
}

const PHASE_LABELS = {
  loading_ff: "Getting ready…",
  dl_muxed: "Downloading…",
  pipeline: "Downloading video and sound…",
  dl_mp3_audio: "Downloading audio…",
  merging: "Joining video and sound…",
  encoding_mp3: "Converting to MP3…",
};

// ─── main component ───────────────────────────────────────────────────────────
// YouTube result panel rendered by InputBox. `info` comes from
// getYouTubeVideo(); the streams are downloaded through the helper userscript
// and merged here in the browser with FFmpeg.wasm.
// onBusyChange(busy) lets the parent lock its input while a download runs.

export default function YTClientDownloader({ info, onBusyChange }) {
  // ── derived ───────────────────────────────────────────────────────────────
  const videoHeights = [...new Set(info.formats
      .filter(f => f.type === "video" || f.type === "muxed")
      .map(f => f.height).filter(Boolean))]
      .sort((a, b) => a - b);

  const bestAudio = info.formats
    .filter(f => f.type === "audio")
    .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

  // For merging, prefer AAC (m4a): it can be copied into the MP4 as-is
  // instead of re-encoded, which is slow in FFmpeg.wasm.
  const mergeAudio = info.formats
    .filter(f => f.type === "audio" && f.ext === "m4a")
    .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0] || bestAudio;

  // Default to the best quality up to 1080p (720p on phones, which have less
  // memory for merging); the visitor can pick higher.
  const [selHeight, setSelH]    = useState(() => {
    const cap = isAndroid ? 720 : 1080;
    const pick = videoHeights.filter(h => h <= cap).at(-1) ?? videoHeights[0];
    return String(pick ?? "");
  });
  const [phase, setPhase]       = useState("idle");
  // Download progress
  const [vidPct, setVidPct]     = useState(0);
  const [audPct, setAudPct]     = useState(0);
  const [mergePct, setMergePct] = useState(0);
  // Chunk counters
  const [vidChunks, setVidChunks] = useState({ done: 0, total: 0 });
  const [audChunks, setAudChunks] = useState({ done: 0, total: 0 });
  // FFmpeg VFS write status per stream
  const [vidWrite, setVidWrite] = useState("idle"); // "idle"|"writing"|"done"
  const [audWrite, setAudWrite] = useState("idle");

  const [errMsg, setErrMsg]     = useState("");
  const [ffLog, setFfLog]       = useState("");
  const abortRef                = useRef(null);
  const ffProgressRef           = useRef(null);

  const busy = !["idle", "done", "error"].includes(phase);

  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  // Stop any in-flight fetches if the panel is replaced by a new result
  useEffect(() => () => abortRef.current?.abort(), []);

  // ── reset progress helper ─────────────────────────────────────────────────
  function resetProgress() {
    setVidPct(0); setAudPct(0); setMergePct(0);
    setVidChunks({ done: 0, total: 0 });
    setAudChunks({ done: 0, total: 0 });
    setVidWrite("idle"); setAudWrite("idle");
    setErrMsg(""); setFfLog("");
  }

  // ── download video ────────────────────────────────────────────────────────
  const downloadVideo = useCallback(async () => {
    if (!selHeight) return;

    const h = Number(selHeight);
    const abort = new AbortController();
    abortRef.current = abort;
    resetProgress();

    try {
      const videoFmt = info.formats
        .filter(f => (f.type === "video" || f.type === "muxed") && f.height === h)
        .sort((a, b) => (b.filesize || 0) - (a.filesize || 0))[0];
      if (!videoFmt) throw new Error("No stream found for selected quality");

      const safeTitle = safeFileName(info.title, "video");

      // ── muxed: single chunked download, no merge ───────────────────────────
      if (videoFmt.type === "muxed") {
        setPhase("dl_muxed");
        const data = await fetchChunked(videoFmt.url, {
          totalSize: videoFmt.filesize,
          onChunk: (done, total) => setVidChunks({ done, total }),
          onProgress: setVidPct,
          signal: abort.signal,
        });
        saveBlob(data, `${safeTitle}_${h}p.${videoFmt.ext || "mp4"}`);
        setPhase("done");
        return;
      }

      // ── video-only: true parallel pipeline ────────────────────────────────
      if (!mergeAudio) throw new Error("No audio stream available");

      // 1. Load FFmpeg
      setPhase("loading_ff");
      const ff = await getFFmpeg(msg => setFfLog(msg.slice(0, 140)));

      const vExt = videoFmt.ext || "webm";
      const aExt = mergeAudio.ext || "m4a";

      // 2. TRUE PARALLEL PIPELINE ─────────────────────────────────────────────
      //    Each arm downloads its stream in chunks, then immediately writes
      //    to FFmpeg VFS — without waiting for the other stream to finish.
      //    Merge starts as soon as both arms have completed their FS write.
      setPhase("pipeline");

      await Promise.all([
        // ─ VIDEO ARM ──────────────────────────────────────────────────────────
        (async () => {
          const data = await fetchChunked(videoFmt.url, {
            totalSize:  videoFmt.filesize,
            onChunk:    (done, total) => setVidChunks({ done, total }),
            onProgress: setVidPct,
            signal:     abort.signal,
          });
          setVidWrite("writing");
          await ff.writeFile(`v.${vExt}`, data);
          setVidWrite("done");
        })(),

        // ─ AUDIO ARM ──────────────────────────────────────────────────────────
        (async () => {
          const data = await fetchChunked(mergeAudio.url, {
            totalSize:  mergeAudio.filesize,
            onChunk:    (done, total) => setAudChunks({ done, total }),
            onProgress: setAudPct,
            signal:     abort.signal,
          });
          setAudWrite("writing");
          await ff.writeFile(`a.${aExt}`, data);
          setAudWrite("done");
        })(),
      ]);

      // 3. Both streams are in FFmpeg VFS ─ now merge ─────────────────────────
      setPhase("merging");
      setMergePct(0);

      const onProgress = ({ progress: p }) => {
        setMergePct(Math.max(0, Math.min(100, Math.round(p * 100))));
      };
      ff.on("progress", onProgress);
      ffProgressRef.current = () => ff.off("progress", onProgress);

      await ff.exec([
        "-i", `v.${vExt}`,
        "-i", `a.${aExt}`,
        "-c:v", "copy",
        ...(aExt === "m4a" ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "192k"]),
        "-movflags", "+faststart",
        "-y", "out.mp4",
      ]);

      ffProgressRef.current?.();

      const out = await ff.readFile("out.mp4");
      saveBlob(out, `${safeTitle}_${h}p.mp4`);

      for (const f of [`v.${vExt}`, `a.${aExt}`, "out.mp4"]) {
        try { await ff.deleteFile(f); } catch { /* already gone */ }
      }

      setMergePct(100);
      setPhase("done");
    } catch (e) {
      ffProgressRef.current?.();
      if (e.name === "AbortError") { setPhase("idle"); return; }
      console.error("[downloadVideo]", e);
      setPhase("error"); setErrMsg(e.message);
    }
  }, [info, selHeight, mergeAudio]);

  // ── download MP3 ──────────────────────────────────────────────────────────
  const downloadMp3 = useCallback(async () => {
    if (!bestAudio) return;

    const abort = new AbortController();
    abortRef.current = abort;
    resetProgress();

    try {
      setPhase("loading_ff");
      const ff = await getFFmpeg(msg => setFfLog(msg.slice(0, 140)));

      setPhase("dl_mp3_audio");
      const audioData = await fetchChunked(bestAudio.url, {
        totalSize:  bestAudio.filesize,
        onChunk:    (done, total) => setAudChunks({ done, total }),
        onProgress: setAudPct,
        signal:     abort.signal,
      });

      setPhase("encoding_mp3");
      setMergePct(0);

      const aExt = bestAudio.ext || "m4a";
      await ff.writeFile(`a.${aExt}`, audioData);

      const onProgress = ({ progress: p }) => {
        setMergePct(Math.max(0, Math.min(100, Math.round(p * 100))));
      };
      ff.on("progress", onProgress);
      ffProgressRef.current = () => ff.off("progress", onProgress);

      await ff.exec(["-i", `a.${aExt}`, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", "-y", "out.mp3"]);

      ffProgressRef.current?.();

      const out = await ff.readFile("out.mp3");
      const safeTitle = safeFileName(info.title, "audio");
      saveBlob(out, `${safeTitle}.mp3`, "audio/mpeg");

      try { await ff.deleteFile(`a.${aExt}`); } catch { /* already gone */ }
      try { await ff.deleteFile("out.mp3"); } catch { /* already gone */ }

      setMergePct(100);
      setPhase("done");
    } catch (e) {
      ffProgressRef.current?.();
      if (e.name === "AbortError") { setPhase("idle"); return; }
      console.error("[downloadMp3]", e);
      setPhase("error"); setErrMsg(e.message);
    }
  }, [info, bestAudio]);

  const cancel = () => {
    ffProgressRef.current?.();
    abortRef.current?.abort();
    setPhase("idle");
    setErrMsg("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const isMuxedSel = info.formats.some(f => f.height === Number(selHeight) && f.type === "muxed");

  // Best first, with the size of each and a tag for HD and up.
  const options = [...videoHeights].reverse().map(h => {
    const size = info.formats
      .filter(f => (f.type === "video" || f.type === "muxed") && f.height === h)
      .map(f => f.filesize).filter(Boolean).sort((a, b) => b - a)[0];
    return {
      value: String(h),
      label: `${h}p`,
      detail: size ? `~${fmtBytes(size)}` : "",
      badge: h >= 2160 ? "4K" : h >= 1440 ? "2K" : h >= 720 ? "HD" : undefined,
    };
  });

  return (
    <div className="space-y-6">
      <MediaHeader
        site="youtube"
        title={info.title}
        byline={info.uploader}
        thumbnail={info.thumbnail}
        duration={info.duration > 0 ? fmtDuration(info.duration) : null}
      >
        <p className="mt-2 text-[13px] text-subtle">
          {videoHeights.length} {videoHeights.length === 1 ? "quality" : "qualities"}
          {bestAudio ? " · MP3 audio" : ""}
        </p>
      </MediaHeader>

      <QualityPicker
        id="ytc-quality"
        name="yt-quality"
        options={options}
        value={selHeight}
        onChange={setSelH}
        disabled={busy}
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            id="ytc-dl-video"
            type="button"
            onClick={downloadVideo}
            disabled={busy || !selHeight}
            className="btn btn-lg btn-primary sm:flex-1"
          >
            <IconDownload size={18} />
            Download {selHeight}p
          </button>
          {bestAudio && (
            <button
              id="ytc-dl-mp3"
              type="button"
              onClick={downloadMp3}
              disabled={busy}
              title={bestAudio.abr ? `${Math.round(bestAudio.abr)} kbps source` : undefined}
              className="btn btn-lg btn-secondary"
            >
              <IconMusic size={18} />
              Audio only (MP3)
            </button>
          )}
        </div>
        {!isMuxedSel && phase === "idle" && (
          <p className="flex gap-2 text-[13px] leading-5 text-subtle">
            <IconInfo size={16} className="mt-0.5" />
            YouTube sends this quality as separate video and sound. Media Saver joins them in your browser, which takes
            a little longer.
          </p>
        )}
      </div>

      {/* ── Progress ───────────────────────────────────────────────────────── */}
      {busy && (
        <div className="motion-safe:animate-fade-up space-y-4 rounded-2xl border border-line bg-sunken/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2.5 text-sm font-semibold text-fg">
              <Spinner size={16} className="text-accent-ink" />
              {PHASE_LABELS[phase]}
            </p>
            <button type="button" onClick={cancel} className="btn btn-sm btn-ghost -mr-1">
              Cancel
            </button>
          </div>

          {phase === "loading_ff" && (
            <div className="space-y-2">
              <ProgressBar value={null} />
              <p className="text-xs leading-5 text-subtle">
                The first time, your browser fetches the free FFmpeg tools (about 30 MB) that join video and sound.
              </p>
            </div>
          )}

          {(phase === "dl_muxed" || phase === "dl_mp3_audio") && (
            <TrackRow
              label={phase === "dl_muxed" ? "Video" : "Audio"}
              icon={phase === "dl_muxed" ? <IconFilm size={16} /> : <IconMusic size={16} />}
              chunks={phase === "dl_muxed" ? vidChunks : audChunks}
              pct={phase === "dl_muxed" ? vidPct : audPct}
              write="idle"
            />
          )}

          {(phase === "pipeline" || phase === "merging") && (
            <div className={`space-y-3.5 ${phase === "merging" ? "opacity-60" : ""}`}>
              <TrackRow label="Video" icon={<IconFilm size={16} />} chunks={vidChunks} pct={vidPct} write={phase === "merging" ? "done" : vidWrite} />
              <TrackRow label="Sound" icon={<IconMusic size={16} />} chunks={audChunks} pct={audPct} write={phase === "merging" ? "done" : audWrite} />
            </div>
          )}

          {(phase === "merging" || phase === "encoding_mp3") && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-fg">{phase === "merging" ? "Joining" : "Converting"}</span>
                <span className="tabular-nums text-subtle">{mergePct}%</span>
              </div>
              <ProgressBar value={mergePct === 0 ? null : mergePct} tone="warn" />
              {ffLog && <p className="truncate font-mono text-[11px] text-subtle">{ffLog}</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {phase === "error" && (
        <Alert onRetry={() => setPhase("idle")}>{errMsg || "Something went wrong. Please try again."}</Alert>
      )}

      {/* ── Done ──────────────────────────────────────────────────────────── */}
      {phase === "done" && <SavedNote result="saved" onDismiss={() => setPhase("idle")} />}
    </div>
  );
}