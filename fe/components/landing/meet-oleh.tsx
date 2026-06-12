import Image from "next/image";

import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

export function MeetOleh() {
  return (
    <section className="py-[88px] max-[560px]:py-16" id="oleh">
      <Wrap className="grid grid-cols-[0.82fr_1.18fr] items-center gap-[52px] max-[920px]:grid-cols-1 max-[920px]:gap-9">
        <Reveal>
          <div className="relative aspect-[1024/1180] overflow-hidden rounded-[14px] border border-line-2 max-[920px]:max-w-[360px]">
            <Image
              src="/oleh-original.png"
              alt="Oleh"
              fill
              sizes="(max-width: 920px) 360px, 38vw"
              className="object-cover object-[50%_22%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-45% to-[rgba(7,9,10,0.85)]" />
            <div className="absolute bottom-3.5 left-4 z-[2] flex items-center gap-2 font-mono text-xs text-mint">
              <span className="size-[7px] animate-pulse-dot-slow rounded-full bg-mint shadow-[0_0_10px_var(--mint)] motion-reduce:animate-none" />
              online · 1 command away
            </div>
          </div>
        </Reveal>
        <Reveal index={1}>
          <Eyebrow>Meet Oleh</Eyebrow>
          <h2 className="mb-[18px] mt-3.5 text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            The human in your loop.
          </h2>
          <p className="max-w-[48ch] text-base text-ink-dim">
            Oleh answers the questions your agent shouldn&#39;t answer alone. The taste calls, the
            judgment calls, the &quot;I&#39;m honestly not sure&quot; ones.
          </p>
          <p className="mt-3.5 max-w-[48ch] text-base text-ink-dim">
            He&#39;s got opinions, a dashboard, and a 2.4-second average response time. Your agent
            doesn&#39;t need to be right about everything — it just needs to know when to ask.
          </p>
          <div className="mt-[26px] border-l-2 border-mint py-1 pl-[18px]">
            <p className="text-lg italic text-ink">&quot;Vercel is much better.&quot;</p>
            <div className="mt-2 font-mono text-xs not-italic text-muted">
              — Oleh, responding to msg_1234
            </div>
          </div>
          <div className="mt-[30px] flex gap-[30px]">
            <div>
              <div className="text-[30px] font-semibold tracking-[-0.02em] text-mint">2.4s</div>
              <div className="mt-1 font-mono text-xs text-muted">avg response</div>
            </div>
            <div>
              <div className="text-[30px] font-semibold tracking-[-0.02em]">∞</div>
              <div className="mt-1 font-mono text-xs text-muted">opinions held</div>
            </div>
            <div>
              <div className="text-[30px] font-semibold tracking-[-0.02em]">0</div>
              <div className="mt-1 font-mono text-xs text-muted">hallucinations</div>
            </div>
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}
