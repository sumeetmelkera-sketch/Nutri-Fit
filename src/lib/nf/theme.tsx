import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "black" | "graphite" | "light" | "system";
export type Accent = "lime" | "amber" | "ember" | "ice";

export const THEMES: { id: ThemeMode; label: string }[] = [
  { id: "black", label: "True Black" },
  { id: "graphite", label: "Graphite" },
  { id: "light", label: "Light" },
  { id: "system", label: "System" },
];

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

function resolve(theme: ThemeMode): "black" | "graphite" | "light" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "graphite";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "graphite";
}

function apply(theme: ThemeMode, accent: Accent) {
  if (typeof document === "undefined") return;
  const resolved = resolve(theme);
  const root = document.documentElement;
  root.dataset["theme"] = resolved;
  root.dataset["accent"] = accent;
  root.classList.toggle("dark", resolved !== "light");
}

function readTheme(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    if (raw === "dark") return "graphite"; // legacy value
    if (raw === "black" || raw === "graphite" || raw === "light" || raw === "system") return raw;
  } catch {
    /* storage may be unavailable */
  }
  return "graphite";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("graphite");
  const [accent, setAccentState] = useState<Accent>("lime");

  useEffect(() => {
    const t = readTheme();
    let a: Accent = "lime";
    try {
      a = (window.localStorage.getItem(ACCENT_KEY) as Accent | null) ?? "lime";
    } catch {
      /* ignore */
    }
    setThemeState(t);
    setAccentState(a);
    apply(t, a);
  }, []);

  const setTheme = useCallback(
    (t: ThemeMode) => {
      setThemeState(t);
      try {
        window.localStorage.setItem(THEME_KEY, t);
      } catch {
        /* ignore */
      }
      apply(t, accent);
    },
    [accent],
  );

  const setAccent = useCallback(
    (a: Accent) => {
      setAccentState(a);
      try {
        window.localStorage.setItem(ACCENT_KEY, a);
      } catch {
        /* ignore */
      }
      apply(theme, a);
    },
    [theme],
  );

  const value = useMemo(
    () => ({ theme, accent, setTheme, setAccent }),
    [theme, accent, setTheme, setAccent],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
