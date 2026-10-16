// Shown when a YouTube or Instagram link arrives and nothing connected can
// reach that site yet: the one-time bookmark setup, then how to use it.
import { bookmarkletHref } from "../youtube/bookmarklet";
import { isAndroid } from "../bookmarkSetup";
import { BookmarkletButton, BookmarksBarHint, CopyButton, GuideImage, Step, Steps } from "./Bookmark";
import { IconExternal, IconInfo, IconShield } from "./icons";
import { SiteTile } from "./ui";

/**
 * @param {{ setup: { site: "youtube"|"instagram", name: string, noun: string,
 *   url: string, phoneUrl: string, keepOpen: string } }} props
 */
export default function SetupPanel({ setup }) {
  // An animation of these steps for this site. On phones it comes after the
  // steps, so the Copy buttons aren't pushed below a tall animation.
  const guide = (
    <div className="rounded-3xl border border-line bg-sunken p-2 sm:p-3">
      <GuideImage site={setup.site} id="setup-guide" className="mx-auto" />
    </div>
  );

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-4">
        <SiteTile site={setup.site} size={44} />
        <div className="min-w-0 space-y-1.5">
          <h2 className="font-display text-xl font-bold leading-tight sm:text-[22px]">
            {setup.name} needs the Media Saver bookmark
          </h2>
          <p className="text-[15px] leading-6 text-muted">
            {setup.name} only lets its own site read its videos, so the download starts from{" "}
            {setup.site === "instagram" ? "an" : "a"} {setup.name} tab.
            It&apos;s a one-time setup with nothing to install.
          </p>
        </div>
      </div>

      {!isAndroid && guide}

      {isAndroid ? (
        <Steps>
          <Step n={1} title="Copy the bookmark code">
            <p>Steps 1 and 2 are needed only once.</p>
            <CopyButton id="copy-bookmark" text={bookmarkletHref(window.location.origin)} label="Copy bookmark code" />
          </Step>
          <Step n={2} title="Save it as a bookmark">
            <p>
              In Chrome&apos;s <b className="text-fg">⋮</b> menu, tap <b className="text-fg">☆</b> to bookmark this page,
              then tap <b className="text-fg">Edit</b>. Name it <b className="text-fg">Media Saver</b> and paste the code
              over the address.
            </p>
          </Step>
          <Step n={3} title={`Open the ${setup.noun} in Chrome`}>
            <p>
              Copy the {setup.noun} link and paste it into Chrome&apos;s address bar. Pasting keeps the {setup.noun} in
              Chrome instead of the {setup.name} app.
            </p>
            <CopyButton id="copy-link" text={setup.phoneUrl} label={`Copy ${setup.noun} link`} secondary />
          </Step>
          <Step n={4} title="Run the bookmark" last>
            <p>
              On the {setup.noun}, tap the address bar, type <b className="text-fg">Media Saver</b> and tap the bookmark.
              Media Saver opens in a new tab with the {setup.noun} ready to download.{setup.keepOpen} If Chrome blocks a
              pop-up, tap <b className="text-fg">Always show</b> and run the bookmark again.
            </p>
          </Step>
        </Steps>
      ) : (
        <Steps>
          <Step n={1} title="Add the bookmark">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>Drag</span>
              <BookmarkletButton />
              <span>to your bookmarks bar. You only do this once.</span>
            </div>
            <BookmarksBarHint />
          </Step>
          <Step n={2} title={`Open the ${setup.noun} on ${setup.name}, then click the bookmark`} last>
            <a
              id="open-on-site"
              href={setup.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Open this {setup.noun} on {setup.name}
              <IconExternal size={16} className="text-subtle" />
            </a>
            <p>
              The {setup.noun} opens in a new tab, ready to download.{setup.keepOpen} While the {setup.name} tab stays
              open, you can paste more {setup.name} links in the new tab.
            </p>
          </Step>
        </Steps>
      )}

      {isAndroid && guide}

      {setup.site === "instagram" && (
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-muted">Good to know for Instagram</p>
          <ul className="space-y-3 text-[15px] leading-6 text-muted">
            <li className="flex gap-2.5">
              <IconInfo size={18} className="mt-[3px] text-subtle" />
              <span>
                <b className="text-fg">No need to log in.</b> If Instagram shows its login page instead of the reel,{" "}
                {isAndroid ? "run" : "click"} the bookmark anyway, then paste the reel&apos;s link into the Media Saver
                tab that opens.
              </span>
            </li>
            <li className="flex gap-2.5">
              <IconInfo size={18} className="mt-[3px] text-subtle" />
              <span>
                <b className="text-fg">Public reels only.</b> Media Saver sees what a logged-out visitor sees, so reels
                from private accounts can&apos;t be saved.
              </span>
            </li>
            <li className="flex gap-2.5">
              <IconInfo size={18} className="mt-[3px] text-subtle" />
              <span>
                <b className="text-fg">720p with sound.</b> That&apos;s the best version Instagram offers as a single
                file.
              </span>
            </li>
          </ul>
        </div>
      )}

      <p className="flex items-start gap-2.5 rounded-2xl bg-sunken px-4 py-3 text-[13px] leading-5 text-muted">
        <IconShield size={18} className="mt-px text-accent-ink" />
        <span>
          The bookmark only talks to {setup.name} and this page. It never sends your {setup.name} cookies, and
          nothing passes through a server.
        </span>
      </p>

      {/* The userscript only reaches YouTube. */}
      {setup.site === "youtube" && (
        <details className="group rounded-2xl border border-line px-4 py-3 text-[15px] text-muted open:pb-4">
          <summary className="cursor-pointer list-none font-medium text-fg marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              Advanced: paste YouTube links without visiting YouTube
              <span aria-hidden="true" className="text-subtle transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-6 marker:text-subtle">
            <li>
              Install{" "}
              <a href="https://www.tampermonkey.net/" target="_blank" rel="noopener noreferrer" className="link">
                Tampermonkey
              </a>{" "}
              or{" "}
              <a href="https://violentmonkey.github.io/" target="_blank" rel="noopener noreferrer" className="link">
                Violentmonkey
              </a>
              . In Chrome and other Chromium browsers, also switch on <b className="text-fg">Allow User Scripts</b> on
              its Details page in <code className="kbd">chrome://extensions</code>.
            </li>
            <li>
              <a href="/media-saver.user.js" className="link">
                Install the Media Saver helper
              </a>{" "}
              and confirm in the tab that opens.
            </li>
            <li>Reload this page and press Get video again.</li>
          </ol>
        </details>
      )}
    </div>
  );
}
