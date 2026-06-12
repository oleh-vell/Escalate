import { Button } from "@/components/ui/button";

import { ClaudeCodeSession } from "./claude-code-session";
import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section className="pb-[30px] pt-[70px]">
      <Wrap className="grid grid-cols-[1.05fr_0.95fr] items-center gap-14 max-[920px]:grid-cols-1 max-[920px]:gap-9">
        <Reveal>
          <Eyebrow>Human-in-the-loop for AI agents</Eyebrow>
          <h1 className="mb-[22px] mt-5 text-[clamp(40px,6.4vw,82px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            When the agent
            <br />
            isn&#39;t sure,
            <br />
            it asks <span className="text-mint">Oleh.</span>
          </h1>
          <p className="max-w-[34ch] text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-ink-dim">
            When your coding agent hits a judgment call, rentoleh pages a human — and waits for
            the answer before it ships.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <a href="#start">Install the CLI →</a>
            </Button>
            <Button asChild variant="ghost">
              <a href="#how">See the loop</a>
            </Button>
          </div>
          <div className="mt-[26px] flex flex-wrap items-center gap-2.5 font-mono text-[13px] text-muted">
            <span className="rounded-full border border-line bg-white/[0.02] px-[11px] py-[5px] text-ink-dim">
              pip install rentoleh
            </span>
            <span>drops into Claude Code as a skill</span>
          </div>
        </Reveal>

        <Reveal index={1}>
          <ClaudeCodeSession />
        </Reveal>
      </Wrap>
    </section>
  );
}
