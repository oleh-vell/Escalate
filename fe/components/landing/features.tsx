import type { ReactNode } from "react";

import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

const FEATURES: { fk: string; title: string; body: ReactNode }[] = [
  {
    fk: "// wait",
    title: "No busy-loops",
    body: (
      <>
        The <span className="font-mono text-mint">wait</span> command long-polls and blocks until
        answered — agents don&#39;t burn cycles re-checking.
      </>
    ),
  },
  {
    fk: "// confirm-first",
    title: "Polite by default",
    body: "The skill tells the agent to confirm with you before paging Oleh — unless you explicitly asked it to.",
  },
  {
    fk: "// postgres",
    title: "Durable queue",
    body: "Every question is persisted in Postgres. Nothing is lost if the agent restarts mid-task.",
  },
  {
    fk: "// dashboard",
    title: "Live & auto-refresh",
    body: "Oleh's dashboard polls for pending questions on an interval — new asks appear without a manual reload.",
  },
  {
    fk: "// kubectl",
    title: "Familiar surface",
    body: (
      <>
        Noun/verb commands modeled on kubectl. If you know <span className="font-mono">get</span>{" "}
        and <span className="font-mono">list</span>, you know escalate.
      </>
    ),
  },
  {
    fk: "// one env var",
    title: "Zero-setup demo",
    body: (
      <>
        Point <span className="font-mono text-mint">ESCALATE_API_URL</span> at your backend and go.
        No auth to wire up for the hackathon.
      </>
    ),
  },
];

// Toggled off in the design handoff; kept behind SHOW_FEATURES in app/landing/page.tsx.
export function Features() {
  return (
    <section className="py-[88px] max-[560px]:py-16" id="features">
      <Wrap>
        <Reveal className="mb-[52px] max-w-[62ch]">
          <Eyebrow>Why it works</Eyebrow>
          <h2 className="mt-4 text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            Built to be dropped
            <br />
            into any agent loop.
          </h2>
        </Reveal>
        <div className="grid grid-cols-3 gap-4 max-[920px]:grid-cols-1">
          {FEATURES.map((f, i) => (
            <Reveal key={f.fk} index={i}>
              <div className="rounded-[14px] border border-line bg-gradient-to-b from-white/[0.015] to-transparent p-6 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-line-2">
                <div className="font-mono text-xs text-mint">{f.fk}</div>
                <h3 className="mb-2 mt-3.5 text-[17px] font-semibold leading-[1.02] tracking-[-0.025em]">
                  {f.title}
                </h3>
                <p className="text-sm leading-[1.55] text-ink-dim">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
