import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

const PROBLEMS = [
  {
    ico: "// taste",
    title: 'The "it depends" calls',
    body: "Vercel or Cloudflare? Tabs or spaces? Questions with no single right answer — where you want a person's opinion, not a coin flip.",
  },
  {
    ico: "// uncertainty",
    title: "The genuinely stuck moments",
    body: "When the agent is unsure and one quick human call would unblock the whole task — instead of burning tokens guessing.",
  },
  {
    ico: "// judgment",
    title: "The high-stakes forks",
    body: "Ship it or hold? Delete the table or not? The decisions you'd rather a human signed off on before the agent commits.",
  },
];

// Toggled off in the design handoff; kept behind SHOW_PROBLEM in app/landing/page.tsx.
export function Problem() {
  return (
    <section className="py-[88px] max-[560px]:py-16" id="problem">
      <Wrap>
        <Reveal className="mb-[52px] max-w-[62ch]">
          <Eyebrow>The gap</Eyebrow>
          <h2 className="mb-3.5 mt-4 text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            Agents are confident.
            <br />
            That&#39;s exactly the problem.
          </h2>
          <p className="text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-ink-dim">
            When an agent hits something a human should weigh in on, it doesn&#39;t pause — it
            picks. RentOleh gives it a third option: ask.
          </p>
        </Reveal>
        <div className="grid grid-cols-3 gap-[18px] max-[920px]:grid-cols-1">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.ico} index={i}>
              <div className="relative overflow-hidden rounded-[14px] border border-line bg-gradient-to-b from-white/[0.018] to-transparent px-6 pb-7 pt-[26px]">
                <div className="mb-4 font-mono text-[13px] text-mint opacity-90">{p.ico}</div>
                <h3 className="mb-[9px] text-[19px] font-semibold leading-[1.02] tracking-[-0.025em]">
                  {p.title}
                </h3>
                <p className="text-[14.5px] leading-[1.55] text-ink-dim">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
