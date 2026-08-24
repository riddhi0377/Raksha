import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { JourneyBar } from "./components/JourneyBar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { navItems } from "./nav";
import { Dashboard } from "./components/views/Dashboard";
import { HazardIntelligence } from "./components/views/HazardIntelligence";
import { RelocationPriority } from "./components/views/RelocationPriority";
import { SafeSites } from "./components/views/SafeSites";
import { CapacityAnalysis } from "./components/views/CapacityAnalysis";
import { Simulation } from "./components/views/Simulation";
import { Assistant } from "./components/views/Assistant";

import type { ComponentType } from "react";

const views: Record<string, ComponentType<{ onNavigate: (id: string) => void }>> = {
  dashboard: Dashboard,
  hazard: HazardIntelligence,
  relocation: RelocationPriority,
  safe: SafeSites,
  capacity: CapacityAnalysis,
  simulation: Simulation,
  assistant: Assistant,
};

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const ActiveView = views[active];
  const activeLabel = navItems.find((n) => n.id === active)?.label ?? "Command Center";

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-navy-850 text-slate-200">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-blue/5 blur-[120px]" />

      <Sidebar
        active={active}
        onNavigate={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar activeLabel={activeLabel} onToggleSidebar={() => setCollapsed((c) => !c)} />

        <JourneyBar active={active} onNavigate={setActive} />

        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-[1400px]"
            >
              <ErrorBoundary>
                <ActiveView onNavigate={setActive} />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
