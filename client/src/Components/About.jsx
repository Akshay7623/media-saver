import { Link } from "react-router-dom";
import { useTitle } from "../useTitle";
import { IconArrowRight, IconDownload, IconLink, IconServer } from "./icons";

const PATH = [
  {
    Icon: IconLink,
    title: "You paste a link",
    text: "Into this page, which runs entirely in your browser. Nothing is sent anywhere yet.",
  },
  {
    Icon: IconServer,
    title: "Your browser asks the site",
    text: "For YouTube and Instagram, your tab on that site does the asking, through the bookmark and without your cookies. For X and video links, this page asks directly.",
  },
  {
    Icon: IconDownload,
    title: "The file lands in your Downloads",
    text: "If YouTube sends video and sound separately, they're joined right here with FFmpeg, a free tool that runs in your browser.",
  },
];

const LIMITS = [
  "Facebook isn't supported yet.",
  "Instagram downloads are public reels and video posts only, at up to 720p.",
  "YouTube and Instagram need the one-time bookmark. For YouTube there's also an optional userscript.",
  "Very long 4K videos can run out of browser memory while video and sound are joined.",
  "On phones, the bookmark setup is for Chrome on Android.",
];

export default function About() {
  useTitle("About");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="max-w-3xl pb-6 pt-16 sm:pt-24">
        <p className="eyebrow">About</p>
        <h1 className="font-display mt-5 text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl">
          A video saver with nothing in the middle
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          Most download sites send your link to their servers, fetch the video there, and hand it back wrapped in ads.
          Media Saver does the whole job in your browser instead, so the video goes straight from the site that hosts
          it to your device.
        </p>
      </header>

      <section className="py-14" aria-labelledby="path-title">
        <h2 id="path-title" className="font-display text-2xl font-bold sm:text-3xl">
          The path of a download
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {PATH.map(({ Icon, title, text }, i) => (
            <li key={title} className="card relative p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-fg">
                  <Icon size={22} />
                </span>
                <span className="text-[13px] font-bold tabular-nums text-subtle">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-2xl bg-sunken px-5 py-4 text-[15px] leading-6 text-muted">
          <b className="text-fg">At no point does the video, or the link, pass through a server of ours.</b> There
          isn&apos;t one: Media Saver is a set of files your browser loads and runs.
        </p>
      </section>

      <section className="grid gap-10 py-14 lg:grid-cols-2" aria-labelledby="limits-title">
        <div>
          <h2 id="limits-title" className="font-display text-2xl font-bold sm:text-3xl">
            What it can&apos;t do yet
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-muted">
            Working only in the browser has trade-offs. Here they are, plainly.
          </p>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {LIMITS.map((l) => (
            <li key={l} className="flex gap-3 py-4 text-[15px] leading-6 text-muted">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-subtle" />
              {l}
            </li>
          ))}
        </ul>
      </section>

      <section className="py-14">
        <div className="card flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to try it?</h2>
            <p className="mt-2 text-[15px] text-muted">Paste a link and keep the video. It&apos;s free.</p>
          </div>
          <Link to="/" className="btn btn-lg btn-primary">
            Save a video
            <IconArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
