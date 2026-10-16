// ==UserScript==
// @name         Media Saver helper
// @namespace    media-saver
// @version      1.0.2
// @description  Lets Media Saver download YouTube videos right in your browser, and adds a Download button on YouTube.
// {{SITE_MATCHES}}
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @connect      youtube.com
// @connect      googlevideo.com
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @noframes
// ==/UserScript==

/* global GM_xmlhttpRequest, GM_info */

// Built from client/userscript/media-saver.user.js by vite.config.js, which
// fills in the site's origins. Two jobs:
//  • On the Media Saver site: perform YouTube requests the page asks for.
//    Browsers block the page from reading YouTube directly; userscripts are
//    not subject to that, and requests go out from the visitor's connection.
//  • On YouTube: show a Download button that opens the video on the site.

(function () {
  "use strict";

  const SITE_HOME = "{{SITE_HOME}}";
  const CHANNEL = "media-saver-bridge";
  const onYouTube = /(^|\.)youtube\.com$/.test(location.hostname);

  if (onYouTube) addDownloadButton();
  else startBridge();

  // ── Bridge (runs on the Media Saver site) ─────────────────────────────────
  function startBridge() {
    // The bridge only reaches YouTube — it is not a general-purpose proxy.
    const ALLOWED = ["youtube.com", "googlevideo.com"];
    const isAllowed = (url) => {
      try {
        const u = new URL(url);
        return u.protocol === "https:"
          && ALLOWED.some((d) => u.hostname === d || u.hostname.endsWith("." + d));
      } catch {
        return false;
      }
    };

    const active = new Map(); // id -> GM_xmlhttpRequest handle
    const reply = (msg) => window.postMessage({ channel: CHANNEL, ...msg }, location.origin);
    const fail = (id, message) => {
      active.delete(id);
      reply({ kind: "error", id, message });
    };

    function request({ id, url, method, headers, body }) {
      if (!isAllowed(url)) return fail(id, "Blocked: the helper only requests YouTube URLs");
      const handle = GM_xmlhttpRequest({
        url,
        method: method || "GET",
        headers: headers || {},
        data: body,
        responseType: "arraybuffer",
        anonymous: true, // never send the visitor's YouTube cookies
        timeout: 120000,
        onprogress: (e) => reply({ kind: "progress", id, loaded: e.loaded, total: e.total }),
        onload: (r) => {
          active.delete(id);
          reply({ kind: "response", id, status: r.status, headers: r.responseHeaders || "", body: r.response });
        },
        onerror: () => fail(id, "Network error"),
        ontimeout: () => fail(id, "Request timed out"),
      });
      active.set(id, handle);
    }

    window.addEventListener("message", (event) => {
      if (event.origin !== location.origin) return;
      const msg = event.data;
      if (!msg || msg.channel !== CHANNEL) return;
      if (msg.kind === "ping") reply({ kind: "hello", version: GM_info.script.version });
      else if (msg.kind === "request") request(msg);
      else if (msg.kind === "abort") {
        active.get(msg.id)?.abort();
        active.delete(msg.id);
      }
    });

    reply({ kind: "hello", version: GM_info.script.version });
  }

  // ── Download button (runs on YouTube) ─────────────────────────────────────
  function addDownloadButton() {
    if (!SITE_HOME) return;
    // YouTube enforces Trusted Types, so build the DOM without innerHTML.
    const button = document.createElement("a");
    button.textContent = "⬇ Download";
    button.target = "_blank";
    button.rel = "noopener";
    Object.assign(button.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "2147483647",
      padding: "10px 16px",
      borderRadius: "12px",
      background: "#c5f24a",
      color: "#111310",
      font: "600 14px/1 system-ui, sans-serif",
      textDecoration: "none",
      boxShadow: "0 4px 14px rgba(0,0,0,.3)",
    });

    // YouTube is a single-page app: re-check the URL instead of hooking its
    // navigation events, which change between redesigns.
    const update = () => {
      const isVideo = location.pathname === "/watch" || /^\/(shorts|live)\//.test(location.pathname);
      button.style.display = isVideo ? "block" : "none";
      button.href = `${SITE_HOME}/?url=${encodeURIComponent(location.href)}`;
    };

    const mount = () => {
      document.body.appendChild(button);
      update();
      setInterval(update, 1000);
    };
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount, { once: true });
  }
})();
