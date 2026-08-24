import { Menu } from "lucide-react";
import { DEMO_LABEL } from "../lib/data";

interface TopBarProps {
  activeLabel: string;
  onToggleSidebar: () => void;
}

export function TopBar({ activeLabel, onToggleSidebar }: TopBarProps) {
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-navy-900/40 px-5 backdrop-blur-xl">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-300 transition-colors hover:bg-white/[0.05] lg:hidden"
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <div className="flex flex-col">
        <h1 className="text-sm font-semibold tracking-tight text-slate-50">{activeLabel}</h1>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span>RAKSHA</span>
          <span className="text-slate-700">/</span>
          <span className="text-accent/60">{DEMO_LABEL}</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[10px] font-medium text-accent/80 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {DEMO_LABEL}
        </span>

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] py-1 pl-1 pr-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent-deep to-accent-blue text-xs font-bold text-navy-950">
            AD
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <div className="text-xs font-medium text-slate-100">A. Das</div>
            <div className="text-[10px] text-slate-500">Operations Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
}
