import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "panel p-5",
        hover && "transition-colors duration-300 hover:border-accent/30 hover:bg-white/[0.04]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

type BadgeTone = "accent" | "critical" | "high" | "moderate" | "low" | "neutral" | "ok";

const toneMap: Record<BadgeTone, string> = {
  accent: "bg-accent/10 text-accent ring-accent/25",
  critical: "bg-hazard-critical/10 text-hazard-critical ring-hazard-critical/30",
  high: "bg-hazard-high/10 text-hazard-high ring-hazard-high/30",
  moderate: "bg-hazard-moderate/10 text-hazard-moderate ring-hazard-moderate/30",
  low: "bg-hazard-low/10 text-hazard-low ring-hazard-low/30",
  ok: "bg-hazard-low/10 text-hazard-low ring-hazard-low/30",
  neutral: "bg-white/5 text-slate-400 ring-white/10",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "accent",
  className,
}: {
  value: number;
  tone?: "accent" | "critical" | "high" | "moderate" | "low" | "ok";
  className?: string;
}) {
  const barColor: Record<string, string> = {
    accent: "bg-accent",
    critical: "bg-hazard-critical",
    high: "bg-hazard-high",
    moderate: "bg-hazard-moderate",
    low: "bg-hazard-low",
    ok: "bg-hazard-low",
  };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/5", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={cn("h-full rounded-full", barColor[tone])}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  icon,
  tone = "accent",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; positive?: boolean };
  icon?: ReactNode;
  tone?: "accent" | "critical" | "high" | "moderate" | "low" | "ok";
}) {
  const iconTone: Record<string, string> = {
    accent: "text-accent bg-accent/10 ring-accent/20",
    critical: "text-hazard-critical bg-hazard-critical/10 ring-hazard-critical/20",
    high: "text-hazard-high bg-hazard-high/10 ring-hazard-high/20",
    moderate: "text-hazard-moderate bg-hazard-moderate/10 ring-hazard-moderate/20",
    low: "text-hazard-low bg-hazard-low/10 ring-hazard-low/20",
    ok: "text-hazard-low bg-hazard-low/10 ring-hazard-low/20",
  };
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <span className="label-mono">{label}</span>
        {icon && (
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg ring-1", iconTone[tone])}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-slate-50">{value}</span>
        {unit && <span className="pb-0.5 text-xs text-slate-500">{unit}</span>}
      </div>
      {delta && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span className={cn(delta.positive ? "text-hazard-low" : "text-hazard-critical")}>
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
          <span className="text-slate-500">vs last scan</span>
        </div>
      )}
    </Card>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="label-mono mb-1.5 text-accent/70">{eyebrow}</div>}
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
