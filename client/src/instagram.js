// Instagram reel lookup, run in the browser through the Media Saver bookmark.
//
// Instagram only lets instagram.com read its pages, so the lookup goes through
// an Instagram tab the bookmark was clicked in (./youtube/bridge.js). Two of
// Instagram's pages carry a post's video details for logged-out visitors, as
// long as the request asks for HTML:
//
//  • the embed page, on phones and computers alike; and
//  • the full reel page, on computers only, which still works when the owner
//    has turned embedding off.
//
// The requests carry no cookies, so they see exactly what a logged-out visitor
// sees. The video file itself is on Instagram's CDN, which lets any site read
// it, so the site downloads it directly.
import { helperRequest } from "./youtube/bridge";
import { shorten } from "./text";

const ASK_FOR_HTML = { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" };

/** The shortcode in an Instagram reel or post link, or null. */
export function extractInstagramCode(url) {
  try {
    const match = new URL(url).pathname.match(/^\/(?:[\w.]+\/)?(?:reels?|p|tv)\/([\w-]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Instagram writes each video file's encoding into its URL's efg parameter:
// base64 JSON such as {"vencode_tag":"…C3.720.dash_baseline…"}.
function heightFromUrl(url) {
  try {
    const efg = new URL(url).searchParams.get("efg");
    const { vencode_tag: tag } = JSON.parse(atob(efg.replace(/-/g, "+").replace(/_/g, "/")));
    const height = tag?.match(/\.(\d{3,4})\./);
    return height ? Number(height[1]) : null;
  } catch {
    return null;
  }
}

// Depth-first search for the first object that satisfies `test`.
function find(node, test) {
  if (!node || typeof node !== "object") return null;
  if (test(node)) return node;
  for (const value of Object.values(node)) {
    const hit = find(value, test);
    if (hit) return hit;
  }
  return null;
}

// A quote ends a JSON string unless an odd number of backslashes escape it.
function isRealQuote(text, i) {
  if (text[i] !== '"') return false;
  let slashes = 0;
  for (let j = i - 1; j >= 0 && text[j] === "\\"; j--) slashes++;
  return slashes % 2 === 0;
}

// The embed page holds the post as JSON inside a JSON string in one of its
// scripts. Find the string around the video URL and decode it twice.
function fromEmbedPage(html, code) {
  const at = html.indexOf('\\"video_url\\"');
  if (at < 0) return null;
  let open = at;
  let close = at;
  while (open > 0 && !isRealQuote(html, open)) open--;
  while (close < html.length && !isRealQuote(html, close)) close++;
  let data;
  try {
    data = JSON.parse(JSON.parse(html.slice(open, close + 1)));
  } catch {
    return null;
  }
  const media = find(data, (o) => o.shortcode === code && typeof o.video_url === "string");
  if (!media) return null;
  return {
    urls: [media.video_url],
    owner: media.owner?.username || "",
    caption: media.edge_media_to_caption?.edges?.[0]?.node?.text || "",
    thumbnail: media.display_url || media.thumbnail_src || "",
  };
}

// The full reel page holds many JSON blobs. Find the media object for this
// shortcode, preferring the copy that carries the video's details.
function fromReelPage(html, code) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  let photo = null;
  for (const script of doc.querySelectorAll('script[type="application/json"]')) {
    if (!script.textContent.includes(`"${code}"`)) continue;
    let data;
    try {
      data = JSON.parse(script.textContent);
    } catch {
      continue;
    }
    const media = find(data, (o) => o.code === code && Array.isArray(o.video_versions));
    if (media) {
      return {
        urls: media.video_versions.map((v) => v.url),
        owner: media.user?.username || media.owner?.username || "",
        caption: media.caption?.text || "",
        thumbnail: media.image_versions2?.candidates?.[0]?.url || media.display_uri || "",
      };
    }
    photo ||= Boolean(find(data, (o) => o.code === code && o.media_type));
  }
  return photo ? { notVideo: true } : null;
}

/**
 * Look up an Instagram reel or video post through the bookmark relay.
 * @param {string} code  the post's shortcode, from extractInstagramCode()
 * @returns {Promise<{ code: string, title: string, owner: string, thumbnail: string,
 *   formats: { label: string, url: string, height: number|null }[] }>}
 *   formats run from the highest quality down.
 * @throws {Error} with a message suitable for showing to the user
 */
export async function getInstagramReel(code) {
  const statuses = [];
  let notVideo = false;
  for (const [path, read] of [[`p/${code}/embed/captioned/`, fromEmbedPage], [`reel/${code}/`, fromReelPage]]) {
    const res = await helperRequest(`https://www.instagram.com/${path}`, { headers: ASK_FOR_HTML });
    statuses.push(res.status);
    if (res.status !== 200) continue;
    const media = read(new TextDecoder().decode(res.body), code);
    if (media?.notVideo) notVideo = true;
    else if (media) return toReel(code, media);
  }
  if (notVideo) throw new Error("This Instagram post isn't a single video. Media Saver downloads reels and video posts.");
  if (statuses.every((s) => s === 404)) throw new Error("This Instagram post doesn't exist or was removed");
  throw new Error(
    "Instagram didn't share this reel. It may be private, or Instagram may be limiting logged-out visits for a while. Try again in a few minutes.",
  );
}

function toReel(code, { urls, owner, caption, thumbnail }) {
  // Instagram often lists the same file more than once.
  const formats = [];
  for (const url of new Set(urls)) {
    const height = heightFromUrl(url);
    formats.push({ url, height, label: height ? `${height}p` : `Version ${formats.length + 1}` });
  }
  formats.sort((a, b) => (b.height || 0) - (a.height || 0));
  const title = shorten(caption.split("\n")[0].trim(), 100);
  return {
    code,
    title: title || (owner ? `Reel by @${owner}` : "Instagram reel"),
    owner,
    thumbnail,
    formats,
  };
}
