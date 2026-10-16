// Twitter/X video lookup, run directly in the browser. Both public APIs below
// send Access-Control-Allow-Origin: *, and video.twimg.com allows cross-origin
// reads, so the whole flow works without a backend.

import { shorten } from "./text";

const TIMEOUT_MS = 12000;

function extractTweetInfo(url) {
  const match = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
  if (match) return { username: match[1], tweetId: match[2] };
  const idMatch = url.match(/\/status\/(\d+)/);
  return idMatch ? { username: "i", tweetId: idMatch[1] } : null;
}

const tweetTitle = (text) =>
  shorten(text?.replace(/\n/g, " ").trim() || "", 100) || "Twitter Video";

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Strategy 1: fxtwitter ─────────────────────────────────────────────────────
// Response shape: { tweet: { media: { videos: [{ url, formats: [...], thumbnail_url, width, height }] } } }
async function fromFxTwitter(username, tweetId) {
  const data = await getJson(`https://api.fxtwitter.com/${username}/status/${tweetId}`);
  const tweet = data?.tweet;
  const video = tweet?.media?.videos?.[0];
  if (!video) return null;

  // Build quality list from the formats array (skip HLS .m3u8)
  const formats = (video.formats || [])
    .filter((f) => f.container === "mp4" && f.bitrate > 0)
    .map((f) => {
      // Extract resolution from URL like /vid/avc1/1280x720/
      const sizeMatch = f.url.match(/\/(\d+)x(\d+)\//);
      const label = sizeMatch ? `${sizeMatch[2]}p` : `${Math.round(f.bitrate / 1000)}kbps`;
      return { label, url: f.url, bitrate: f.bitrate };
    });

  // Deduplicate labels (keep highest bitrate per label)
  const seen = new Map();
  for (const f of formats) {
    if (!seen.has(f.label) || f.bitrate > seen.get(f.label).bitrate) {
      seen.set(f.label, f);
    }
  }
  const deduped = [...seen.values()].sort((a, b) => a.bitrate - b.bitrate);

  const finalFormats =
    deduped.length > 0
      ? deduped
      : [{ label: `${video.height || "Best"}p`, url: video.url, bitrate: 0 }];

  if (!finalFormats[0].url) return null;

  return {
    title: tweetTitle(tweet.text),
    thumbnail: video.thumbnail_url || tweet.author?.avatar_url || "",
    formats: finalFormats,
  };
}

// ── Strategy 2: vxtwitter ─────────────────────────────────────────────────────
// Response shape: { media_extended: [{ type, url, size: { width, height }, thumbnail_url }] }
async function fromVxTwitter(username, tweetId) {
  const data = await getJson(`https://api.vxtwitter.com/${username}/status/${tweetId}`);

  const videoEntry = (data?.media_extended || []).find(
    (m) => m.type === "video" || m.type === "gif"
  );
  if (videoEntry?.url) {
    const h = videoEntry.size?.height;
    return {
      title: tweetTitle(data.text),
      thumbnail: videoEntry.thumbnail_url || "",
      formats: [{ label: h ? `${h}p` : "Best", url: videoEntry.url, bitrate: 0 }],
    };
  }

  // mediaURLs fallback
  const urls = data?.mediaURLs;
  if (Array.isArray(urls) && urls.length) {
    return {
      title: tweetTitle(data.text),
      thumbnail: "",
      formats: [{ label: "Best", url: urls[0], bitrate: 0 }],
    };
  }
  return null;
}

/**
 * Look up the downloadable video in a tweet.
 * @returns {Promise<{ title: string, thumbnail: string, formats: { label: string, url: string, bitrate: number }[] }>}
 * @throws {Error} with a message suitable for showing to the user
 */
export async function getTweetVideo(url) {
  const info = extractTweetInfo(url);
  if (!info) throw new Error("Could not find a tweet ID in this link");

  let failures = 0;
  for (const strategy of [fromFxTwitter, fromVxTwitter]) {
    try {
      const video = await strategy(info.username, info.tweetId);
      if (video) return video;
    } catch (err) {
      failures++;
      console.warn(`[twitter] ${strategy.name} failed:`, err.message);
    }
  }

  // Both lookups erroring is a network/service problem, not a tweet without video.
  if (failures === 2) {
    throw new Error("Could not reach the Twitter lookup service. Please try again.");
  }
  throw new Error("No video found in this tweet — it may be text-only or image-only");
}
