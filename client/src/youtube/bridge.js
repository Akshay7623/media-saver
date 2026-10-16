// Page side of the Media Saver helper bridge.
//
// Browsers won't let this site read YouTube's or Instagram's pages and APIs:
// each only allows its own site. So those requests go through one of two
// helpers, which speak the same window.postMessage protocol:
//
//  • the userscript (client/userscript/media-saver.user.js), running on this
//    site in Tampermonkey/Violentmonkey, which performs them with
//    GM_xmlhttpRequest. YouTube only; or
//  • the bookmarklet (./bookmarklet.js): clicked on a YouTube or Instagram
//    tab, it opens this site with ?relay=<that origin> and performs them from
//    that tab, where code runs as youtube.com or instagram.com.
//
// Either way requests go out from the visitor's own connection, without cookies.

const CHANNEL = "media-saver-bridge";

// Read before InputBox strips the query string from the address bar.
const relayOrigin = new URLSearchParams(window.location.search).get("relay");
const relay = window.opener && /^https:\/\/((www|m)\.youtube|www\.instagram)\.com$/.test(relayOrigin || "")
  ? { target: window.opener, origin: relayOrigin }
  : null;

/** True in a tab the bookmarklet opened: requests go through the tab it was clicked in. */
export const isRelayed = relay !== null;

/**
 * Which site that tab is on: "youtube", "instagram", or null with no relay.
 * A tab can only reach its own site, so a YouTube tab can't look up Instagram
 * reels, and an Instagram tab can't look up YouTube videos.
 */
export const relaySite = !relay ? null : relay.origin.endsWith(".instagram.com") ? "instagram" : "youtube";

// Phones get YouTube's mobile site. There www.youtube.com is another origin,
// and YouTube won't let m.youtube.com read some of its answers, such as the
// session data. The mobile site serves the same paths itself, so a relay on it
// gets www.youtube.com requests sent to its own host. Done here rather than in
// the bookmarklet so bookmarks visitors already saved pick it up.
const onMobileYouTube = relay?.origin === "https://m.youtube.com";
function toRelayHost(url) {
  if (!onMobileYouTube) return url;
  const u = new URL(url);
  if (u.host !== "www.youtube.com") return url;
  u.host = "m.youtube.com";
  return u.href;
}

let helperVersion = null;
let helloWaiters = [];
let nextId = 1;
const pending = new Map(); // id -> { resolve, reject, onProgress }

const fromHelper = (event) =>
  relay
    ? event.source === relay.target && event.origin === relay.origin
    : event.origin === window.location.origin;

window.addEventListener("message", (event) => {
  if (!fromHelper(event)) return;
  const msg = event.data;
  if (!msg || msg.channel !== CHANNEL) return;

  switch (msg.kind) {
    case "hello":
      helperVersion = msg.version;
      helloWaiters.forEach((resolve) => resolve(msg.version));
      helloWaiters = [];
      break;
    case "progress":
      pending.get(msg.id)?.onProgress?.(msg.loaded, msg.total);
      break;
    case "response":
    case "error": {
      const p = pending.get(msg.id);
      if (!p) break;
      pending.delete(msg.id);
      if (msg.kind === "response") p.resolve(msg);
      else p.reject(new Error(msg.message));
      break;
    }
  }
});

const post = (msg) =>
  relay
    ? relay.target.postMessage({ channel: CHANNEL, ...msg }, relay.origin)
    : window.postMessage({ channel: CHANNEL, ...msg }, window.location.origin);

// The bookmarklet's tab does the fetching: if it's closed, fail what's in
// flight instead of leaving the download hanging forever.
// `permanent` tells retry loops not to bother: the tab won't come back.
const relayClosed = () =>
  Object.assign(new Error("The YouTube tab was closed. Open YouTube and click the Media Saver bookmark again."), { permanent: true });
if (relay) {
  const watchdog = setInterval(() => {
    if (!relay.target.closed) return;
    clearInterval(watchdog);
    for (const p of pending.values()) p.reject(relayClosed());
    pending.clear();
  }, 1000);
}

/** Resolves to the helper's version string, or null if it isn't installed. */
export function detectHelper(timeoutMs = 1500) {
  if (helperVersion) return Promise.resolve(helperVersion);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    helloWaiters.push((version) => {
      clearTimeout(timer);
      resolve(version);
    });
    post({ kind: "ping" });
  });
}

const abortError = () => new DOMException("Aborted", "AbortError");

/**
 * Perform one HTTP request through the helper.
 * @param {string} url
 * @param {{ method?: string, headers?: Record<string,string>, body?: string|ArrayBuffer,
 *           signal?: AbortSignal, onProgress?: (loaded: number, total: number) => void }} [opts]
 * @returns {Promise<{ status: number, headers: string, body: ArrayBuffer }>}
 *   `headers` is the raw response header block.
 */
export function helperRequest(url, { method = "GET", headers = {}, body, signal, onProgress } = {}) {
  if (signal?.aborted) return Promise.reject(abortError());
  if (relay?.target.closed) return Promise.reject(relayClosed());
  const id = nextId++;

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      pending.delete(id);
      post({ kind: "abort", id });
      reject(abortError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    const settle = (fn) => (value) => {
      signal?.removeEventListener("abort", onAbort);
      fn(value);
    };

    pending.set(id, { resolve: settle(resolve), reject: settle(reject), onProgress });
    post({ kind: "request", id, url: toRelayHost(url), method, headers, body });
  });
}

/** Parse a raw header block into a Headers object. */
export function parseHeaders(raw) {
  const headers = new Headers();
  for (const line of (raw || "").split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i <= 0) continue;
    try {
      headers.append(line.slice(0, i).trim(), line.slice(i + 1).trim());
    } catch {
      // Skip header names the Headers API rejects.
    }
  }
  return headers;
}

/** fetch()-compatible wrapper around helperRequest, handed to YouTube.js. */
export async function helperFetch(input, init = {}) {
  const isRequest = input instanceof Request;
  const url = isRequest ? input.url : String(input);
  const method = init.method || (isRequest ? input.method : "GET");
  // A standalone Headers object keeps names a Request would silently drop
  // (e.g. the User-Agent YouTube.js sets for its client), so read init first.
  const headers = Object.fromEntries(
    new Headers(init.headers || (isRequest ? input.headers : undefined)),
  );

  let body = init.body ?? (isRequest && method !== "GET" ? await input.arrayBuffer() : undefined);
  if (body != null && typeof body !== "string") body = await new Response(body).arrayBuffer();

  const res = await helperRequest(url, { method, headers, body, signal: init.signal });
  const nullBody = [101, 204, 205, 304].includes(res.status);
  return new Response(nullBody ? null : res.body, {
    status: res.status,
    headers: parseHeaders(res.headers),
  });
}
