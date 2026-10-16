import InputBox from "./InputBox";
import Sites from "./Sites";
import HowItWorks from "./HowItWorks";
import Why from "./Why";
import Faq from "./Faq";
import { IconArrowRight } from "./icons";
import { useTitle } from "../useTitle";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-180px] -z-10 h-[520px] w-[min(980px,140vw)] -translate-x-1/2 rounded-full bg-accent/30 blur-[110px] dark:bg-accent/[0.09]"
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 text-center sm:px-6 sm:pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3.5 py-1.5 text-[13px] font-medium text-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-ink dark:bg-accent" />
          Free · No sign-up · Runs in your browser
        </p>
        <h1 className="font-display mx-auto mt-7 max-w-4xl text-[2.75rem] font-extrabold leading-[0.95] sm:text-6xl lg:text-[5.2rem]">
          Paste a link.
          <br />
          <span className="sticker mt-3 sm:mt-4">Keep the video.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-[17px] leading-7 text-muted sm:text-lg">
          Save YouTube videos and Shorts, Instagram reels, X videos and direct video links, in the quality you want.
          No app, no account, and no server in between.
        </p>
        <div className="mt-10">
          <InputBox />
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  const start = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("video-url")?.focus({ preventScroll: true });
  };
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#111310] px-6 py-14 text-center sm:px-12 sm:py-16 dark:border dark:border-line dark:bg-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[90px]"
        />
        <h2 className="font-display text-[2rem] font-bold leading-tight text-white sm:text-5xl">Got a link? Keep the video.</h2>
        <p className="mx-auto mt-4 max-w-md text-[17px] leading-7 text-white/70">
          It takes a few seconds, costs nothing, and the file goes straight to your device.
        </p>
        <button type="button" onClick={start} className="btn btn-lg btn-primary mt-8">
          Paste a link
          <IconArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  useTitle(null);
  return (
    <>
      <Hero />
      <Sites />
      <HowItWorks />
      <Why />
      <Faq />
      <CallToAction />
    </>
  );
}
