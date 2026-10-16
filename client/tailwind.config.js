import defaultTheme from "tailwindcss/defaultTheme";

// Colors are CSS variables (src/index.css), so light and dark mode share one
// set of class names: bg-card, text-muted, border-line and so on.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        page: token("page"),
        card: token("card"),
        sunken: { DEFAULT: token("sunken"), 2: token("sunken-2") },
        line: { DEFAULT: token("line"), strong: token("line-strong") },
        fg: token("fg"),
        muted: token("muted"),
        subtle: token("subtle"),
        accent: {
          DEFAULT: token("accent"),
          strong: token("accent-strong"),
          fg: token("accent-fg"),
          ink: token("accent-ink"),
        },
        danger: token("danger"),
        warn: token("warn"),
        youtube: token("youtube"),
        instagram: token("instagram"),
      },
      fontFamily: {
        sans: ['"Inter Variable"', ...defaultTheme.fontFamily.sans],
        display: ['"Bricolage Grotesque Variable"', '"Inter Variable"', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        lift: "var(--shadow-lift)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        indeterminate: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(300%)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 280ms cubic-bezier(.2,.7,.3,1) both",
        indeterminate: "indeterminate 1.2s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
};
