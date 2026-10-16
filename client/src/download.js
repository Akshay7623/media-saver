// Saving files to the visitor's Downloads folder.

/** Clicks a temporary link that downloads `url` as `filename`. */
export function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** A title made safe to use as a file name. */
export function safeFileName(title, fallback = "video") {
  // Control characters and the ones Windows forbids in file names.
  const cleaned = [...String(title || "")]
    .filter((c) => c.charCodeAt(0) >= 32 && !'<>:"/|?*'.includes(c) && c.charCodeAt(0) !== 92)
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();
  return cleaned || fallback;
}

/**
 * Downloads `url` as `filename`.
 *
 * Browsers ignore the `download` attribute on cross-origin links and just
 * open the video, so fetch the bytes and save them from a blob URL instead.
 * video.twimg.com allows cross-origin reads but answers 403 to any Referer
 * other than Twitter's (hotlink protection), so send none. If a host still
 * refuses, open the video in a new tab — not this one — so the visitor can
 * save it from the player without losing the site.
 *
 * @param {(fraction: number|null) => void} [onProgress]  0–1, or null while the size is unknown
 * @returns {Promise<"saved"|"opened">}
 */
export async function saveFile(url, filename, onProgress) {
  try {
    const res = await fetch(url, { referrerPolicy: "no-referrer" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const total = Number(res.headers.get("content-length")) || 0;
    const parts = [];
    let loaded = 0;
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      loaded += value.length;
      onProgress?.(total ? Math.min(1, loaded / total) : null);
    }
    const blobUrl = URL.createObjectURL(new Blob(parts, { type: res.headers.get("content-type") || "video/mp4" }));
    triggerDownload(blobUrl, filename);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    return "saved";
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
    return "opened";
  }
}
