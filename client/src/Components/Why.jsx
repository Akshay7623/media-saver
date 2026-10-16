import { IconFilm, IconPhone, IconServer, IconShield } from "./icons";
import { SectionHeading } from "./ui";

const POINTS = [
  {
    Icon: IconServer,
    title: "Nothing in the middle",
    text: "Videos travel straight from YouTube, Instagram or X to your device. We don't run servers that could see them, or the links you paste.",
  },
  {
    Icon: IconShield,
    title: "Your accounts stay out of it",
    text: "The bookmark never sends your cookies, so downloads aren't tied to your logins. Media Saver only sees what a logged-out visitor would.",
  },
  {
    Icon: IconFilm,
    title: "Full quality, or just the sound",
    text: "Up to 4K from YouTube, joined in your browser without re-encoding the picture. Or keep only the audio as an MP3.",
  },
  {
    Icon: IconPhone,
    title: "On your phone too",
    text: "On Android, the same bookmark runs from Chrome's address bar. X and video links don't need it at all.",
  },
];

export default function Why() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading eyebrow="Why Media Saver" title="A downloader you don't have to second-guess">
        No fake download buttons, no sign-up, no waiting. Just the video you asked for.
      </SectionHeading>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {POINTS.map(({ Icon, title, text }) => (
          <li key={title} className="card flex gap-5 p-6 sm:p-7">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-accent text-accent-fg">
              <Icon size={22} />
            </span>
            <div>
              <h3 className="text-lg font-semibold leading-snug">{title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
