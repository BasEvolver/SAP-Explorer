import { Suspense } from "react";
import ScenariosDashboard from "@/components/scenarios/ScenariosDashboard";

export const metadata = {
  title: "Aria Closed-Loop Scenarios - SAP Explorer",
  description: "Enterprise-grade financial optimization scenarios with live SAP and direct BAPI write-back tracking.",
};

export default function ScenariosPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow w-full h-full flex flex-col items-center justify-center bg-evolver-bg-dark text-slate-400 p-8">
        <div className="animate-pulse font-mono text-sm">Loading Aria Scenarios...</div>
      </div>
    }>
      <ScenariosDashboard />
    </Suspense>
  );
}
