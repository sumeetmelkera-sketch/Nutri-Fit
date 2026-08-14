import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "dark" | "light";
export type Accent = "lime" | "amber" | "ember" | "ice";

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "lime", label: "Lime", swatch: "oklch(0.85 0.22 132)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.85 0.18 92)" },
  { id: "ember", label: "Ember", swatch: "oklch(0.74 0.19 55)" },
  { id: "ice", label: "Ice", swatch: "oklch(0.82 0.13 215)" },
];

const THEME_KEY = "nutrifit.theme";
const ACCENT_KEY = "nutrifit.accent";

type Ctx = {
  theme: ThemeMode;
  accent: Accent;
  setTheme: (t: ThemeMode) => void;
  setAccent: (a: Accent) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function apply(theme: ThemeMode, accent: Accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset["theme"] = theme;
  root.dataset["accent"] = accent;
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [accent, setAccentState] = useState<Accent>("lime");

  useEffect(() => {
    const t = (window.localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? "dark";
    const a = (window.localStorage.getItem(ACCENT_KEY) as Accent | null) ?? "lime";
    setThemeState(t);
    setAccentState(a);
    apply(t, a);
  }, []);

  const setTheme = useCallback(
    (t: ThemeMode) => {
      setThemeState(t);
      window.localStorage.setItem(THEME_KEY, t);
      apply(t, accent);
    },
    [accent],
  );

  const setAccent = useCallback(
    (a: Accent) => {
      setAccentState(a);
      window.localStorage.setItem(ACCENT_KEY, a);
      apply(theme, a);
    },
    [theme],
  );

  const value = useMemo(() => ({ theme, accent, setTheme, setAccent }), [theme, accent, setTheme, setAccent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
