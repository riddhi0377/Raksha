import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Waves,
  Mountain,
  Zap,
  CloudRain,
  Wind,
  History,
  Users,
  Route,
  Radar,
  Building2,
  MapPin,
  Gauge as GaugeIcon,
  Info,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { SectionHeader, Card, CardHeader, Badge } from "../ui";
import { Gauge } from "../charts";
import {
  habitats,
  habitatAnalyses,
  DEMO_LABEL,
  type Habitat,
  type HazardScores,
  type RiskDrivers,
} from "../../lib/data";
import { cn, severityHex, riskSeverity, classifyRisk, formatNumber } from "../../lib/utils";

const hazardMeta: { key: keyof HazardScores; label: string; icon: typeof Waves }[] = [
  { key: "flood", label: "Flood", icon: Waves },
  { key: "landslide", label: "Landslide", icon: Mountain },
  { key: "earthquake", label: "Earthquake", icon: Zap },
  { key: "cloudburst", label: "Cloudburst", icon: CloudRain },
  { key: "erosion", label: "Erosion", icon: Wind },
];

const driverMeta: { key: keyof RiskDrivers; label: string; icon: typeof Waves }[] = [
  { key: "historicalFrequency", label: "Historical Disaster Frequency", icon: History },
  { key: "rainfallIntensity", label: "Rainfall Intensity", icon: CloudRain },
  { key: "slopeInstability", label: "Slope Instability", icon: Mountain },
  { key: "populationDensity", label: "Population Density", icon: Users },
  { key: "roadAccessibility", label: "Road Accessibility", icon: Route },
  { key: "proximityToHazard", label: "Proximity to Hazard Zones", icon: Radar },
  { key: "infrastructureExposure", label: "Critical Infrastructure Exposure", icon: Building2 },
];

const filters = ["all", "critical", "high", "moderate", "low"] as const;

export function HazardIntelligence() {
  const ranked = [...habitats].sort(
    (a, b) => habitatAnalyses[b.id].overall - habitatAnalyses[a.id].overall
  );
  const [selectedId, setSelectedId] = useState(ranked[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const selected: Habitat = habitats.find((h) => h.id === selectedId) ?? ranked[0];
  const analysis = habitatAnalyses[selected.id];
  const cls = classifyRisk(analysis.overall);

  const list = ranked.filter((h) => {
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.district.toLowerCase().includes(q) ||
      h.state.toLowerCase().includes(q);
    const sev = riskSeverity(habitatAnalyses[h.id].overall);
    const matchF = filter === "all" || sev === filter;
    return matchQ && matchF;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Hazard Intelligence"
        title="Habitation Risk Analysis"
        description="Per-habitation hazard scoring, risk drivers and an explainable composite-risk model."
        action={<Badge tone="accent">{DEMO_LABEL}</Badge>}
      />

      <div className="flex items-start gap-2 rounded-lg border border-accent/15 bg-accent/[0.04] px-3.5 py-2.5 text-xs text-slate-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>
          {DEMO_LABEL} — all scores, drivers and weights are synthetic and illustrative. Figures are
          <strong className="text-slate-100"> not real-time and not sourced from government records.</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr]">
        {/* Habitat selector */}
        <Card className="flex flex-col p-3">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search habitations…"
              className="focus-ring h-9 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600"
            />
          </div>
          <div className="mb-3 flex flex-wrap gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "focus-ring rounded-md px-2 py-1 text-[11px] capitalize transition-colors",
                  filter === f
                    ? "bg-accent/15 text-accent"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="max-h-[560px] space-y-1.5 overflow-y-auto pr-1">
            {list.map((h) => {
              const sev = riskSeverity(habitatAnalyses[h.id].overall);
              const hex = severityHex[sev];
              const isSel = h.id === selectedId;
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  className={cn(
                    "focus-ring flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
                    isSel ? "border-accent/40 bg-accent/[0.06]" : "border-white/[0.06] hover:bg-white/[0.03]"
                  )}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: hex }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{h.name}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {h.district}, {h.state}
                    </p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: hex }}>
                    {habitatAnalyses[h.id].overall}
                  </span>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-slate-500">No habitations match.</p>
            )}
          </div>
        </Card>

        {/* Detail */}
        <div className="min-w-0 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Identity + score */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="label-mono text-accent/70">{selected.id}</div>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
                        {selected.name}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {selected.district}, {selected.state}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone={cls.severity as never}>{cls.label}</Badge>
                        <Badge tone="neutral">Priority {selected.priority}</Badge>
                        <Badge tone="accent">{selected.primaryHazard}</Badge>
                        <Badge tone="neutral">{formatNumber(selected.population)} ppl</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Gauge value={analysis.overall} size={150} label="RISK /100" tone={cls.severity} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
                    <Mini label="Population" value={formatNumber(selected.population)} />
                    <Mini label="Vulnerable" value={formatNumber(selected.vulnerable)} />
                    <Mini label="Primary Hazard" value={selected.primaryHazard} />
                  </div>
                </Card>
              </div>

              {/* Hazard scores + drivers */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader
                    title="Per-Hazard Scores"
                    subtitle="Severity by hazard type (0–100)"
                    icon={<ShieldAlert className="h-4 w-4" />}
                  />
                  <div className="space-y-3.5">
                    {hazardMeta.map((m) => {
                      const v = analysis.hazardScores[m.key];
                      const hex = severityHex[riskSeverity(v)];
                      const Icon = m.icon;
                      return (
                        <div key={m.key}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-300">
                              <Icon className="h-3.5 w-3.5 text-slate-500" /> {m.label}
                            </span>
                            <span className="font-semibold" style={{ color: hex }}>
                              {v}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${v}%` }}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full"
                              style={{ background: hex }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title="Risk Drivers"
                    subtitle="Contributing exposure factors"
                    icon={<SlidersHorizontal className="h-4 w-4" />}
                  />
                  <div className="space-y-3">
                    {driverMeta.map((m) => {
                      const v = analysis.riskDrivers[m.key];
                      const hex = severityHex[riskSeverity(v)];
                      const Icon = m.icon;
                      return (
                        <div key={m.key}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-300">
                              <Icon className="h-3.5 w-3.5 text-slate-500" /> {m.label}
                            </span>
                            <span className="font-semibold" style={{ color: hex }}>
                              {v}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${v}%` }}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full"
                              style={{ background: hex }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Explainable calculation */}
              <Card>
                <CardHeader
                  title="Explainable Risk Calculation"
                  subtitle="Composite score = Σ (weight × value)"
                  icon={<GaugeIcon className="h-4 w-4" />}
                  action={<Badge tone="neutral">Weights are demonstration defaults</Badge>}
                />
                <div className="mb-5">
                  <div className="flex h-3 w-full overflow-hidden rounded-full border border-white/[0.06]">
                    {analysis.components.map((c) => (
                      <motion.div
                        key={c.key}
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.contribution / analysis.overall) * 100}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        style={{ background: severityHex[riskSeverity(c.value)] }}
                        title={`${c.label}: ${c.contribution}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2.5">
                  {analysis.components.map((c) => {
                    const hex = severityHex[riskSeverity(c.value)];
                    return (
                      <div key={c.key} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-200">
                            <span>{c.label}</span>
                            <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                              w={(c.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(c.contribution / analysis.overall) * 100}%` }}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full"
                              style={{ background: hex }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-100">
                            {c.value}
                            <span className="text-slate-600"> ×{(c.weight * 100).toFixed(0)}%</span>
                          </div>
                          <div className="label-mono text-[8px]">= {c.contribution} pts</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <span className="text-sm text-slate-400">Composite Risk Score</span>
                  <span className="text-lg font-semibold text-slate-50">
                    {analysis.overall}
                    <span className="text-sm text-slate-500"> / 100</span>
                  </span>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-600">
        {DEMO_LABEL} · Synthetic model for prototype demonstration only.
      </p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-mono text-[9px]">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}
