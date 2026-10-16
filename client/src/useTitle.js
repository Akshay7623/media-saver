import { useEffect } from "react";

const SITE = "Media Saver";
const HOME_TITLE = "Media Saver — Save videos from YouTube, Instagram and X";

/** Sets the tab title: "Page · Media Saver", or the home title for null. */
export function useTitle(page) {
  useEffect(() => {
    document.title = page ? `${page} · ${SITE}` : HOME_TITLE;
  }, [page]);
}
