import type { Metadata } from "next";

import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { SHOW_FEATURES, SHOW_PROBLEM } from "@/components/landing/flags";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MeetOleh } from "@/components/landing/meet-oleh";
import { Nav } from "@/components/landing/nav";
import { Problem } from "@/components/landing/problem";
import { BackdropFx } from "@/components/landing/primitives";

export const metadata: Metadata = {
  title: "EscalateToHuman — your agent's call to a human",
  description:
    "When your coding agent hits a judgment call, escalate pages a human — and waits for the answer before it ships.",
};

export default function LandingPage() {
  return (
    <div className="landing min-h-screen overflow-x-hidden bg-bg font-sans text-ink antialiased">
      <BackdropFx />
      <Nav />
      <main id="top">
        <Hero />
        {SHOW_PROBLEM && <Problem />}
        <HowItWorks />
        <MeetOleh />
        {SHOW_FEATURES && <Features />}
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
