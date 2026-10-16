import desktopGuideGif from "./assets/guides/desktop-bookmark.gif";
import desktopGuideStill from "./assets/guides/desktop-bookmark.png";
import androidGuideGif from "./assets/guides/android-bookmark.gif";
import androidGuideStill from "./assets/guides/android-bookmark.png";
import igDesktopGuideGif from "./assets/guides/instagram-desktop-bookmark.gif";
import igDesktopGuideStill from "./assets/guides/instagram-desktop-bookmark.png";
import igAndroidGuideGif from "./assets/guides/instagram-android-bookmark.gif";
import igAndroidGuideStill from "./assets/guides/instagram-android-bookmark.png";

// Browsers give javascript: bookmarks a generic icon and no way to set one,
// but they name a dragged bookmark after the link's text. So the emoji in the
// name is the bookmark's logo, and the button reads exactly as the bookmark
// will appear in the bar.
export const BOOKMARK_NAME = "⬇️ Media Saver";

// Phones have no bookmarks bar to drag a link to. Android visitors copy the
// bookmark code instead, save it as a bookmark's address, and run it from
// Chrome's address bar.
export const isAndroid = /Android/i.test(navigator.userAgent);

export const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

// Animated walkthroughs of the setup steps, one per site, for this kind of
// device. They're made from client/guides/*.html by client/guides/make-gifs.mjs.
// Visitors who ask for reduced motion get a still frame instead.
const FRAME = isAndroid
  ? { width: 300, height: 580, cls: "max-w-[300px]" }
  : { width: 560, height: 360, cls: "max-w-[560px]" };

export const GUIDES = {
  youtube: isAndroid
    ? {
        ...FRAME,
        gif: androidGuideGif,
        still: androidGuideStill,
        alt: "Animation of the steps: copy the bookmark code, bookmark the page and paste the code as its address, paste the video link into Chrome's address bar, then type Media Saver there, tap the bookmark and download.",
      }
    : {
        ...FRAME,
        gif: desktopGuideGif,
        still: desktopGuideStill,
        alt: "Animation of the steps: drag the Media Saver button to the bookmarks bar, open the video on YouTube, click the bookmark, then pick a quality and download in the Media Saver tab that opens.",
      },
  instagram: isAndroid
    ? {
        ...FRAME,
        gif: igAndroidGuideGif,
        still: igAndroidGuideStill,
        alt: "Animation of the steps: copy the bookmark code, bookmark the page and paste the code as its address, paste the reel link into Chrome's address bar, then, without logging in, type Media Saver there, tap the bookmark and download the reel.",
      }
    : {
        ...FRAME,
        gif: igDesktopGuideGif,
        still: igDesktopGuideStill,
        alt: "Animation of the steps: drag the Media Saver button to the bookmarks bar, open the reel on Instagram, click the bookmark there without logging in, then download the reel in the Media Saver tab that opens.",
      },
};

// Falls back to execCommand where the Clipboard API is missing, such as on a
// page served over plain http on the local network.
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    Object.assign(area.style, { position: "fixed", opacity: "0" });
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}
