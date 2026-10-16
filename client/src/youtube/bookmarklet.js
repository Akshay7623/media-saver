// The "Media Saver" bookmarklet: the no-install way to reach YouTube and
// Instagram. The helper userscript is the optional alternative, for YouTube
// only. Clicked on a YouTube or Instagram page, it opens this site with
// ?relay=<that origin>, plus &url=<video> on a video page, and then performs
// the site's requests from that tab, where code runs as youtube.com or
// instagram.com and the site allows it. While that tab stays open, the opened
// site tab can fetch any link from the same site pasted into it. Messages use
// the same protocol as the userscript (bridge.js).
//
// relay() is serialised into the bookmark with Function.prototype.toString,
// so it must stay self-contained: no imports, no references to module scope.

function relay(SITE) {
  const CHANNEL = "media-saver-bridge";
  if (location.origin === SITE) {
    alert("Media Saver works on YouTube and Instagram: open one of them and click this bookmark there.");
    return;
  }
  // bridge.js only accepts these origins as a relay.
  const onYouTube = /^(www|m)\.youtube\.com$/.test(location.hostname);
  if (!onYouTube && location.hostname !== "www.instagram.com") {
    alert(`Open YouTube or Instagram, then click Media Saver.\n\nThis page isn't on either:\n${location.href}`);
    return;
  }
  const path = location.pathname;
  const onVideo = onYouTube
    ? (path === "/watch" && new URLSearchParams(location.search).has("v")) || /^\/(shorts|live|embed)\/[^/]+/.test(path)
    : /^\/([\w.]+\/)?(reels?|p|tv)\/[\w-]+/.test(path);
  // On a video the site opens with it ready to download. Anywhere else it
  // opens connected and empty, for the visitor to paste links.
  const video = onVideo ? `url=${encodeURIComponent(location.href)}&` : "";

  // One relay per tab; clicking again just opens another site window.
  const state = window.__mediaSaverRelay
    || (window.__mediaSaverRelay = { windows: new Set(), active: new Map() });
  const win = window.open(`${SITE}/?${video}relay=${encodeURIComponent(location.origin)}`, "_blank");
  if (!win) {
    alert("Allow pop-ups for this site, then click Media Saver again.");
    return;
  }
  state.windows.add(win);
  if (state.started) return;
  state.started = true;

  // The relay only reaches YouTube and Instagram — it is not a general-purpose
  // proxy. A tab can only read its own site anyway; the browser blocks the rest.
  const isAllowed = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "https:"
        && ["youtube.com", "googlevideo.com", "instagram.com"].some((d) => u.hostname === d || u.hostname.endsWith("." + d));
    } catch {
      return false;
    }
  };
  const reply = (target, msg, transfer = []) =>
    target.postMessage({ channel: CHANNEL, ...msg }, SITE, transfer);

  window.addEventListener("message", async (event) => {
    if (event.origin !== SITE || !state.windows.has(event.source)) return;
    const msg = event.data;
    if (!msg || msg.channel !== CHANNEL) return;
    const src = event.source;

    if (msg.kind === "ping") return reply(src, { kind: "hello", version: "bookmarklet" });
    if (msg.kind === "abort") return state.active.get(msg.id)?.abort();
    if (msg.kind !== "request") return;

    const { id, url, method, headers, body } = msg;
    if (!isAllowed(url)) return reply(src, { kind: "error", id, message: "Blocked: only YouTube and Instagram URLs are allowed" });

    const ctrl = new AbortController();
    state.active.set(id, ctrl);
    try {
      // credentials: "omit" — never send the visitor's YouTube or Instagram cookies.
      const res = await fetch(url, { method, headers, body, credentials: "omit", signal: ctrl.signal });
      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body.getReader();
      const parts = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        loaded += value.length;
        reply(src, { kind: "progress", id, loaded, total });
      }
      const out = new Uint8Array(loaded);
      let offset = 0;
      for (const p of parts) { out.set(p, offset); offset += p.length; }
      const raw = [...res.headers].map(([k, v]) => `${k}: ${v}`).join("\r\n");
      reply(src, { kind: "response", id, status: res.status, headers: raw, body: out.buffer }, [out.buffer]);
    } catch (e) {
      reply(src, { kind: "error", id, message: e.name === "AbortError" ? "Aborted" : "Network error" });
    } finally {
      state.active.delete(id);
    }
  });

  // This tab does the downloading, so say so, with the same emoji the
  // bookmark is named with. YouTube enforces Trusted Types: build the badge
  // without innerHTML.
  const badge = document.createElement("div");
  badge.textContent = "⬇️ Media Saver is connected to this tab. Keep it open while you download.";
  Object.assign(badge.style, {
    position: "fixed", left: "50%", bottom: "20px", transform: "translateX(-50%)",
    zIndex: "2147483647", padding: "10px 16px", borderRadius: "12px",
    background: "#c5f24a", color: "#111310",
    font: "600 13px/1.2 system-ui, sans-serif", boxShadow: "0 4px 14px rgba(0,0,0,.3)",
  });
  document.body.appendChild(badge);
}

/** The bookmark URL for a site served at `siteOrigin`. */
export function bookmarkletHref(siteOrigin) {
  const code = `(${relay.toString()})(${JSON.stringify(siteOrigin)})`;
  return `javascript:${encodeURIComponent(code)}`;
}
