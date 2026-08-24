import { navItems } from "../nav";
import { cn } from "../lib/utils";
import { Check } from "lucide-react";

const ORDER = ["dashboard", "hazard", "relocation", "safe", "capacity", "simulation", "assistant"];

export function JourneyBar({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (id: string) => void;
}) {
  const current = ORDER.indexOf(active);
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.06] bg-navy-900/30 px-4 py-2 lg:px-8">
      <span className="label-mono mr-2 hidden shrink-0 text-accent/60 sm:inline">Demo Journey</span>
      {ORDER.map((id, i) => {
        const item = navItems.find((n) => n.id === id);
        if (!item) return null;
        const isActive = id === active;
        const done = i < current;
        return (
          <div key={id} className="flex shrink-0 items-center">
            <button
              onClick={() => onNavigate(id)}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "focus-ring flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-white/[0.06] text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                  isActive
                    ? "bg-accent text-navy-950"
                    : done
                    ? "bg-hazard-low/20 text-hazard-low"
                    : "bg-white/[0.06] text-slate-400"
                )}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
            {i < ORDER.length - 1 && <span className="mx-1 text-slate-700">·</span>}
          </div>
        );
      })}
    </div>
  );
}
