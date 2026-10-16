// The result card's parts: what was found, the quality choice, progress, and
// the finished state. SimpleResult puts them together for single-file
// downloads (Instagram, X); YouTube has its own panel (YTClientDownloader).
import { useState } from "react";
import { saveFile } from "../download";
import { IconCheck, IconDownload, IconExternal } from "./icons";
import { SITES, Spinner } from "./ui";

/** Thumbnail, site, title and byline. */
export function MediaHeader({ site, title, byline, thumbnail, duration, portrait = false, children }) {
  const { name, Mark, color } = SITES[site];
  return (
    <div className="flex gap-4">
      <div
        className={`relative flex-none overflow-hidden rounded-xl border border-line bg-sunken ${
          portrait ? "aspect-[9/16] w-[4.5rem] sm:w-20" : "aspect-video w-32 sm:w-44"
        }`}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <span className={`grid h-full place-items-center ${color}`}>
            <Mark size={26} />
          </span>
        )}
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white">
            {duration}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`flex min-w-0 items-center gap-1.5 text-[13px] font-semibold ${color}`}>
          <Mark size={16} />
          <span>{name}</span>
          {byline && <span className="truncate font-medium text-subtle">· {byline}</span>}
        </p>
        <h3 className="mt-1.5 line-clamp-3 text-[15px] font-semibold leading-snug text-fg sm:text-base">{title}</h3>
        {children}
      </div>
    </div>
  );
}

/**
 * Quality choice as a row of radio cards.
 * @param {{ value: string, label: string, detail?: string, badge?: string }[]} options
 */
export function QualityPicker({ name, options, value, onChange, disabled = false, id }) {
  return (
    <fieldset id={id} disabled={disabled} className="min-w-0 disabled:opacity-60">
      <legend className="mb-2.5 text-[13px] font-semibold text-muted">Quality</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <label
              key={o.value}
              className={`relative flex cursor-pointer flex-col rounded-xl border px-3 py-2.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fg ${
                selected ? "border-accent-ink bg-accent/15" : "border-line bg-card hover:border-line-strong hover:bg-sunken"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                {o.label}
                {o.badge && (
                  <span className="rounded bg-fg px-1 py-px text-[10px] font-bold leading-none tracking-wide text-page">
                    {o.badge}
                  </span>
                )}
              </span>
              <span className="mt-0.5 min-h-[1rem] text-xs text-subtle">{o.detail}</span>
              {selected && (
                <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-accent-ink text-page">
                  <IconCheck size={11} strokeWidth={3} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** A thin progress bar. `value` 0–100, or null to show work without a size. */
export function ProgressBar({ value, tone = "accent", className = "" }) {
  const fill = tone === "warn" ? "bg-warn" : "bg-accent-ink dark:bg-accent";
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-sunken-2 ${className}`}>
      {value == null ? (
        <div className={`h-full w-1/3 rounded-full ${fill} animate-indeterminate`} />
      ) : (
        <div className={`h-full rounded-full ${fill} transition-[width] duration-300`} style={{ width: `${value}%` }} />
      )}
    </div>
  );
}

/** What happened after a download: saved, or opened in a new tab. */
export function SavedNote({ result, onDismiss }) {
  if (result === "opened") {
    return (
      <div className="motion-safe:animate-fade-up flex items-start gap-3 rounded-2xl bg-sunken px-4 py-3 text-sm leading-6 text-muted">
        <IconExternal size={18} className="mt-0.5 text-fg" />
        <p>
          This site wouldn&apos;t hand the file over directly, so it opened in a new tab. Save it from there with your
          browser&apos;s <b className="text-fg">Download</b> or <b className="text-fg">Save video as</b> option.
        </p>
      </div>
    );
  }
  return (
    <div className="motion-safe:animate-fade-up flex items-center justify-between gap-3 rounded-2xl bg-accent/15 px-4 py-3 text-sm">
      <p className="flex items-center gap-2.5 font-semibold text-fg">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-fg">
          <IconCheck size={14} strokeWidth={2.6} />
        </span>
        Saved to your Downloads
      </p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-[13px] font-medium text-muted hover:text-fg">
          Dismiss
        </button>
      )}
    </div>
  );
}

/**
 * Lookup result for a site that serves each quality as one ready file.
 * @param {{ value: string, label: string, detail?: string }[]} formats  best first; value is the file URL
 * @param {(format) => string} fileName
 */
export function SimpleResult({ site, title, byline, thumbnail, portrait, formats, fileName, downloadId, footnote, children }) {
  const [selected, setSelected] = useState(formats[0].value);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | opened
  const [progress, setProgress] = useState(null);
  const format = formats.find((f) => f.value === selected) || formats[0];

  const download = async () => {
    setStatus("saving");
    setProgress(0);
    const result = await saveFile(format.value, fileName(format), (p) =>
      setProgress(p == null ? null : Math.round(p * 100)),
    );
    setStatus(result);
  };

  return (
    <div className="space-y-6">
      <MediaHeader site={site} title={title} byline={byline} thumbnail={thumbnail} portrait={portrait} />
      {children}
      {formats.length > 1 && (
        <QualityPicker
          name={`${site}-quality`}
          options={formats}
          value={selected}
          onChange={setSelected}
          disabled={status === "saving"}
        />
      )}
      <div className="space-y-3">
        <button
          id={downloadId}
          type="button"
          onClick={download}
          disabled={status === "saving"}
          className="btn btn-lg btn-primary w-full sm:w-auto"
        >
          {status === "saving" ? <Spinner /> : <IconDownload size={18} />}
          {status === "saving" ? "Downloading…" : `Download ${format.label}`}
        </button>
        {status === "saving" && (
          <div className="space-y-1.5">
            <ProgressBar value={progress} />
            <p className="text-xs tabular-nums text-subtle">{progress == null ? "Downloading…" : `${progress}%`}</p>
          </div>
        )}
        {(status === "saved" || status === "opened") && (
          <SavedNote result={status} onDismiss={() => setStatus("idle")} />
        )}
        {footnote && status === "idle" && <p className="text-[13px] leading-5 text-subtle">{footnote}</p>}
      </div>
    </div>
  );
}
