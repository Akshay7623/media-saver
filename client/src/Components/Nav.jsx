import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppTheme } from "../context/ThemeContext";
import Logo from "./Logo";
import { IconClose, IconMenu, IconMoon, IconSun } from "./icons";

// Sections of the home page, linked as /#id from every page.
const LINKS = [
  { label: "How it works", to: "/#how-it-works" },
  { label: "Sites", to: "/#sites" },
  { label: "FAQ", to: "/#faq" },
];

const linkCls =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-fg";

function ThemeToggle() {
  const { isDark, toggle } = useAppTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-line-strong hover:bg-sunken hover:text-fg"
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the phone menu after any navigation, or on Escape.
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-page/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={linkCls}>
              {l.label}
            </Link>
          ))}
          <NavLink to="/about" className={({ isActive }) => `${linkCls} ${isActive ? "bg-sunken text-fg" : ""}`}>
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-fg transition-colors hover:bg-sunken md:hidden"
          >
            {open ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="motion-safe:animate-fade-up border-t border-line bg-page px-4 pb-5 pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {[...LINKS, { label: "About", to: "/about" }, { label: "Terms", to: "/t-and-c" }, { label: "Privacy", to: "/privacy-policy" }].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-line py-3.5 text-[15px] font-medium text-fg"
                >
                  {l.label}
                  <span aria-hidden="true" className="text-subtle">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
