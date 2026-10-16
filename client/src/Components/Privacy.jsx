import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    id: "collect",
    title: "What we collect",
    body: (
      <p>
        Nothing. Media Saver has no accounts and no servers of its own that receive your links or videos, and the site
        includes no analytics or advertising code. The links you paste and the videos you save stay in your browser.
      </p>
    ),
  },
  {
    id: "stored",
    title: "What's stored in your browser",
    body: (
      <p>
        One setting: whether you chose the light or dark theme, kept in your browser&apos;s local storage. If you add
        the Media Saver bookmark, it lives in your bookmarks like any other. You can remove either at any time.
      </p>
    ),
  },
  {
    id: "services",
    title: "Who your browser talks to",
    body: (
      <>
        <p>
          Using Media Saver means your browser connects to these services. Each handles data under its own privacy
          policy.
        </p>
        <ul>
          <li>
            <strong>The web host that serves this site</strong>, which receives standard request details such as your
            IP address and browser type, as with any website.
          </li>
          <li>
            <strong>YouTube and Instagram</strong>, when you use the bookmark. Your tab on that site requests the
            video&apos;s details and files without your cookies, so the requests aren&apos;t tied to your account.
          </li>
          <li>
            <strong>Google&apos;s video servers and Instagram&apos;s content servers</strong>, which deliver the video
            files.
          </li>
          <li>
            <strong>fxtwitter and vxtwitter</strong>, public services that look up X posts. They receive the
            post&apos;s link. X&apos;s video servers then deliver the file.
          </li>
          <li>
            <strong>unpkg.com</strong>, which serves the free FFmpeg tools the first time you join video and sound or
            convert to MP3.
          </li>
          <li>
            <strong>Any site whose direct video link you paste.</strong>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "bookmark",
    title: "The bookmark and the userscript",
    body: (
      <p>
        The Media Saver bookmark only runs when you click it. It only reaches YouTube and Instagram, never sends your
        cookies, and only hands what it fetches to this site. The optional userscript works the same way for YouTube.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Media Saver isn&apos;t directed at children under 13, and it doesn&apos;t collect personal information from
        anyone.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>If this policy changes, the new version will be posted on this page with a new date at the top.</p>,
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 17, 2026"
      intro="Media Saver is a website that runs entirely in your browser. This policy explains what that means for your information. The short version: we don't collect it."
      sections={SECTIONS}
    />
  );
}
