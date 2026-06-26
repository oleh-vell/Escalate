import { Button } from "@/components/ui/button";

import { CmdBlock, QUICKSTART_STEPS } from "./cmdbox";
import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="py-[88px] max-[560px]:py-16" id="start">
      <Wrap>
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[20px] border border-line-2 px-12 py-16 text-center shadow-[0_30px_70px_-50px_rgba(13,40,32,0.5)] max-[560px]:px-[22px] max-[560px]:py-11"
            style={{
              background:
                "radial-gradient(600px 320px at 50% -10%, rgba(16,185,129,0.12), transparent 70%), linear-gradient(180deg, #ffffff, var(--bg-1))",
            }}
          >
            <Eyebrow className="justify-center">Stop guessing</Eyebrow>
            <h2 className="mb-4 mt-3.5 text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
              Start in three commands.
            </h2>
            <p className="mx-auto mb-[30px] max-w-[48ch] text-lg text-ink-dim">
              The next time your agent isn&#39;t sure — it asks Oleh.
            </p>
            <div className="mx-auto mb-7 w-full max-w-[34rem]">
              <CmdBlock
                steps={QUICKSTART_STEPS}
                className="w-full max-w-none text-left"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="primary">
                <a href="#how">See how it works</a>
              </Button>
              <Button asChild variant="ghost">
                <a
                  href="https://github.com/oleh-vell/Escalate"
                  className="inline-flex items-center gap-1.5"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
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
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}
