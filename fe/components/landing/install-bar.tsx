"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const COMMAND = "pip install escalate-to-human";

export function InstallBar() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = () => {
    void navigator.clipboard?.writeText(COMMAND);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="mx-auto mb-[26px] inline-flex items-center gap-3.5 rounded-xl border border-line-2 bg-[#080b0a] px-4 py-[13px] font-mono text-[14.5px] max-[560px]:flex-wrap">
      <span className="text-mint">$</span>
      <span className="whitespace-nowrap text-ink">{COMMAND}</span>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "ml-1.5 cursor-pointer rounded-[7px] border border-line-2 bg-white/[0.02] px-2.5 py-[5px] text-xs text-ink-dim transition-all duration-150 hover:border-mint hover:text-ink",
          copied && "border-mint text-mint hover:text-mint",
        )}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
