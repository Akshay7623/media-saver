import { helperFetch } from "./bridge";

// VISIONOS is the client that currently returns direct, downloadable stream
// URLs without a proof-of-origin token (yt-dlp uses it too). The others either
// need a PO token — YouTube then cuts the download off with 403 partway through
// the file — or return no streams at all.
const CLIENT = "VISIONOS";

export function extractVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("v")) return parsed.searchParams.get("v");
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;
    const path = parsed.pathname.match(/\/(?:shorts|embed|live)\/([^/?]+)/);
    if (path) return path[1];
  } catch {
    // not a URL
  }
  return null;
}

// One YouTube.js session for the page, created on first use. The library is
// loaded lazily so Twitter-only visitors never download it.
let sessionPromise = null;

function getSession(fresh = false) {
  if (!sessionPromise || fresh) {
    sessionPromise = import("youtubei.js/web").then(({ Innertube }) =>
      Innertube.create({
        fetch: helperFetch,
        // A locally generated session gets YouTube's bot check; a real one
        // fetched from YouTube does not.
        generate_session_locally: false,
        // VISIONOS URLs need no signature deciphering, so skip the player JS.
        retrieve_player: false,
      }),
    );
    sessionPromise.catch(() => { sessionPromise = null; });
  }
  return sessionPromise;
}

const extOf = (mime) => {
  const [type, sub] = mime.split(";")[0].split("/");
  return type === "audio" && sub === "mp4" ? "m4a" : sub;
};

// H.264 plays everywhere; VP9 and AV1 need newer players.
const codecRank = (mime) => (/avc1/.test(mime) ? 0 : /vp0?9/.test(mime) ? 1 : 2);

function toFormat(f, type) {
  return {
    type,
    itag: f.itag,
    ext: extOf(f.mime_type),
    url: f.url,
    mime: f.mime_type,
    height: f.height || null,
    width: f.width || null,
    fps: f.fps || null,
    abr: type === "audio" ? Math.round(f.bitrate / 1000) : null, // kbps
    filesize: Number(f.content_length) || null,
  };
}

/**
 * Look up a YouTube video's streams through the helper.
 * @returns {Promise<{ title: string, duration: number, thumbnail: string, uploader: string,
 *   formats: { type: "muxed"|"video"|"audio", ext: string, url: string, height: number|null,
 *              abr: number|null, filesize: number|null }[] }>}
 * @throws {Error} with a message suitable for showing to the user
 */
export async function getYouTubeVideo(url) {
  const id = extractVideoId(url);
  if (!id) throw new Error("Could not find a video ID in this YouTube link");

  // Retry once with a new session — an old one can start getting refused.
  let info;
  for (const fresh of [false, true]) {
    const yt = await getSession(fresh);
    info = await yt.getBasicInfo(id, { client: CLIENT });
    if (info.playability_status?.status === "OK") break;
  }
  const playability = info.playability_status;
  if (playability?.status !== "OK") {
    throw new Error(`YouTube says: ${playability?.reason || "this video can't be played"}`);
  }

  const streaming = info.streaming_data;
  const adaptive = (streaming?.adaptive_formats || []).filter((f) => f.url);
  const muxed = (streaming?.formats || []).filter((f) => f.url);

  // Video: one stream per height, preferring the most compatible codec.
  const byHeight = new Map();
  for (const f of adaptive.filter((f) => f.has_video && !f.has_audio && f.height)) {
    const cur = byHeight.get(f.height);
    const better = !cur
      || codecRank(f.mime_type) < codecRank(cur.mime_type)
      || (codecRank(f.mime_type) === codecRank(cur.mime_type) && f.bitrate > cur.bitrate);
    if (better) byHeight.set(f.height, f);
  }

  // Audio: dubbed videos carry a set of tracks per language (often 20+).
  // Keep the original language — else the default track — so the "best
  // bitrate" pick can't land on a dub. Skip the volume-normalised DRC copies.
  let audio = adaptive.filter((f) => f.has_audio && !f.has_video && !f.is_drc);
  const original = audio.filter((f) => f.is_original);
  const byDefault = audio.filter((f) => f.audio_track?.audio_is_default);
  audio = original.length ? original : byDefault.length ? byDefault : audio;

  const formats = [
    ...muxed.map((f) => toFormat(f, "muxed")),
    ...[...byHeight.values()].map((f) => toFormat(f, "video")),
    ...audio.map((f) => toFormat(f, "audio")),
  ];
  if (!formats.some((f) => f.height)) {
    throw new Error("No downloadable video streams found for this link");
  }

  const basic = info.basic_info;
  return {
    title: basic.title || "YouTube Video",
    duration: basic.duration || 0,
    thumbnail: basic.thumbnail?.[0]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    uploader: basic.author || "",
    formats,
  };
}
