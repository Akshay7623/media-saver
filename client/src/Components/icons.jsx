// Line icons on a 24px grid. They take the current text color and size from
// className (default 20px).

function Icon({ size = 20, className = "", strokeWidth = 1.8, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`flex-none ${className}`}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconDownload = (p) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Icon>
);
export const IconArrowRight = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const IconExternal = (p) => (
  <Icon {...p}>
    <path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />
  </Icon>
);
export const IconLink = (p) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </Icon>
);
export const IconPaste = (p) => (
  <Icon {...p}>
    <rect x="6" y="4.5" width="12" height="16" rx="2.5" />
    <path d="M9.5 4.5V4a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 4v.5M9.5 11h5M9.5 15h3" />
  </Icon>
);
export const IconCopy = (p) => (
  <Icon {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
    <path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </Icon>
);
export const IconClose = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);
export const IconChevronDown = (p) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);
export const IconSun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Icon>
);
export const IconMoon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </Icon>
);
export const IconMenu = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const IconBookmark = (p) => (
  <Icon {...p}>
    <path d="M7 3.5h10a1 1 0 0 1 1 1v16l-6-4-6 4v-16a1 1 0 0 1 1-1z" />
  </Icon>
);
export const IconShield = (p) => (
  <Icon {...p}>
    <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);
export const IconBolt = (p) => (
  <Icon {...p}>
    <path d="M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z" />
  </Icon>
);
export const IconMusic = (p) => (
  <Icon {...p}>
    <path d="M9 18V5.5l11-2V16" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
  </Icon>
);
export const IconFilm = (p) => (
  <Icon {...p}>
    <rect x="3" y="5.5" width="13" height="13" rx="2.5" />
    <path d="M16 10l5-3v10l-5-3" />
  </Icon>
);
export const IconPhone = (p) => (
  <Icon {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Icon>
);
export const IconServer = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="7" rx="2" />
    <rect x="4" y="13" width="16" height="7" rx="2" />
    <path d="M8 7.5h.01M8 16.5h.01" />
  </Icon>
);
export const IconInfo = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icon>
);
export const IconAlert = (p) => (
  <Icon {...p}>
    <path d="M10.3 4.2L2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
    <path d="M12 9.5v4M12 17h.01" />
  </Icon>
);
export const IconGrip = (p) => (
  <Icon {...p} strokeWidth={2.6}>
    <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
  </Icon>
);
export const IconGift = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="8" width="17" height="4" rx="1" />
    <path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12M12 8v12.5" />
    <path d="M12 8C10.5 5 7 4.5 7 6.5S10 8 12 8zM12 8c1.5-3 5-3.5 5-1.5S14 8 12 8z" />
  </Icon>
);
export const IconRefresh = (p) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4" />
  </Icon>
);

// ── Site marks ─────────────────────────────────────────────────────────────
// Simple shapes that name each site at a glance. They take the current color.

export const YouTubeMark = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`flex-none ${className}`}>
    <rect x="2" y="5" width="20" height="14" rx="4.5" fill="currentColor" />
    <path d="M10 9v6l5.2-3z" fill="#fff" />
  </svg>
);
export const InstagramMark = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`flex-none ${className}`} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17" cy="7" r="0.6" fill="currentColor" />
  </svg>
);
export const XMark = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`flex-none ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" />
    <path d="M8.5 8l7 8M15.5 8l-7 8" fill="none" strokeWidth="2.2" strokeLinecap="round" className="stroke-page" />
  </svg>
);
export const FileMark = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`flex-none ${className}`} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
    <path d="M6 3.5h8l4.5 4.5v12a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z" />
    <path d="M10 11v6l4.5-3z" fill="currentColor" stroke="none" />
  </svg>
);
