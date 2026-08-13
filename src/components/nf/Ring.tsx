import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Ring({
  value,
  max,
  size = 132,
  stroke = 11,
  label,
  unit,
  className,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label?: string;
  unit?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="nf-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--lime)" />
            <stop offset="55%" stopColor="var(--amber)" />
            <stop offset="100%" stopColor="var(--ember)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-elevated)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#nf-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - c * shown}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <AnimatedNumber value={Math.round(value)} className="text-2xl font-bold tracking-tight" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {label ?? `/ ${Math.round(max)}${unit ?? ""}`}
        </span>
      </div>
    </div>
  );
}

export function AnimatedNumber({
  value,
  className,
  suffix,
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const from = display;
    const diff = value - from;
    if (diff === 0) return;
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + diff * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}

export function Bar({
  value,
  max,
  tone = "lime",
}: {
  value: number;
  max: number;
  tone?: "lime" | "amber" | "ember";
}) {
  const p = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  const color = tone === "lime" ? "var(--lime)" : tone === "amber" ? "var(--amber)" : "var(--ember)";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
      <div
        className="h-full rounded-full"
        style={{
          width: `${p}%`,
          background: color,
          transition: "width 800ms cubic-bezier(.2,.8,.2,1)",
        }}
      />
    </div>
  );
}
