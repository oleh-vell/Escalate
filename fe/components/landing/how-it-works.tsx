import type { ReactNode } from "react";

import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

interface Step {
  num: string;
  title: string;
  body: ReactNode;
  code: ReactNode;
  arrow: boolean;
}

const STEPS: Step[] = [
  {
    num: "01 · AGENT",
    title: "It asks",
    body: "The agent fires one command with its question. EscalateToHuman returns a message id instantly.",
    code: (
      <>
        <span className="text-mint">escalate</span> ask &quot;...&quot;
        <br />
        <span className="text-muted">→ msg_1234</span>
      </>
    ),
    arrow: true,
  },
  {
    num: "02 · OLEH",
    title: "You answer",
    body: "The question lands on Oleh's dashboard. He reads it, types a reply, hits send. Status flips to responded.",
    code: (
      <>
        <span className="text-mint">/olehdashboard</span>
        <br />
        <span className="text-muted">→ &quot;Vercel is much better&quot;</span>
      </>
    ),
    arrow: true,
  },
  {
    num: "03 · AGENT",
    title: "It continues",
    body: (
      <>
        The agent long-polls with <span className="font-mono text-mint">wait</span> — no
        busy-loops — gets the answer, and picks up exactly where it left off.
      </>
    ),
    code: (
      <>
        <span className="text-mint">escalate</span> messages wait msg_1234
        <br />
        <span className="text-muted">→ resolved ✓</span>
      </>
    ),
    arrow: false,
  },
];

export function HowItWorks() {
  return (
    <section className="py-[88px] max-[560px]:py-16" id="how">
      <Wrap>
        <Reveal className="mb-[52px] max-w-[62ch]">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mb-3.5 mt-4 text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            One question. One loop.
          </h2>
          <p className="text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-ink-dim">
            The agent asks, Oleh answers from a dashboard, the agent continues. The whole
            round-trip is three commands away.
          </p>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-3 overflow-hidden rounded-[14px] border border-line bg-panel max-[920px]:grid-cols-1">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative border-r border-line px-7 pb-[34px] pt-8 last:border-r-0 max-[920px]:border-b max-[920px]:border-r-0 max-[920px]:last:border-b-0"
              >
                <div className="font-mono text-xs tracking-[0.1em] text-mint">{step.num}</div>
                <h3 className="mb-2.5 mt-4 text-[21px] font-semibold leading-[1.02] tracking-[-0.025em]">
                  {step.title}
                </h3>
                <p className="text-[14.5px] text-ink-dim">{step.body}</p>
                <div className="mt-[18px] overflow-x-auto rounded-[9px] border border-line bg-[#080b0a] px-[13px] py-[11px] font-mono text-[12.5px] text-ink-dim">
                  {step.code}
                </div>
                {step.arrow && (
                  <div className="absolute -right-[11px] top-1/2 z-[3] grid size-[22px] -translate-y-1/2 place-items-center rounded-full border border-line-2 bg-bg text-xs text-mint max-[920px]:hidden">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}
