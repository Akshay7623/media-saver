// The download tool: the link box, and below it whatever the link needs, a
// setup panel, or the video ready to download.
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTweetVideo } from "../twitter";
import { detectHelper, isRelayed, relaySite } from "../youtube/bridge";
import { extractInstagramCode, getInstagramReel } from "../instagram";
import { extractVideoId, getYouTubeVideo } from "../youtube/youtube";
import { safeFileName } from "../download";
import SetupPanel from "./SetupPanel";
import { SimpleResult } from "./MediaResult";
import { Alert, SITES, Spinner } from "./ui";
import { IconArrowRight, IconClose, IconLink, IconPaste } from "./icons";

// FFmpeg and the YouTube panel load only when a YouTube video is found.
const YTClientDownloader = lazy(() => import("./YTClientDownloader"));

function parseURL(string) {
  try {
    return new URL(string);
  } catch {
    return null;
  }
}

// The link in what was pasted: share sheets often add the title around it,
// and people often leave off https://.
function findLink(text) {
  const t = text.trim();
  const inText = t.match(/https?:\/\/[^\s<>"']+/i);
  if (inText) return parseURL(inText[0]);
  if (/^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(t)) return parseURL(`https://${t}`);
  return null;
}

// Exact host or a true subdomain of it (www., m., mobile., …)
const matchesDomain = (hostname, domain) => hostname === domain || hostname.endsWith("." + domain);

const TWITTER_DOMAINS = ["twitter.com", "x.com", "t.co"];
const YOUTUBE_DOMAINS = ["youtube.com", "youtu.be", "youtube-nocookie.com"];
const INSTAGRAM_DOMAINS = ["instagram.com", "instagr.am"];

// Extracting video from these sites needs a server (their pages and CDNs block
// cross-origin reads), which this static build doesn't have.
const UNSUPPORTED = [{ name: "Facebook", domains: ["facebook.com", "fb.watch", "fb.me"] }];

/** "youtube" | "instagram" | "x" | "file" | "unsupported" | null (not a link). */
function siteOf(parsed) {
  if (!parsed || !/^https?:$/.test(parsed.protocol)) return null;
  const on = (domains) => domains.some((d) => matchesDomain(parsed.hostname, d));
  if (on(YOUTUBE_DOMAINS)) return "youtube";
  if (on(INSTAGRAM_DOMAINS)) return "instagram";
  if (on(TWITTER_DOMAINS)) return "x";
  if (UNSUPPORTED.some((p) => on(p.domains))) return "unsupported";
  return "file";
}

// Wording and links for the setup panel, by the site the link is from.
function setupFor(site, url) {
  return site === "instagram"
    ? { site, name: "Instagram", noun: "reel", url, phoneUrl: url, keepOpen: "" }
    : {
        site,
        name: "YouTube",
        noun: "video",
        url,
        // The mobile site's address, so Chrome doesn't redirect through www.youtube.com.
        phoneUrl: url.replace("://www.", "://m."),
        keepOpen: " Keep the YouTube tab open until it finishes.",
      };
}

function fileNameFromUrl(url) {
  try {
    const last = decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() || "");
    return safeFileName(last, "video");
  } catch {
    return "video";
  }
}

const canPaste = typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function";

function ResultSkeleton() {
  return (
    <div className="card p-5 sm:p-7" aria-hidden="true">
      <div className="flex gap-4">
        <div className="skeleton aspect-video w-32 flex-none rounded-xl sm:w-44" />
        <div className="flex-1 space-y-3 py-1">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`skeleton h-14 rounded-xl ${i === 3 ? "hidden sm:block" : ""}`} />
        ))}
      </div>
    </div>
  );
}

export default function InputBox() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null); // { message, retry } shown under the box
  const [busy, setBusy] = useState(false); // looking a link up
  const [ytBusy, setYtBusy] = useState(false); // a YouTube download or merge is running
  // What the last link needs: { kind: "youtube", info } | { kind: "setup", setup }
  // | { kind: "instagram", reel } | { kind: "x", tweet } | { kind: "file", url }
  const [result, setResult] = useState(null);
  // Counts lookups, so each result gets a fresh card: a setup panel for a new
  // link mustn't keep the old one's "Copied" buttons.
  const [lookups, setLookups] = useState(0);
  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const navigate = useNavigate();

  const typedSite = siteOf(findLink(url));

  const lookup = async (target = url) => {
    // Fetching a new link would replace the YouTube panel mid-download.
    if (busy || ytBusy) return;

    const parsed = findLink(target);
    const site = siteOf(parsed);
    if (!site) {
      setError({ message: "That doesn't look like a link. Copy the video's address and paste it here." });
      inputRef.current?.focus();
      return;
    }
    if (site === "unsupported") {
      const { name } = UNSUPPORTED.find((p) => p.domains.some((d) => matchesDomain(parsed.hostname, d)));
      setError({ message: `${name} links aren't supported yet. YouTube, Instagram, X and direct video links work.` });
      return;
    }
    if (parsed.href !== target.trim()) setUrl(parsed.href);
    setError(null);
    setResult(null);
    setLookups((n) => n + 1);

    const fail = (e) => setError({ message: e.message, retry: true });

    if (site === "youtube") {
      const id = extractVideoId(parsed.href);
      if (!id) {
        setError({ message: "Couldn't find a video in this YouTube link. Open the video and copy its link again." });
        return;
      }
      setBusy(true);
      try {
        // A tab connected through Instagram can't reach YouTube.
        if (relaySite === "instagram" || !(await detectHelper())) {
          // Hand the bookmark a youtube.com watch page whatever form the link
          // took (youtu.be, /shorts/, youtube-nocookie.com embeds…).
          setResult({ kind: "setup", setup: setupFor("youtube", `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`) });
          return;
        }
        const info = await getYouTubeVideo(parsed.href);
        setResult({ kind: "youtube", info: { ...info, url: parsed.href } });
      } catch (e) {
        fail(e);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (site === "instagram") {
      const code = extractInstagramCode(parsed.href);
      if (!code) {
        setError({ message: "Couldn't find a reel or video post in this Instagram link." });
        return;
      }
      setBusy(true);
      try {
        // Only the bookmark, clicked in an Instagram tab, can reach Instagram.
        if (relaySite !== "instagram" || !(await detectHelper())) {
          setResult({ kind: "setup", setup: setupFor("instagram", `https://www.instagram.com/reel/${code}/`) });
          return;
        }
        setResult({ kind: "instagram", reel: await getInstagramReel(code) });
      } catch (e) {
        fail(e);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (site === "file") {
      // Anything else is treated as a direct link to a video file.
      setResult({ kind: "file", url: parsed.href });
      return;
    }

    setBusy(true);
    try {
      setResult({ kind: "x", tweet: await getTweetVideo(parsed.href) });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const paste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) {
        setUrl(text);
        lookup(text);
        return;
      }
    } catch {
      // Reading the clipboard was refused; the visitor can paste by hand.
    }
    inputRef.current?.focus();
  };

  // The bookmark opens /?url=<video>: fill it in and fetch straight away.
  // The ref stops StrictMode's double effect run from fetching twice.
  const handledUrlParam = useRef(false);
  useEffect(() => {
    if (handledUrlParam.current) return;
    handledUrlParam.current = true;
    const linked = new URLSearchParams(window.location.search).get("url");
    if (window.location.search) navigate({ pathname: "/", hash: window.location.hash }, { replace: true, preventScrollReset: true });
    if (!linked) return;
    setUrl(linked);
    lookup(linked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bring a new result into view, mostly for phones where it lands below the fold.
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  const locked = busy || ytBusy;
  const TypedMark = typedSite && SITES[typedSite]?.Mark;

  const submit = (
    <>
      {busy ? <Spinner /> : null}
      {busy ? "Finding…" : "Get video"}
      {!busy && <IconArrowRight size={18} />}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      {isRelayed && (
        <p className="mb-4 flex items-center justify-center gap-2.5 text-[13px] font-medium text-muted">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-ink dark:bg-accent" />
          </span>
          Connected to your {relaySite === "instagram" ? "Instagram" : "YouTube"} tab. Keep it open and paste any{" "}
          {relaySite === "instagram" ? "Instagram" : "YouTube"} link.
        </p>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
        className={`rounded-[22px] border bg-card p-2 text-left shadow-lift transition-[border-color,box-shadow] duration-200 focus-within:border-fg/25 focus-within:ring-4 focus-within:ring-accent/40 ${
          error && !error.retry ? "border-danger/50" : "border-line-strong"
        }`}
      >
        <div className="flex items-center gap-1">
          <span
            className={`grid h-12 w-10 flex-none place-items-center transition-colors sm:w-11 ${
              TypedMark ? SITES[typedSite].color : "text-subtle"
            }`}
          >
            {TypedMark ? <TypedMark size={22} /> : <IconLink size={22} />}
          </span>
          <label htmlFor="video-url" className="sr-only">
            Video link
          </label>
          <input
            id="video-url"
            ref={inputRef}
            type="text"
            inputMode="url"
            enterKeyHint="go"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste a video link"
            className="h-12 min-w-0 flex-1 bg-transparent text-base text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-none"
          />
          {url ? (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setError(null);
                inputRef.current?.focus();
              }}
              aria-label="Clear link"
              className="grid h-10 w-10 flex-none place-items-center rounded-xl text-subtle transition-colors hover:bg-sunken hover:text-fg"
            >
              <IconClose size={18} />
            </button>
          ) : canPaste ? (
            <button type="button" onClick={paste} className="btn btn-sm btn-ghost flex-none">
              <IconPaste size={17} />
              Paste
            </button>
          ) : null}
          <button type="submit" disabled={locked} className="btn btn-lg btn-primary hidden flex-none sm:inline-flex">
            {submit}
          </button>
        </div>
        <button type="submit" disabled={locked} className="btn btn-lg btn-primary mt-2 w-full sm:hidden">
          {submit}
        </button>
      </form>

      <ul
        aria-label="Supported sites"
        className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-muted"
      >
        {[
          ["youtube", "YouTube"],
          ["instagram", "Instagram"],
          ["x", "X / Twitter"],
          ["file", "Video links"],
        ].map(([site, label]) => {
          const { Mark, color } = SITES[site];
          return (
            <li key={site} className="flex items-center gap-1.5">
              <Mark size={16} className={color} />
              {label}
            </li>
          );
        })}
      </ul>

      <div ref={resultRef} aria-live="polite" className="mt-8 scroll-mb-6 space-y-4 text-left">
        {error && <Alert onRetry={error.retry ? () => lookup() : undefined}>{error.message}</Alert>}
        {busy && <ResultSkeleton />}
        {result && (
          <div key={lookups} className="card motion-safe:animate-fade-up p-5 sm:p-7">
            {result.kind === "youtube" && (
              <Suspense fallback={<div className="skeleton h-44" />}>
                {/* key: a different video remounts the panel with fresh state */}
                <YTClientDownloader key={result.info.url} info={result.info} onBusyChange={setYtBusy} />
              </Suspense>
            )}

            {result.kind === "setup" && <SetupPanel setup={result.setup} />}

            {result.kind === "instagram" && (
              <SimpleResult
                key={result.reel.code}
                site="instagram"
                title={result.reel.title}
                byline={result.reel.owner ? `@${result.reel.owner}` : ""}
                thumbnail={result.reel.thumbnail}
                portrait
                formats={result.reel.formats.map((f) => ({ value: f.url, label: f.label, detail: "MP4 with sound" }))}
                // Instagram's CDN lets any site read its files, so no bookmark is needed here.
                fileName={() => `instagram-${result.reel.owner || "reel"}-${result.reel.code}`.replace(/[^\w.-]/g, "_") + ".mp4"}
                downloadId="ig-download"
                footnote="Instagram offers reels as one file with sound, at up to 720p."
              />
            )}

            {result.kind === "x" && (
              <SimpleResult
                key={result.tweet.formats[0]?.url}
                site="x"
                title={result.tweet.title}
                thumbnail={result.tweet.thumbnail}
                formats={[...result.tweet.formats].reverse().map((f) => ({ value: f.url, label: f.label, detail: "MP4" }))}
                fileName={(f) => `${safeFileName(result.tweet.title, "x-video")} (${f.label}).mp4`}
                downloadId="x-download"
              />
            )}

            {result.kind === "file" && (
              <SimpleResult
                key={result.url}
                site="file"
                title={fileNameFromUrl(result.url)}
                byline={new URL(result.url).hostname}
                formats={[{ value: result.url, label: "video" }]}
                fileName={() => {
                  const name = fileNameFromUrl(result.url);
                  return /\.[a-z0-9]{2,5}$/i.test(name) ? name : `${name}.mp4`;
                }}
                downloadId="file-download"
              >
                <video
                  controls
                  preload="metadata"
                  src={result.url}
                  className="max-h-[420px] w-full rounded-2xl border border-line bg-black"
                />
              </SimpleResult>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-subtle">
        By using Media Saver you agree to the{" "}
        <Link to="/t-and-c" className="underline underline-offset-2 hover:text-fg">
          terms of use
        </Link>
        .
      </p>
    </div>
  );
}
