import { motion } from "framer-motion";
import { ShieldHalf, Activity, ChevronsLeft } from "lucide-react";
import { navItems } from "../nav";
import { cn } from "../lib/utils";
import { DEMO_LABEL } from "../lib/data";

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ active, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex h-full shrink-0 flex-col border-r border-white/[0.06] bg-navy-900/60 backdrop-blur-xl"
    >
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-blue text-navy-950 shadow-glow">
          <ShieldHalf className="h-5 w-5" strokeWidth={2.4} />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col leading-none"
          >
            <span className="text-sm font-bold tracking-tight text-slate-50">RAKSHA</span>
            <span className="label-mono mt-1 text-[9px] text-accent/60">Hazard Command</span>
          </motion.div>
        )}
      </div>

      <div className="px-3">
        {!collapsed && (
          <div className="label-mono mb-2 px-2 text-[9px]">Navigation</div>
        )}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "text-slate-50"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-accent/10 ring-1 ring-inset ring-accent/25"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-[18px] w-[18px] shrink-0",
                    isActive ? "text-accent" : "text-slate-500 group-hover:text-slate-300"
                  )}
                  strokeWidth={2}
                />
                {!collapsed && (
                  <span className="relative z-10 flex-1 text-left font-medium">
                    {item.label}
                  </span>
                )}
                {!collapsed && item.hint && (
                  <span className="relative z-10 text-[10px] text-slate-600">{item.hint}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hazard-low/10 text-hazard-low ring-1 ring-hazard-low/20">
              <Activity className="h-4 w-4" />
            </div>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-hazard-low" />
          </div>
        ) : (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-hazard-low opacity-60 animate-pulseRing" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-hazard-low" />
              </span>
              <span className="text-xs font-medium text-slate-200">Telemetry Live</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {DEMO_LABEL} · 412 sensors online
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.06] py-2 text-xs text-slate-500 transition-colors hover:text-slate-200"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </motion.aside>
  );
}
