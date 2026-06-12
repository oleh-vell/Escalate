import { Badge } from "@/components/ui/badge";

import { SHOW_FEATURES } from "./flags";
import { BrandMark, Wrap } from "./primitives";

export function Footer() {
  return (
    <footer className="border-t border-line pb-14 pt-10">
      <Wrap className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3 font-mono text-[13px] text-muted">
          <BrandMark />
          <Badge variant="outline">hackathon build · 2026</Badge>
        </div>
        <div className="flex gap-[22px] font-mono text-[13px] text-ink-dim">
          <a className="transition-colors duration-150 hover:text-mint" href="#how">
            How it works
          </a>
          <a className="transition-colors duration-150 hover:text-mint" href="#oleh">
            Oleh
          </a>
          {SHOW_FEATURES && (
            <a className="transition-colors duration-150 hover:text-mint" href="#features">
              Features
            </a>
          )}
        </div>
      </Wrap>
    </footer>
  );
}
