import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Apple, Dumbbell, Home, TrendingUp, User } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import logo from "@/assets/nutrifit-logo.png.asset.json";
import { useNutriFit } from "@/lib/nf/store";
import { getTrainer } from "@/lib/nf/trainers";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/nutrition", label: "Nutrition", icon: Apple },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/me", label: "Me", icon: User },
] as const;


export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((t) => {
          const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className="press flex flex-col items-center gap-1 py-2.5"
              aria-label={t.label}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string | undefined;
}) {
  const { state } = useNutriFit();
  const trainer = getTrainer(state?.profile.trainer_id);
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pb-3 pt-5">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <Link to="/trainer" className="press shrink-0" aria-label="Your trainer">
        <img
          src={trainer.image}
          alt={trainer.name}
          width={44}
          height={44}
          loading="lazy"
          className="h-11 w-11 rounded-full border border-border object-cover"
        />
      </Link>
    </header>
  );
}

export function Brand({ size = 44 }: { size?: number }) {
  return (
    <img
      src={logo.url}
      alt="NutriFit logo"
      width={size}
      height={size}
      className="rounded-2xl"
      style={{ width: size, height: size }}
    />
  );
}

/** Guards a screen: sends users without a Keypass to onboarding. */
export function Screen({
  title,
  subtitle,
  children,
  header = true,
}: {
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
  header?: boolean;
}) {
  const { ready, keypass, state, loading, error, signOut } = useNutriFit();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !keypass) navigate({ to: "/welcome" });
  }, [ready, keypass, navigate]);

  if (!ready || (keypass && loading)) {
    return (
      <div className="grid min-h-screen place-items-center gap-4 bg-background">
        <div className="flex flex-col items-center gap-4">
          <Brand size={56} />
          <div className="sheen h-1.5 w-28 rounded-full bg-elevated" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-8 text-center">
        <div className="space-y-4">
          <Brand size={56} />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={signOut} className="press energy-bg rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Use another Keypass
          </button>
        </div>
      </div>
    );
  }

  if (!state) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md">
        {header ? <AppHeader title={title} subtitle={subtitle} /> : null}
        <main className="space-y-4 px-5">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

export function Card({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={cn("surface rise p-4", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}
