import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative z-[1] mx-auto max-w-[1160px] px-7 max-[560px]:px-[18px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-mint",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-mint shadow-[0_0_10px_var(--mint)]" />
      {children}
    </span>
  );
}

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium tracking-[-0.01em] text-ink">
      <span className="grid size-[22px] place-items-center rounded-md bg-mint font-bold text-[#04120c] shadow-[0_0_18px_rgba(116,242,192,0.45)]">
        r
      </span>
      <span>escalate</span>
    </span>
  );
}

export function BackdropFx() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 72% -8%, rgba(116,242,192,0.10), transparent 60%), radial-gradient(700px 500px at 8% 18%, rgba(116,242,192,0.05), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
