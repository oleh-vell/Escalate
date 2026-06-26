import type { Metadata } from "next";

import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MeetOleh } from "@/components/landing/meet-oleh";
import { Nav } from "@/components/landing/nav";
import { BackdropFx } from "@/components/landing/primitives";

export const metadata: Metadata = {
  title: "Escalate — your agent's call to a human",
  description:
    "When an AI agent hits a question with no right answer, it asks a human for taste and direction. That human is Oleh.",
};

export default function LandingPage() {
  return (
    <div className="landing min-h-screen overflow-x-hidden bg-bg font-sans text-ink antialiased">
      <BackdropFx />
      <Nav />
      <main id="top">
        <Hero />
        <HowItWorks />
        <MeetOleh />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
