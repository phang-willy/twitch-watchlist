import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "extension_theme_preference";

function applyTheme(preference: ThemePreference): void {
  const isDark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function useThemePreference() {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    const nextTheme =
      saved === "system" || saved === "light" || saved === "dark"
        ? saved
        : "system";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);

    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return { theme, setTheme };
}

