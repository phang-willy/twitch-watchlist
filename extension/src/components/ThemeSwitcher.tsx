import type { Dispatch, SetStateAction } from "react";
import { HiOutlineComputerDesktop, HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

import type { ThemePreference } from "@/hooks/useThemePreference";

type ThemeSwitcherProps = {
  theme: ThemePreference;
  setTheme: Dispatch<SetStateAction<ThemePreference>>;
};

export function ThemeSwitcher({ theme, setTheme }: ThemeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 self-start rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-700">
      <button
        type="button"
        title="Theme appareil"
        onClick={() => setTheme("system")}
        className={`rounded p-1.5 transition cursor-pointer ${
          theme === "system"
            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        }`}
      >
        <HiOutlineComputerDesktop className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Theme clair"
        onClick={() => setTheme("light")}
        className={`rounded p-1.5 transition cursor-pointer ${
          theme === "light"
            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        }`}
      >
        <HiOutlineSun className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Theme sombre"
        onClick={() => setTheme("dark")}
        className={`rounded p-1.5 transition cursor-pointer ${
          theme === "dark"
            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        }`}
      >
        <HiOutlineMoon className="h-4 w-4" />
      </button>
    </div>
  );
}

