import { Button } from "@/components/ui/button";

import { BrandMark, Wrap } from "./primitives";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(255,255,255,0.78)] backdrop-blur-[14px] backdrop-saturate-[1.2]">
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
            href="#meet"
          >
            Meet the human
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://github.com/oleh-vell/Escalate"
              className="inline-flex items-center gap-1.5"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </Button>
        </div>
      </Wrap>
    </header>
  );
}
