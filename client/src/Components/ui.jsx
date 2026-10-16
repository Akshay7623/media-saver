// Small building blocks shared across pages.
import { IconAlert, InstagramMark, XMark, YouTubeMark, FileMark } from "./icons";

export function Spinner({ size = 18, className = "" }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-block flex-none animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}

export function Alert({ children, onRetry }) {
  return (
    <div
      role="alert"
      className="motion-safe:animate-fade-up flex items-start gap-3 rounded-2xl border border-danger/25 bg-danger/[0.07] px-4 py-3.5 text-sm leading-6 text-fg"
    >
      <IconAlert size={18} className="mt-0.5 text-danger" />
      <p className="min-w-0 flex-1">{children}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-sm btn-secondary -my-1">
          Try again
        </button>
      )}
    </div>
  );
}

/** Eyebrow, heading and intro for a page section. */
export function SectionHeading({ eyebrow, title, children, center = false, id }) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="font-display mt-4 text-[2rem] font-bold leading-[1.08] sm:text-[2.6rem]">
        {title}
      </h2>
      {children && <p className="mt-4 text-[17px] leading-7 text-muted">{children}</p>}
    </div>
  );
}

// Each site's mark and color, keyed as InputBox names them.
export const SITES = {
  youtube: { name: "YouTube", Mark: YouTubeMark, color: "text-youtube", tile: "bg-youtube/10 text-youtube" },
  instagram: { name: "Instagram", Mark: InstagramMark, color: "text-instagram", tile: "bg-instagram/10 text-instagram" },
  x: { name: "X / Twitter", Mark: XMark, color: "text-fg", tile: "bg-fg/[0.07] text-fg" },
  file: { name: "Video link", Mark: FileMark, color: "text-muted", tile: "bg-fg/[0.07] text-muted" },
};

export function SiteTile({ site, size = 40, className = "" }) {
  const { Mark, tile } = SITES[site];
  return (
    <span style={{ width: size, height: size }} className={`grid flex-none place-items-center rounded-xl ${tile} ${className}`}>
      <Mark size={Math.round(size * 0.55)} />
    </span>
  );
}
