import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    id: "using",
    title: "Using Media Saver",
    body: (
      <p>
        Media Saver is a free tool for saving videos from links you provide. By using this website you agree to these
        terms and to follow the laws that apply to you. If you don&apos;t agree, please don&apos;t use it.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <p>
        Only download videos you have the right to save: your own uploads, videos whose license allows downloading, or
        content you have permission to keep. You&apos;re responsible for respecting copyright and the terms of the
        sites you download from. Don&apos;t use Media Saver to infringe anyone&apos;s rights.
      </p>
    ),
  },
  {
    id: "license",
    title: "License",
    body: (
      <p>
        The website&apos;s own design, text and code are protected by copyright. You may use the site for personal,
        non-commercial purposes. You may not copy or modify its materials, use them commercially or for public display,
        attempt to reverse engineer its software, remove copyright notices, or mirror the site on another server. This
        license ends automatically if you break these restrictions.
      </p>
    ),
  },
  {
    id: "warranty",
    title: "No warranty",
    body: (
      <p>
        Media Saver is provided as is, without warranties of any kind, express or implied. We don&apos;t promise that it
        will work for every video, that it will always be available, or that the information on the site is accurate,
        complete or current.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        Media Saver and its makers aren&apos;t liable for any damages that arise from using, or being unable to use, the
        site, even if we&apos;ve been told such damage is possible. Some jurisdictions don&apos;t allow these limits, so
        they may not apply to you.
      </p>
    ),
  },
  {
    id: "other-sites",
    title: "Other websites",
    body: (
      <p>
        Media Saver works with YouTube, Instagram, X and other sites it doesn&apos;t control. They can change at any
        time, which may stop downloads from working. We aren&apos;t responsible for their content, and a link to a site
        doesn&apos;t mean we endorse it. You use other sites at your own risk.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may revise these terms at any time without notice. The version on this page is the one that applies, so
        please check back from time to time.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of the applicable jurisdiction, without regard to its conflict of law
        provisions.
      </p>
    ),
  },
];

export default function TandC() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="October 17, 2026"
      intro="Please read these terms before using Media Saver. By using the site, you agree to them."
      sections={SECTIONS}
    />
  );
}
