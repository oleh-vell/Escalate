import type { Metadata } from "next";

import { OlehDashboard } from "@/components/dashboard/oleh-dashboard";

export const metadata: Metadata = {
  title: "RentOleh — Oleh's inbox",
  description: "Pending agent questions, answered by Oleh.",
};

export default function OlehDashboardPage() {
  return <OlehDashboard />;
}
