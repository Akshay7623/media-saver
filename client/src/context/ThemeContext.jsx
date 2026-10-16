import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "vidsaver-theme";
const BAR_COLORS = { light: "#f7f7f2", dark: "#0c0d0b" };

const ThemeContext = createContext({ isDark: false, toggle: () => {} });

// index.html applies the saved theme before the first paint; this keeps the
// <html> class, the browser bar color and the saved choice in step after that.
export function AppThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR_COLORS[isDark ? "dark" : "light"]);
  }, [isDark]);

  const toggle = () => {
    setIsDark((dark) => {
      try {
        localStorage.setItem(STORAGE_KEY, dark ? "light" : "dark");
      } catch {
        /* storage blocked: the choice lasts until the page closes */
      }
      return !dark;
    });
  };

  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => useContext(ThemeContext);
