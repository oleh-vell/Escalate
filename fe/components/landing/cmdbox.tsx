"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface CmdBoxProps {
  /** The command to copy to the clipboard. Also shown unless `display` is set. */
  command: string;
  /** Optional display text when it differs from what gets copied. */
  display?: string;
  className?: string;
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("block size-[15px]", className)}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("block size-[15px]", className)}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface CmdStep {
  label: string;
  command: string;
}

/** The one quickstart sequence shared by the hero and footer, so the two
 *  blocks can never drift apart. */
export const QUICKSTART_STEPS: CmdStep[] = [
  {
    label: "Install the CLI",
    command:
      'uv tool install "git+https://github.com/oleh-vell/Escalate.git#subdirectory=cli"',
  },
  { label: "Add the skill to Claude Code", command: "escalate install skill " },
  {
    label: "Ask Claude a taste question",
    command: 'claude "Velocity or taste? If unsure escalate to human"',
  },
];

interface CmdBlockProps {
  /** Steps rendered top-to-bottom; the copy button yields one pasteable script. */
  steps: CmdStep[];
  className?: string;
}

function CommandText({ command }: { command: string }) {
  return (
    <code className="text-[14px] font-normal leading-relaxed tracking-[-0.01em] text-ink">
      {command}
    </code>
  );
}

/** A short-lived "copied" flag keyed by an id, so per-step and bulk copies
 *  light up independently without stomping each other's timers. */
function useCopied() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const flash = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1400);
  };

  return [copied, flash] as const;
}

/** Several commands in one terminal-style block. The header button copies a
 *  single pasteable script; each row can also be copied on its own. */
export function CmdBlock({ steps, className }: CmdBlockProps) {
  const [copied, flash] = useCopied();

  const copyAll = () => {
    const script = steps
      .map((step) => `# ${step.label}\n${step.command}`)
      .join("\n\n");
    flash("all", script);
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-[34rem] overflow-hidden rounded-[14px] border border-line-2 bg-panel font-mono",
        "shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_2px_4px_-2px_rgba(13,40,32,0.08),0_24px_48px_-30px_rgba(13,40,32,0.5)]",
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-1 px-4 py-2.5">
        <span className="text-[11px] tracking-[0.02em] text-muted">
          quickstart
        </span>
        <button
          type="button"
          onClick={copyAll}
          aria-label="Copy all commands"
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-all duration-150 motion-reduce:transition-none",
            copied === "all"
              ? "border-mint bg-mint text-white"
              : "border-line-2 bg-bg text-ink-dim hover:border-mint hover:text-mint-deep",
          )}
        >
          {copied === "all" ? (
            <CheckIcon className="size-[13px]" />
          ) : (
            <CopyIcon className="size-[13px]" />
          )}
          <span>{copied === "all" ? "Copied" : "Copy all"}</span>
        </button>
      </div>

      {/* step list */}
      <ol className="flex flex-col gap-0.5 px-2.5 py-2.5 text-sm">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className="group/step rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-bg-1 motion-reduce:transition-none"
          >
            <div className="text-[11px] leading-snug text-muted">
              <span className="text-muted">#</span> {step.label}
            </div>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="flex-none font-medium text-mint">$</span>
              <div className="min-w-0 flex-1 truncate">
                <CommandText command={step.command} />
              </div>
              <button
                type="button"
                onClick={() => flash(String(i), step.command)}
                aria-label={`Copy: ${step.label}`}
                className={cn(
                  "-my-1 grid flex-none cursor-pointer place-items-center rounded-md p-1.5 text-ink-dim transition-all duration-150 hover:bg-bg-2 hover:text-mint-deep focus-visible:opacity-100 motion-reduce:transition-none",
                  "opacity-0 group-hover/step:opacity-100 max-[560px]:opacity-100",
                  copied === String(i) && "text-mint opacity-100",
                )}
              >
                {copied === String(i) ? (
                  <CheckIcon className="size-[13px]" />
                ) : (
                  <CopyIcon className="size-[13px]" />
                )}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CmdBox({ command, display, className }: CmdBoxProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = () => {
    void navigator.clipboard?.writeText(command);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-[11px] rounded-[11px] border border-line-2 bg-white py-3 pl-[15px] pr-3 font-mono text-sm shadow-[0_1px_0_rgba(13,40,32,0.03),0_8px_22px_-18px_rgba(13,40,32,0.35)]",
        className,
      )}
    >
      <span className="flex-none font-medium text-mint">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-ink">
        {display ?? command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command"
        className={cn(
          "ml-auto grid flex-none cursor-pointer place-items-center rounded-lg border p-[7px] transition-all duration-150",
          copied
            ? "border-mint bg-mint text-white"
            : "border-line-2 bg-bg-1 text-ink-dim hover:border-mint hover:bg-[rgba(16,185,129,0.06)] hover:text-mint-deep",
        )}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}
