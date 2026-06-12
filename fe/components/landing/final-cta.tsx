import { Button } from "@/components/ui/button";

import { Eyebrow, Wrap } from "./primitives";
import { InstallBar } from "./install-bar";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="py-[88px] max-[560px]:py-16" id="start">
      <Wrap>
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[20px] border border-line-2 px-12 py-16 text-center max-[560px]:px-[22px] max-[560px]:py-11"
            style={{
              background:
                "radial-gradient(600px 300px at 50% 0%, rgba(116,242,192,0.10), transparent 70%), linear-gradient(180deg, #0c100f, #090c0b)",
            }}
          >
            <Eyebrow className="justify-center">Stop guessing</Eyebrow>
            <h2 className="mb-4 mt-3.5 text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
              Give your agent
              <br />a human to call.
            </h2>
            <p className="mx-auto mb-[30px] max-w-[48ch] text-lg text-ink-dim">
              One install, one env var, one command. The next time your agent isn&#39;t sure — it
              asks Oleh.
            </p>
            <InstallBar />
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="primary">
                <a href="#top">Get started →</a>
              </Button>
              <Button asChild variant="ghost">
                <a href="#how">See how it works</a>
              </Button>
            </div>
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}
