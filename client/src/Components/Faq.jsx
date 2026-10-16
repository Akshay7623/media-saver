import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./ui";

const FAQS = [
  {
    q: "Is Media Saver free?",
    a: "Yes, completely. There's no account, no subscription and no download limit.",
  },
  {
    q: "How do I download a video?",
    a: "Copy the video's link, paste it into the box at the top of the page and press Get video. Pick a quality, then press Download. The first time you save from YouTube or Instagram, Media Saver walks you through a one-time bookmark setup.",
  },
  {
    q: "Why do YouTube and Instagram need a bookmark?",
    a: (
      <>
        Both sites only let their own pages read their videos, so an ordinary website can&apos;t fetch them. The Media
        Saver bookmark runs on their page when you click it and hands the video to this tab. It isn&apos;t an extension
        and there&apos;s nothing to install. It only talks to YouTube, Instagram and this page, and it never sends your
        cookies. If you&apos;d rather paste YouTube links without opening YouTube, there&apos;s an optional userscript
        under Advanced in the setup steps.
      </>
    ),
  },
  {
    q: "Which sites work?",
    a: "YouTube videos and Shorts, public Instagram reels and video posts, X (Twitter) videos, and direct links to video files, such as a link ending in .mp4. Facebook isn't supported yet.",
  },
  {
    q: "What quality and formats can I get?",
    a: "From YouTube, every resolution the video offers, up to 4K, saved as MP4, or the audio alone as MP3. From X, every quality the post offers. Instagram offers reels as one file with sound at up to 720p. Direct links download as they are.",
  },
  {
    q: "Do you see what I download?",
    a: (
      <>
        No. Media Saver has no servers of its own: the page runs in your browser, and the video comes straight from the
        site that hosts it, so nothing you paste or download reaches us. To find the video in an X post, your browser
        asks the public fxtwitter service, which sees that post&apos;s link. The{" "}
        <Link to="/privacy-policy" className="link">
          privacy policy
        </Link>{" "}
        lists everything your browser talks to.
      </>
    ),
  },
  {
    q: "Does it work on my phone?",
    a: "On Android, yes. In Chrome, the bookmark runs from the address bar, and the setup steps show you how. X links and direct video links work without it.",
  },
  {
    q: "A download failed. What can I try?",
    a: "Press Get video again and retry: YouTube's download links expire after a few hours. Keep the YouTube or Instagram tab open until the download finishes. Very long 4K videos can run out of browser memory while video and sound are joined; a lower quality usually works.",
  },
];

function Item({ id, q, a, open, onToggle }) {
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold text-fg"
        >
          {q}
          <span
            aria-hidden="true"
            className={`grid h-8 w-8 flex-none place-items-center rounded-full border transition-all duration-200 ${
              open ? "rotate-45 border-accent bg-accent text-accent-fg" : "border-line text-muted"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        {...(open ? {} : { inert: "" })}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-6 pr-12 text-[15px] leading-7 text-muted">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="FAQ" title="Questions, answered">
            Can&apos;t find what you need? The{" "}
            <Link to="/about" className="link">
              About page
            </Link>{" "}
            explains how Media Saver works under the hood.
          </SectionHeading>
        </div>
        <div className="border-t border-line">
          {FAQS.map((f, i) => (
            <Item key={f.q} id={`faq-${i}`} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
