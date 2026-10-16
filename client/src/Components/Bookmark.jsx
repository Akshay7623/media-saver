// Pieces of the Media Saver bookmark setup, shared by the home page and the
// setup panel that appears when a YouTube or Instagram link needs it.
import { useEffect, useRef, useState } from "react";
import { bookmarkletHref } from "../youtube/bookmarklet";
import { BOOKMARK_NAME, GUIDES, copyToClipboard, isMac } from "../bookmarkSetup";
import { IconCheck, IconCopy, IconGrip } from "./icons";

// The drag-to-bookmarks-bar button. React warns about (and later versions
// block) javascript: URLs in href, so the URL is set on the element directly.
// Clicking it here does nothing but say it's meant to be dragged. Its text is
// exactly the bookmark's name: browsers name a dragged bookmark after it.
export function BookmarkletButton() {
  const ref = useRef(null);
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    ref.current.setAttribute("href", bookmarkletHref(window.location.origin));
  }, []);
  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(() => setNudge(false), 3000);
    return () => clearTimeout(t);
  }, [nudge]);
  return (
    <span className="relative inline-block align-middle">
      <a
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          setNudge(true);
        }}
        title="Drag me to your bookmarks bar"
        className="bookmark-chip inline-flex h-10 cursor-grab select-none items-center gap-1 rounded-full bg-accent pl-2 pr-4 text-sm font-semibold text-accent-fg transition-transform duration-150 hover:-translate-y-0.5 active:cursor-grabbing"
      >
        <IconGrip size={18} className="opacity-40" />
        {BOOKMARK_NAME}
      </a>
      {nudge && (
        <span
          role="status"
          className="motion-safe:animate-fade-up absolute left-0 top-full z-10 mt-2 w-60 rounded-xl bg-fg px-3 py-2 text-xs font-medium leading-5 text-page shadow-lift"
        >
          Drag this button up to your bookmarks bar instead of clicking it.
        </span>
      )}
    </span>
  );
}

/** "Bookmarks bar hidden?" with the shortcut for this computer. */
export function BookmarksBarHint() {
  return (
    <p className="text-[13px] text-subtle">
      Bookmarks bar hidden? Press <kbd className="kbd">{isMac ? "⌘" : "Ctrl"}</kbd> <kbd className="kbd">Shift</kbd>{" "}
      <kbd className="kbd">B</kbd>
    </p>
  );
}

/**
 * Copies `text` and confirms. If the browser refuses, shows the text in a box
 * to copy by hand.
 */
export function CopyButton({ id, text, label, secondary = false }) {
  const [state, setState] = useState(null); // "copied" | "failed"
  return (
    <div className="space-y-2">
      <button
        id={id}
        type="button"
        onClick={async () => setState((await copyToClipboard(text)) ? "copied" : "failed")}
        className={`btn ${secondary ? "btn-secondary" : "btn-primary"}`}
      >
        {state === "copied" ? <IconCheck size={18} /> : <IconCopy size={18} />}
        {state === "copied" ? "Copied" : label}
      </button>
      {state === "failed" && (
        <>
          <p className="text-[13px] text-subtle">Copying was blocked. Select the text below and copy it yourself.</p>
          <textarea
            readOnly
            value={text}
            onFocus={(e) => e.target.select()}
            aria-label={label}
            className="block h-20 w-full resize-none rounded-xl border border-line bg-sunken p-2.5 font-mono text-xs text-fg"
          />
        </>
      )}
    </div>
  );
}

/** A site's animated setup walkthrough, or a still for reduced motion. */
export function GuideImage({ site = "youtube", id, className = "" }) {
  const guide = GUIDES[site];
  return (
    <picture>
      <source srcSet={guide.still} media="(prefers-reduced-motion: reduce)" />
      <img
        id={id}
        src={guide.gif}
        width={guide.width}
        height={guide.height}
        alt={guide.alt}
        loading="lazy"
        decoding="async"
        className={`block h-auto w-full rounded-2xl border border-line ${guide.cls} ${className}`}
      />
    </picture>
  );
}

/** Numbered steps joined by a line. */
export function Steps({ children }) {
  return <ol className="relative space-y-6">{children}</ol>;
}

export function Step({ n, title, children, last = false }) {
  return (
    <li className="relative grid grid-cols-[2rem_1fr] gap-x-3.5">
      {!last && <span aria-hidden="true" className="absolute bottom-[-1.5rem] left-4 top-9 w-px -translate-x-1/2 bg-line" />}
      <span className="relative grid h-8 w-8 place-items-center rounded-full border border-line-strong bg-card text-[13px] font-bold text-fg">
        {n}
      </span>
      <div className="min-w-0 space-y-2.5 pt-1">
        {title && <p className="font-semibold leading-6 text-fg">{title}</p>}
        <div className="space-y-3 text-[15px] leading-6 text-muted">{children}</div>
      </div>
    </li>
  );
}
