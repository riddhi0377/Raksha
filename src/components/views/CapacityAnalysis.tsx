import { useState } from "react";
import { motion } from "framer-motion";
import {
  Gauge as GaugeIcon,
  Users,
  ShieldCheck,
  Droplets,
  HeartPulse,
  GraduationCap,
  Route,
  Mountain,
  Home,
  Activity,
  Filter,
} from "lucide-react";
import { SectionHeader, Card, CardHeader, Badge, StatCard } from "../ui";
import { Gauge } from "../charts";
import {
  relocationSites,
  capacityAnalysis,
  CAPACITY_RESOURCE_LABELS,
  DEMO_LABEL,
  type CapacityBreakdown,
  type CapacityStatus,
} from "../../lib/data";
import { formatNumber, cn } from "../../lib/utils";

type BadgeTone = "accent" | "critical" | "high" | "moderate" | "low" | "neutral" | "ok";

const statusMeta: Record<CapacityStatus, { color: string; tone: BadgeTone }> = {
  SAFE: { color: "#34d399", tone: "ok" },
  "NEAR CAPACITY": { color: "#facc15", tone: "moderate" },
  "OVER CAPACITY": { color: "#f43f5e", tone: "critical" },
};

const resourceMeta: Record<keyof CapacityBreakdown, { label: string; icon: typeof Droplets }> = {
  land: { label: CAPACITY_RESOURCE_LABELS.land, icon: Mountain },
  housing: { label: CAPACITY_RESOURCE_LABELS.housing, icon: Home },
  water: { label: CAPACITY_RESOURCE_LABELS.water, icon: Droplets },
  healthcare: { label: CAPACITY_RESOURCE_LABELS.healthcare, icon: HeartPulse },
  education: { label: CAPACITY_RESOURCE_LABELS.education, icon: GraduationCap },
  road: { label: CAPACITY_RESOURCE_LABELS.road, icon: Route },
  environmental: { label: CAPACITY_RESOURCE_LABELS.environmental, icon: Activity },
};

const statusFilters: ("all" | CapacityStatus)[] = ["all", "SAFE", "NEAR CAPACITY", "OVER CAPACITY"];

export function CapacityAnalysis() {
  const [status, setStatus] = useState<"all" | CapacityStatus>("all");

  const sites = relocationSites.map((s) => ({ s, c: capacityAnalysis[s.id] }));

  const totalSafe = sites.reduce((a, x) => a + x.c.safeCapacity, 0);
  const totalCurrent = sites.reduce((a, x) => a + x.c.currentPopulation, 0);
  const totalRemaining = sites.reduce((a, x) => a + x.c.remaining, 0);
  const networkUtil = totalSafe > 0 ? (totalCurrent / totalSafe) * 100 : 0;
  const networkStatus: CapacityStatus =
    networkUtil >= 100 ? "OVER CAPACITY" : networkUtil >= 85 ? "NEAR CAPACITY" : "SAFE";

  const limitingCounts = sites.reduce<Record<string, number>>((acc, x) => {
    acc[x.c.limitingKey] = (acc[x.c.limitingKey] ?? 0) + 1;
    return acc;
  }, {});
  const maxLimit = Math.max(1, ...Object.values(limitingCounts));

  const filtered = sites.filter((x) => status === "all" || x.c.status === status);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Capacity Analysis"
        title="Safe Carrying Capacity"
        description="Per-site safe capacity derived from land, housing, water, healthcare, education, accessibility and environmental constraints."
        action={<Badge tone="accent">{DEMO_LABEL}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Safe Capacity" value={formatNumber(totalSafe)} icon={<ShieldCheck className="h-4 w-4" />} tone="accent" />
        <StatCard label="Current Population" value={formatNumber(totalCurrent)} icon={<Users className="h-4 w-4" />} tone="high" />
        <StatCard label="Remaining Capacity" value={formatNumber(totalRemaining)} icon={<GaugeIcon className="h-4 w-4" />} tone="low" />
        <StatCard
          label="Network Utilization"
          value={`${Math.round(networkUtil)}%`}
          icon={<Activity className="h-4 w-4" />}
          tone={networkStatus === "OVER CAPACITY" ? "critical" : networkStatus === "NEAR CAPACITY" ? "high" : "ok"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center lg:col-span-1">
          <CardHeader title="Network Carrying Capacity" subtitle="Aggregate utilisation" />
          <Gauge
            value={Math.min(100, Math.round(networkUtil))}
            size={170}
            label="UTIL %"
            tone={networkStatus === "OVER CAPACITY" ? "critical" : networkStatus === "NEAR CAPACITY" ? "high" : "ok"}
          />
          <div className="mt-3 flex items-center gap-2">
            <Badge tone={statusMeta[networkStatus].tone}>{networkStatus}</Badge>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">
            {formatNumber(totalCurrent)} of {formatNumber(totalSafe)} safe capacity engaged
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Network Limiting Factors"
            subtitle="Which constraint binds safe capacity per site"
            icon={<Filter className="h-4 w-4" />}
          />
          <div className="space-y-3">
            {(Object.keys(resourceMeta) as (keyof CapacityBreakdown)[]).map((k) => {
              const count = limitingCounts[k] ?? 0;
              const Icon = resourceMeta[k].icon;
              return (
                <div key={k}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Icon className="h-3.5 w-3.5 text-slate-500" /> {resourceMeta[k].label}
                    </span>
                    <span className="text-slate-400">{count} sites</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxLimit) * 100}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Filter:</span>
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={cn(
              "focus-ring rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              status === f
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-slate-200"
            )}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Filter className="h-6 w-6 text-slate-600" />
              <p className="text-sm text-slate-400">No sites match the selected status.</p>
              <button
                onClick={() => setStatus("all")}
                className="focus-ring mt-1 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-slate-100"
              >
                Clear filter
              </button>
            </div>
          </Card>
        ) : (
          filtered.map(({ s, c }, i) => {
          const sm = statusMeta[c.status];
          const Icon = resourceMeta[c.limitingKey].icon;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{s.name}</h3>
                    <p className="text-[11px] text-slate-500">{s.district}, {s.state}</p>
                  </div>
                  <Badge tone={sm.tone}>{c.status}</Badge>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <Gauge value={Math.min(100, c.utilization)} size={84} label="UTIL" tone={c.status === "OVER CAPACITY" ? "critical" : c.status === "NEAR CAPACITY" ? "high" : "ok"} />
                  <div className="flex-1 space-y-2 text-sm">
                    <Row label="Safe Capacity" value={formatNumber(c.safeCapacity)} strong />
                    <Row label="Current Pop." value={formatNumber(c.currentPopulation)} />
                    <Row
                      label="Remaining"
                      value={formatNumber(c.remaining)}
                      tone={c.remaining < 0 ? "#f43f5e" : "#34d399"}
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-medium text-slate-300">{resourceMeta[c.limitingKey].label}</span>
                    <span className="text-slate-500">limits safe capacity to</span>
                    <span className="font-semibold text-slate-100">{formatNumber(c.safeCapacity)}</span>
                    <span className="text-slate-500">people.</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })
        )}
      </div>

      <p className="text-center text-[10px] text-slate-600">
        {DEMO_LABEL} · Safe capacities are computed from the synthetic dataset for prototype demonstration only.
      </p>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={cn("font-medium", strong && "text-slate-50")} style={tone ? { color: tone } : undefined}>
        {value}
      </span>
    </div>
  );
}
