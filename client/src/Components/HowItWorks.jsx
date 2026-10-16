import { useState } from "react";
import { bookmarkletHref } from "../youtube/bookmarklet";
import { BOOKMARK_NAME, isAndroid } from "../bookmarkSetup";
import { BookmarkletButton, BookmarksBarHint, CopyButton, GuideImage, Step, Steps } from "./Bookmark";
import { IconCheck, IconLink } from "./icons";
import { SITES, SectionHeading } from "./ui";

// Small drawings of each step, built from the same tokens as the real UI.
function PasteArt() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-card p-1.5 pl-3 shadow-card">
      <IconLink size={16} className="text-subtle" />
      <span className="min-w-0 flex-1 truncate text-[13px] text-fg">youtu.be/your-video</span>
      <span className="h-4 w-px animate-pulse bg-fg" />
      <span className="rounded-lg bg-accent px-2.5 py-1.5 text-[11px] font-bold text-accent-fg">Get video</span>
    </div>
  );
}

function ConnectArt() {
  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-card shadow-card">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-sunken-2" />
        <span className="h-2 w-2 rounded-full bg-sunken-2" />
        <span className="ml-1 flex-1 truncate rounded-md bg-sunken px-2 py-0.5 text-[11px] text-subtle">youtube.com/watch?v=…</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="relative rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-fg ring-2 ring-accent/40">
          {BOOKMARK_NAME}
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="absolute -bottom-2.5 -right-2 text-fg">
            <path d="M5 3l14 7.5-6.2 1.6L9.6 18z" fill="currentColor" stroke="rgb(var(--card))" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="h-2 w-12 rounded-full bg-sunken" />
        <span className="h-2 w-8 rounded-full bg-sunken" />
      </div>
    </div>
  );
}

function SaveArt() {
  return (
    <div className="space-y-2.5 rounded-xl border border-line-strong bg-card p-3 shadow-card">
      <div className="flex gap-1.5">
        {["1080p", "720p", "MP3"].map((q, i) => (
          <span
            key={q}
            className={`flex-1 rounded-lg border px-2 py-1 text-center text-[11px] font-semibold ${
              i === 0 ? "border-accent-ink bg-accent/15 text-fg" : "border-line text-muted"
            }`}
          >
            {q}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken-2">
          <div className="h-full w-full rounded-full bg-accent-ink dark:bg-accent" />
        </div>
        <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-fg">
          <IconCheck size={10} strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Paste the link",
    text: "Copy a video's link from the app or site you're watching on, and paste it into the box at the top.",
    Art: PasteArt,
  },
  {
    title: "Connect once, for YouTube and Instagram",
    text: "Those two only let their own pages read their videos, so you click the Media Saver bookmark there. X and video links skip this.",
    Art: ConnectArt,
  },
  {
    title: "Pick a quality and save",
    text: "Choose up to 4K, or just the sound as MP3. The file comes straight from the site to your Downloads folder.",
    Art: SaveArt,
  },
];

// The setup animation, for YouTube or Instagram.
function GuideSwitcher() {
  const [site, setSite] = useState("youtube");
  return (
    <div className="flex flex-col items-center gap-3">
      <div role="group" aria-label="Show the steps for" className="inline-flex rounded-xl border border-line bg-card p-1">
        {["youtube", "instagram"].map((s) => {
          const { name, Mark, color } = SITES[s];
          const on = site === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => setSite(s)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                on ? "bg-sunken-2 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              <Mark size={16} className={on ? color : ""} />
              {name}
            </button>
          );
        })}
      </div>
      <div className="w-full rounded-3xl border border-line bg-sunken p-2 sm:p-3">
        {/* key: switching restarts the animation from the first step */}
        <GuideImage key={site} site={site} className="mx-auto" />
      </div>
    </div>
  );
}

function BookmarkSetup() {
  return (
    <div id="bookmark" className="card mt-6 grid scroll-mt-20 gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
      <div>
        <p className="eyebrow">One-time setup</p>
        <h3 className="font-display mt-4 text-[1.75rem] font-bold leading-tight sm:text-3xl">Add the Media Saver bookmark</h3>
        <p className="mt-3 text-[15px] leading-6 text-muted">
          It&apos;s a bookmark, not an extension: there&apos;s nothing to install, and it only runs when you click it on
          YouTube or Instagram. It never sends your cookies for either site.
        </p>
        <div className="mt-8">
          {isAndroid ? (
            <Steps>
              <Step n={1} title="Copy the bookmark code">
                <CopyButton text={bookmarkletHref(window.location.origin)} label="Copy bookmark code" />
              </Step>
              <Step n={2} title="Save it as a bookmark">
                <p>
                  In Chrome&apos;s <b className="text-fg">⋮</b> menu, tap <b className="text-fg">☆</b> to bookmark this
                  page, then tap <b className="text-fg">Edit</b>. Name it <b className="text-fg">Media Saver</b> and paste
                  the code over the address.
                </p>
              </Step>
              <Step n={3} title="Run it on a video" last>
                <p>
                  Paste a YouTube or Instagram link into Chrome&apos;s address bar so it opens in Chrome, not the app.
                  Then type <b className="text-fg">Media Saver</b> in the address bar and tap the bookmark.
                </p>
              </Step>
            </Steps>
          ) : (
            <Steps>
              <Step n={1} title="Drag the button to your bookmarks bar">
                <BookmarkletButton />
                <BookmarksBarHint />
              </Step>
              <Step n={2} title="Click it on YouTube or Instagram" last>
                <p>
                  On a video or reel, Media Saver opens in a new tab with it ready to download. Anywhere else on those
                  sites, it opens ready for you to paste links.
                </p>
              </Step>
            </Steps>
          )}
        </div>
      </div>
      <GuideSwitcher />
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading eyebrow="How it works" title="Three steps, nothing to install">
        Media Saver runs entirely in your browser. Here&apos;s what happens when you save a video.
      </SectionHeading>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map(({ title, text, Art }, i) => (
          <li key={title} className="card flex flex-col p-6">
            <div className="flex min-h-[128px] flex-col justify-center rounded-2xl bg-sunken p-4 sm:p-5">
              <Art />
            </div>
            <p className="mt-6 text-[13px] font-bold tabular-nums text-subtle">0{i + 1}</p>
            <h3 className="mt-1 text-lg font-semibold leading-snug">{title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-muted">{text}</p>
          </li>
        ))}
      </ol>
      <BookmarkSetup />
    </section>
  );
}
