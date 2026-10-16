import { Link } from "react-router-dom";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Save a video", to: "/" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "Supported sites", to: "/#sites" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
  {
    title: "Media Saver",
    links: [
      { label: "About", to: "/about" },
      { label: "Terms & Conditions", to: "/t-and-c" },
      { label: "Privacy Policy", to: "/privacy-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs space-y-4">
          <Logo />
          <p className="text-sm leading-6 text-muted">
            Save videos from YouTube, Instagram, X and direct links. Everything runs in your browser.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-[13px] text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} Media Saver</p>
          <p>Only download videos you have the right to save.</p>
        </div>
      </div>
    </footer>
  );
}
