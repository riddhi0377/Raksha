import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldAlert,
  Route,
  Gauge,
  Truck,
  Building2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { SectionHeader, Card, CardHeader, Badge } from "../ui";
import {
  habitats,
  relocationSites,
  habitatAnalyses,
  siteSuitability,
  capacityAnalysis,
  DEMO_LABEL,
} from "../../lib/data";
import { formatNumber, severityHex, riskSeverity } from "../../lib/utils";

function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function AnimatedNumber({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{Math.round(display).toLocaleString("en-IN")}</>;
}

function colorBySeverity(v: number) {
  return severityHex[riskSeverity(v)];
}

interface SimResult {
  before: {
    populationExposed: number;
    hazardScore: number;
    evacuationDifficulty: number;
    infrastructureRisk: number;
  };
  after: {
    residualHazard: number;
    availableCapacity: number;
    distanceKm: number;
    accessibility: number;
    relocated: number;
  };
  reductionPct: number;
  remainingAfter: number;
  accChange: number;
  recommended: boolean;
}

export function Simulation() {
  const recommendedSiteId =
    Object.values(siteSuitability).find((s) => s.recommended)?.siteId ?? relocationSites[0].id;
  const topHabId = [...habitats].sort(
    (a, b) => habitatAnalyses[b.id].overall - habitatAnalyses[a.id].overall
  )[0].id;

  const [habId, setHabId] = useState(topHabId);
  const [siteId, setSiteId] = useState(recommendedSiteId);
  const [simulated, setSimulated] = useState(false);
  const [runId, setRunId] = useState(0);

  const hab = habitats.find((h) => h.id === habId)!;
  const site = relocationSites.find((s) => s.id === siteId)!;

  const result: SimResult = useMemo(() => {
    const hA = habitatAnalyses[hab.id];
    const sS = siteSuitability[site.id];
    const cA = capacityAnalysis[site.id];

    const hazardScore = hA.components.find((c) => c.key === "hazardSeverity")!.value;
    const before = {
      populationExposed: hab.population,
      hazardScore,
      evacuationDifficulty: hab.factors.accessibility,
      infrastructureRisk: hab.factors.infrastructure,
    };

    const distanceKm = Math.round(haversine(hab.lat, hab.lng, site.lat, site.lng));
    const relocated = Math.max(0, Math.min(hab.population, cA.remaining));
    const after = {
      residualHazard: sS.hazardExposure,
      availableCapacity: cA.safeCapacity,
      distanceKm,
      accessibility: sS.roadAccess,
      relocated,
    };

    const reductionPct =
      before.hazardScore > 0
        ? Math.max(0, Math.min(100, ((before.hazardScore - after.residualHazard) / before.hazardScore) * 100))
        : 0;
    const remainingAfter = cA.safeCapacity - (cA.currentPopulation + relocated);
    const accChange = after.accessibility - before.evacuationDifficulty;
    const recommended =
      relocated >= hab.population &&
      after.residualHazard <= before.hazardScore * 0.6 &&
      after.residualHazard < 60;

    return { before, after, reductionPct, remainingAfter, accChange, recommended };
  }, [hab, site]);

  const selectHab = (id: string) => {
    setHabId(id);
    setSimulated(false);
  };
  const selectSite = (id: string) => {
    setSiteId(id);
    setSimulated(false);
  };
  const run = () => {
    setSimulated(true);
    setRunId((r) => r + 1);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Simulation"
        title="Relocation Simulation"
        description="Model the outcome of moving a vulnerable habitation to a proposed relocation site."
        action={<Badge tone="accent">{DEMO_LABEL}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="flex flex-col p-3">
          <CardHeader title="1 - Vulnerable Habitation" subtitle="Choose the source at risk" />
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {[...habitats]
              .sort((a, b) => habitatAnalyses[b.id].overall - habitatAnalyses[a.id].overall)
              .map((h) => {
                const sev = riskSeverity(habitatAnalyses[h.id].overall);
                const hex = severityHex[sev];
                const sel = h.id === habId;
                return (
                  <button
                    key={h.id}
                    onClick={() => selectHab(h.id)}
                    className={`focus-ring flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                      sel ? "border-accent/40 bg-accent/[0.08]" : "border-white/[0.06] hover:bg-white/[0.03]"
                    }`}
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
          </div>
        </Card>

        <Card className="flex flex-col p-3">
          <CardHeader title="2 - Proposed Relocation Site" subtitle="Choose the destination" />
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {[...relocationSites]
              .map((s) => ({ s, m: siteSuitability[s.id] }))
              .sort((a, b) => b.m.score - a.m.score)
              .map(({ s, m }) => {
                const sel = s.id === siteId;
                const sc = m.score >= 75 ? "#34d399" : m.score >= 60 ? "#22d3ee" : m.score >= 45 ? "#facc15" : "#fb923c";
                return (
                  <button
                    key={s.id}
                    onClick={() => selectSite(s.id)}
                    className={`focus-ring flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                      sel ? "border-accent/40 bg-accent/[0.08]" : "border-white/[0.06] hover:bg-white/[0.03]"
                    }`}
                  >
                    <Building2 className="h-4 w-4 shrink-0 text-slate-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{s.name}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {s.district}, {s.state}
                      </p>
                    </div>
                    {m.recommended && <Badge tone="accent">Recommended</Badge>}
                    <span className="text-sm font-semibold" style={{ color: sc }}>
                      {m.score}
                    </span>
                  </button>
                );
              })}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_44px_1fr]">
          <div className="border-b border-white/[0.06] p-5 md:border-b-0 md:border-r">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-hazard-critical/10 text-hazard-critical ring-1 ring-hazard-critical/20">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-hazard-critical">Before</div>
                <div className="text-[11px] text-slate-500">At origin - {hab.name}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3.5">
              <Metric label="Population Exposed" value={result.before.populationExposed} color={colorBySeverity(result.before.hazardScore)} bar={result.before.hazardScore} />
              <Metric label="Hazard Score" value={result.before.hazardScore} suffix=" /100" color={colorBySeverity(result.before.hazardScore)} bar={result.before.hazardScore} />
              <Metric label="Evacuation Difficulty" value={result.before.evacuationDifficulty} suffix=" /100" color={colorBySeverity(result.before.evacuationDifficulty)} bar={result.before.evacuationDifficulty} />
              <Metric label="Infrastructure Risk" value={result.before.infrastructureRisk} suffix=" /100" color={colorBySeverity(result.before.infrastructureRisk)} bar={result.before.infrastructureRisk} />
            </div>
          </div>

          <div className="relative flex items-center justify-center bg-white/[0.015]">
            <AnimatePresence>
              {simulated && (
                <motion.div
                  key={runId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-1 text-accent"
                >
                  <motion.div
                    animate={{ x: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                  <span className="label-mono text-[8px]">relocate</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-accent">After</div>
                <div className="text-[11px] text-slate-500">At site - {site.name}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3.5">
              {!simulated ? (
                <div className="flex h-[176px] flex-col items-center justify-center text-center text-slate-600">
                  <Truck className="mb-2 h-6 w-6 opacity-50" />
                  <p className="text-xs">
                    Run the simulation to project
                    <br />
                    post-relocation metrics.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={runId}
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                    className="space-y-3.5"
                  >
                    <MetricMotion label="Residual Hazard Exposure" value={result.after.residualHazard} suffix=" /100" color={colorBySeverity(result.after.residualHazard)} bar={result.after.residualHazard} />
                    <MetricMotion label="Available Capacity" value={result.after.availableCapacity} color="#22d3ee" bar={Math.min(100, (result.after.availableCapacity / 20000) * 100)} />
                    <MetricMotion label="Distance" value={result.after.distanceKm} suffix=" km" color="#94a3b8" bar={Math.min(100, result.after.distanceKm / 3)} />
                    <MetricMotion label="Accessibility" value={result.after.accessibility} suffix=" /100" color={colorBySeverity(100 - result.after.accessibility)} bar={result.after.accessibility} />
                    <MetricMotion label="Est. Population Safely Relocated" value={result.after.relocated} color="#34d399" bar={Math.min(100, (result.after.relocated / hab.population) * 100)} highlight />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={run}
          className="focus-ring group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-accent-deep to-accent px-7 py-3.5 text-sm font-semibold text-navy-950 shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.99]"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
          {simulated ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {simulated ? "Re-run Simulation" : "Simulate Relocation"}
        </button>
        <p className="text-[10px] text-slate-600">Model estimates based on the {DEMO_LABEL}.</p>
      </div>

      <AnimatePresence>
        {simulated && (
          <motion.div
            key={runId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ResultTile icon={<ShieldAlert className="h-4 w-4" />} label="Risk Exposure Reduction" value={`${Math.round(result.reductionPct)}`} suffix="%" color="#34d399" />
              <ResultTile icon={<Users className="h-4 w-4" />} label="Population Safely Relocated" value={result.after.relocated} color="#22d3ee" />
              <ResultTile icon={<Gauge className="h-4 w-4" />} label="Remaining Site Capacity" value={result.remainingAfter} color={result.remainingAfter < 0 ? "#f43f5e" : "#34d399"} />
              <ResultTile icon={<Route className="h-4 w-4" />} label="Accessibility Change" value={`${result.accChange >= 0 ? "+" : ""}${Math.round(result.accChange)}`} suffix=" pts" color={result.accChange >= 0 ? "#34d399" : "#facc15"} />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className={`relative overflow-hidden rounded-2xl border p-6 ${
                result.recommended ? "border-hazard-low/30 bg-hazard-low/[0.06]" : "border-hazard-high/30 bg-hazard-high/[0.06]"
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${
                  result.recommended ? "bg-hazard-low/20" : "bg-hazard-high/20"
                }`}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    result.recommended ? "bg-hazard-low/15 text-hazard-low" : "bg-hazard-high/15 text-hazard-high"
                  }`}
                >
                  {result.recommended ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="label-mono text-accent/70">Model Recommendation</span>
                  </div>
                  <h3
                    className={`mt-1 text-xl font-bold tracking-tight ${
                      result.recommended ? "text-hazard-low" : "text-hazard-high"
                    }`}
                  >
                    {result.recommended ? "RELOCATION RECOMMENDED" : "ALTERNATIVE SITE REQUIRED"}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-slate-300">
                    {result.recommended
                      ? `${formatNumber(result.after.relocated)} people can be safely relocated to ${site.name} with ${formatNumber(
                          result.remainingAfter
                        )} capacity remaining and a ${Math.round(result.reductionPct)}% reduction in hazard exposure.`
                      : `Selected site cannot safely absorb the population (${formatNumber(
                          result.after.relocated
                        )} of ${formatNumber(hab.population)} placeable, ${formatNumber(
                          result.remainingAfter
                        )} capacity remaining) or residual hazard remains high. Evaluate an alternative site.`}
                  </p>
                </div>
              </div>
            </motion.div>

            <p className="text-center text-[10px] text-slate-600">
              {DEMO_LABEL} - Outputs are synthetic model estimates, not operational forecasts.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({
  label,
  value,
  suffix = "",
  color,
  bar,
}: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bar: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold" style={{ color }}>
          {formatNumber(value)}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, bar))}%`, background: color }} />
      </div>
    </div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function MetricMotion({
  label,
  value,
  suffix = "",
  color,
  bar,
  highlight,
}: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bar: number;
  highlight?: boolean;
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold" style={{ color }}>
          <AnimatedNumber value={value} />
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, Math.min(100, bar))}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: highlight ? `0 0 12px ${color}` : undefined }}
        />
      </div>
    </motion.div>
  );
}

function ResultTile({
  icon,
  label,
  value,
  suffix = "",
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  color: string;
}) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center gap-2 text-slate-400">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset"
          style={{ color, background: `${color}1a`, borderColor: `${color}33` }}
        >
          {icon}
        </span>
        <span className="label-mono text-[9px]">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight" style={{ color }}>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        <span className="text-base">{suffix}</span>
      </div>
    </Card>
  );
}
