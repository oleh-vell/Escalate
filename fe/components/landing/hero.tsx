import { Button } from "@/components/ui/button";

import { ClaudeCodeSession } from "./claude-code-session";
import { CmdBlock, QUICKSTART_STEPS } from "./cmdbox";
import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section className="pb-9 pt-16 max-[560px]:pt-10">
      <Wrap className="grid grid-cols-[1.12fr_0.88fr] items-stretch gap-12 max-[920px]:grid-cols-1 max-[920px]:gap-10">
        <Reveal className="flex flex-col self-stretch pb-4">
          <Eyebrow>Human-in-the-loop for AI agents</Eyebrow>
          <h1 className="mb-[22px] mt-5 text-[clamp(38px,5vw,62px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            A <span className="text-mint">human</span> as a service
            <br />
            your agent can call.
          </h1>
          <p className="max-w-[36ch] text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-ink-dim">
            When an AI agent hits a question with no right answer, it asks a
            human for taste and direction.{" "}
            <span className="whitespace-nowrap">
              That human is{" "}
              <a
                href="https://www.linkedin.com/in/oleh-velychko/"
                target="_blank"
                rel="noopener"
                className="text-mint-deep underline underline-offset-[3px]"
              >
                Oleh
              </a>
              .
            </span>
          </p>

          <CmdBlock steps={QUICKSTART_STEPS} className="mt-10" />
        </Reveal>

        <Reveal className="flex flex-col self-stretch pt-10" index={1}>
          <ClaudeCodeSession />
        </Reveal>
      </Wrap>
    </section>
  );
}
