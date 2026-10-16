import { Link } from "react-router-dom";

/** The Media Saver mark: a download arrow on the accent color. */
export function LogoMark({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={`flex-none ${className}`}>
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <path
        d="M16 7.5v11.5m-5.2-5.2L16 19l5.2-5.2M9.5 24h13"
        fill="none"
        className="stroke-accent-fg"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ onClick }) {
  return (
    <Link to="/" onClick={onClick} className="group flex items-center gap-2.5 rounded-lg" aria-label="Media Saver home">
      <LogoMark className="transition-transform duration-200 group-hover:-rotate-6" />
      <span className="font-display text-[17px] font-bold tracking-tight">Media Saver</span>
    </Link>
  );
}
