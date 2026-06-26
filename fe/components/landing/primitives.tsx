import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Wrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative z-[1] mx-auto max-w-[1300px] px-7 max-[560px]:px-[18px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-mint-deep",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-mint shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
      {children}
    </span>
  );
}

export function EscalateMark({ className }: { className?: string }) {
  // Two ascending chevrons — a lead caret with a fading trail, reading as
  // upward motion: the literal gesture of escalating a question to a human.
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
    >
      <path
        d="M8 15.5 16 8.5 24 15.5"
        stroke="currentColor"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 ease-out group-hover/brand:-translate-y-[1.5px] motion-reduce:transition-none motion-reduce:group-hover/brand:translate-y-0"
      />
      <path
        d="M8 23.5 16 16.5 24 23.5"
        stroke="currentColor"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.4}
        className="transition-[transform,opacity] duration-300 ease-out group-hover/brand:-translate-y-[1px] group-hover/brand:opacity-70 motion-reduce:transition-none motion-reduce:group-hover/brand:translate-y-0"
      />
    </svg>
  );
}

export function BrandMark() {
  return (
    <span className="group/brand flex items-center gap-2.5 font-mono text-[15px] font-medium tracking-[-0.01em] text-ink">
      <EscalateMark className="size-[22px] text-mint-deep" />
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
            "radial-gradient(900px 520px at 78% -12%, rgba(16,185,129,0.10), transparent 60%), radial-gradient(680px 480px at 2% 8%, rgba(16,185,129,0.05), transparent 55%)",
        }}
      />
    </div>
  );
}
