import { BrandMark, Wrap } from "./primitives";

export function Footer() {
  return (
    <footer className="border-t border-line pb-12 pt-9">
      <Wrap className="flex flex-wrap items-center justify-between gap-5 font-mono text-[13px]">
        <div className="flex items-center gap-3 text-muted">
          <BrandMark />
        </div>
        <div className="flex gap-[22px] text-ink-dim">
          <a
            className="transition-colors duration-150 hover:text-mint-deep"
            href="#how"
          >
            How it works
          </a>
          <a
            className="transition-colors duration-150 hover:text-mint-deep"
            href="#meet"
          >
            Meet Oleh
          </a>
          <a
            className="transition-colors duration-150 hover:text-mint-deep"
            href="https://github.com/oleh-vell/Escalate"
          >
            GitHub
          </a>
        </div>
      </Wrap>
    </footer>
  );
}
