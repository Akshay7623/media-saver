import { Link } from "react-router-dom";
import { IconBolt, IconBookmark } from "./icons";
import { SectionHeading, SiteTile } from "./ui";

const CARDS = [
  {
    site: "youtube",
    name: "YouTube",
    text: "Videos and Shorts in every quality up to 4K, or just the audio as an MP3.",
    bookmark: true,
  },
  {
    site: "instagram",
    name: "Instagram",
    text: "Public reels and video posts, as one file with sound at up to 720p.",
    bookmark: true,
  },
  {
    site: "x",
    name: "X / Twitter",
    text: "Videos from posts, in every quality the post offers.",
  },
  {
    site: "file",
    name: "Video links",
    text: "Any link straight to a video file your browser can play, like one ending in .mp4.",
  },
];

export default function Sites() {
  return (
    <section id="sites" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading eyebrow="Supported sites" title="What you can save">
        Four kinds of links work today. YouTube and Instagram need a one-time bookmark; the rest work right away.
      </SectionHeading>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <li key={c.site} className="card flex flex-col p-6">
            <SiteTile site={c.site} size={48} />
            <h3 className="mt-5 text-lg font-semibold">{c.name}</h3>
            <p className="mt-2 flex-1 text-[15px] leading-6 text-muted">{c.text}</p>
            <p className="mt-6">
              {c.bookmark ? (
                <Link
                  to="/#bookmark"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  <IconBookmark size={14} />
                  One-time bookmark
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent-ink">
                  <IconBolt size={14} />
                  Works right away
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-subtle">Facebook isn&apos;t supported yet.</p>
    </section>
  );
}
