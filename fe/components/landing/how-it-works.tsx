import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

interface FlowStep {
  num: string;
  title: string;
  body: ReactNode;
  img: string;
  alt: string;
  reverse: boolean;
}

const STEPS: FlowStep[] = [
  {
    num: "01 · AGENT",
    title: "It asks",
    body: "The agent fires one command with its question. Escalate returns a message id instantly, then waits.",
    img: "/loop-it-asks.png",
    alt: "Agent escalating a question to Oleh",
    reverse: false,
  },
  {
    num: "02 · OLEH",
    title: "He answers",
    body: "The question lands to Oleh. He reads it, types a reply, hits send.",
    img: "/loop-oleh-answers.png",
    alt: "Oleh answering a question from the Telegram dashboard",
    reverse: true,
  },
  {
    num: "03 · AGENT",
    title: "It continues",
    body: (
      <>The agent gets the answer, and picks up exactly where it left off.</>
    ),
    img: "/loop-it-continues.png",
    alt: "Agent receiving Oleh's answer and continuing",
    reverse: false,
  },
];

export function HowItWorks() {
  return (
    <section
      className="border-y border-line bg-bg-1 py-[88px] max-[560px]:py-16"
      id="how"
    >
      <Wrap>
        <Reveal className="mb-[52px] max-w-[62ch]">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mb-3.5 mt-4 text-pretty text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            Human taste, in the loop
          </h2>
          <p className="text-pretty text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-ink-dim">
            The agent asks, Oleh weighs in, the agent continues. The whole
            round-trip is three commands away.
          </p>
        </Reveal>

        <div className="flex flex-col gap-[10px] max-[860px]:gap-9">
          {STEPS.map((step) => (
            <Reveal key={step.num}>
              <div
                className={cn(
                  "grid items-center gap-[52px] max-[860px]:grid-cols-1 max-[860px]:gap-5",
                  step.reverse
                    ? "grid-cols-[1.18fr_0.82fr]"
                    : "grid-cols-[0.82fr_1.18fr]",
                )}
              >
                <div
                  className={cn(step.reverse && "max-[860px]:order-1 order-2")}
                >
                  <div className="font-mono text-xs tracking-[0.12em] text-mint-deep">
                    {step.num}
                  </div>
                  <h3 className="mb-3 mt-3.5 text-pretty text-[26px] font-semibold leading-[1.02] tracking-[-0.01em]">
                    {step.title}
                  </h3>
                  <p className="max-w-[42ch] text-pretty text-base leading-[1.6] text-ink-dim max-[860px]:max-w-none">
                    {step.body}
                  </p>
                </div>
                <div
                  className={cn(
                    "relative aspect-square overflow-hidden",
                    step.reverse && "max-[860px]:order-2 order-1",
                  )}
                >
                  <Image
                    src={step.img}
                    alt={step.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 50vw"
                    className="rounded-[10px] object-contain drop-shadow-[0_22px_44px_rgba(13,40,32,0.18)]"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
