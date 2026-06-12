import { Button } from "@/components/ui/button";

import { SHOW_FEATURES } from "./flags";
import { BrandMark, Wrap } from "./primitives";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(7,9,10,0.64)] backdrop-blur-[14px] backdrop-saturate-[1.2]">
      <Wrap className="flex h-16 items-center justify-between">
        <a href="#top">
          <BrandMark />
        </a>
        <nav className="flex items-center gap-7 max-[920px]:hidden">
          <a
            className="whitespace-nowrap text-sm text-ink-dim transition-colors duration-150 hover:text-ink"
            href="#how"
          >
            How it works
          </a>
          <a
            className="whitespace-nowrap text-sm text-ink-dim transition-colors duration-150 hover:text-ink"
            href="#oleh"
          >
            Meet Oleh
          </a>
          {SHOW_FEATURES && (
            <a
              className="whitespace-nowrap text-sm text-ink-dim transition-colors duration-150 hover:text-ink"
              href="#features"
            >
              Features
            </a>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <a href="#">GitHub</a>
          </Button>
          <Button asChild variant="primary" size="sm">
            <a href="#start">Install CLI</a>
          </Button>
        </div>
      </Wrap>
    </header>
  );
}
