import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Droplets,
  Route,
  HeartPulse,
  GraduationCap,
  MapPin,
  X,
  Info,
  Award,
  ListOrdered,
  Gauge,
  Layers,
} from "lucide-react";
import { SectionHeader, Card, Badge, StatCard } from "../ui";
import {
  relocationSites,
  siteSuitability,
  DEMO_LABEL,
  type RelocationSite,
} from "../../lib/data";
import { formatNumber } from "../../lib/utils";

function suitColor(score: number): string {
  if (score >= 75) return "#34d399";
  if (score >= 60) return "#22d3ee";
  if (score >= 45) return "#facc15";
  return "#fb923c";
}

function exposureColor(exp: number): string {
  if (exp <= 30) return "#34d399";
  if (exp <= 55) return "#facc15";
  return "#f43f5e";
}

const metricColor = (v: number) =>
  v >= 70 ? "#34d399" : v >= 45 ? "#facc15" : "#fb923c";

export function SafeSites() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = [...relocationSites]
    .map((s) => ({ s, m: siteSuitability[s.id] }))
    .sort((a, b) => b.m.score - a.m.score);

  const recommended = rows.filter((r) => r.m.recommended);
  const totalRemaining = rows.reduce((acc, r) => acc + r.m.remaining, 0);
  const avgSuit = rows.length
    ? Math.round(rows.reduce((acc, r) => acc + r.m.score, 0) / rows.length)
    : 0;

  const selectedSite = selectedId ? relocationSites.find((s) => s.id === selectedId) ?? null : null;
  const selectedSuit = selectedId ? siteSuitability[selectedId] : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Safe Sites"
        title="Safe Site Suitability Engine"
        description="Ranks candidate relocation sites by composite suitability for absorbing displaced populations."
        action={<Badge tone="accent">{DEMO_LABEL}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sites Evaluated"
          value={rows.length}
          icon={<Layers className="h-4 w-4" />}
          tone="accent"
        />
        <StatCard
          label="Avg Suitability"
          value={avgSuit}
          icon={<Gauge className="h-4 w-4" />}
          tone="low"
        />
        <StatCard
          label="Total Remaining Capacity"
          value={formatNumber(totalRemaining)}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="accent"
        />
        <StatCard
          label="Recommended Sites"
          value={recommended.length}
          icon={<Award className="h-4 w-4" />}
          tone="ok"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
          <ListOrdered className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-slate-100">Ranked Candidate Sites</h3>
          <span className="ml-auto label-mono text-[9px]">{DEMO_LABEL}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-2.5 font-medium">#</th>
                <th className="px-5 py-2.5 font-medium">Site</th>
                <th className="px-5 py-2.5 font-medium">Suitability</th>
                <th className="px-5 py-2.5 font-medium">Hazard Exp</th>
                <th className="px-5 py-2.5 font-medium">Capacity</th>
                <th className="px-5 py-2.5 font-medium">Occupancy</th>
                <th className="px-5 py-2.5 font-medium">Remaining</th>
                <th className="px-5 py-2.5 font-medium">Water</th>
                <th className="px-5 py-2.5 font-medium">Road</th>
                <th className="px-5 py-2.5 font-medium">Health</th>
                <th className="px-5 py-2.5 font-medium">Dist (km)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ s, m }, i) => {
                const sc = suitColor(m.score);
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedId(s.id)}
                    className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-100">{s.name}</span>
                        {m.recommended && (
                          <Badge tone="accent">
                            <Award className="h-3 w-3" /> Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3" /> {s.district}, {s.state}
                        {s.proposed && <span className="ml-1 text-accent/70">· proposed</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${m.score}%`, background: sc }} />
                        </div>
                        <span className="font-semibold" style={{ color: sc }}>
                          {m.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium" style={{ color: exposureColor(m.hazardExposure) }}>
                        {m.hazardExposure}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{formatNumber(s.capacity)}</td>
                    <td className="px-5 py-3 text-slate-300">{formatNumber(s.occupied)}</td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-100">{formatNumber(m.remaining)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Metric value={m.waterAccess} color={metricColor(m.waterAccess)} icon={<Droplets className="h-3 w-3" />} />
                    </td>
                    <td className="px-5 py-3">
                      <Metric value={m.roadAccess} color={metricColor(m.roadAccess)} icon={<Route className="h-3 w-3" />} />
                    </td>
                    <td className="px-5 py-3">
                      <Metric value={m.healthcareAccess} color={metricColor(m.healthcareAccess)} icon={<HeartPulse className="h-3 w-3" />} />
                    </td>
                    <td className="px-5 py-3 text-slate-300">{m.distanceKm}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-center text-[10px] text-slate-600">
        {DEMO_LABEL} · Suitability scores are computed from the synthetic dataset for prototype demonstration only.
      </p>

      <AnimatePresence>
        {selectedSite && selectedSuit && (
          <SiteDetail site={selectedSite} suit={selectedSuit} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ value, color, icon }: { value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color }}>{icon}</span>
      <span className="font-medium" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function SiteDetail({
  site,
  suit,
  onClose,
}: {
  site: RelocationSite;
  suit: (typeof siteSuitability)[string];
  onClose: () => void;
}) {
  const sc = suitColor(suit.score);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Safe site suitability breakdown"
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-navy-850/95 p-5 shadow-panel backdrop-blur-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-mono text-accent/70">Safe Site Suitability</div>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-50">
              {site.name}
              {suit.recommended && (
                <Badge tone="accent">
                  <Award className="h-3 w-3" /> Recommended
                </Badge>
              )}
            </h2>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" /> {site.district}, {site.state} · {site.type}
              {site.proposed ? " · proposed" : ""}
            </p>
          </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="focus-ring -mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl font-bold" style={{ color: sc, background: `${sc}1a` }}>
            {suit.score}
          </div>
          <div>
            <div className="text-xs text-slate-500">Suitability Score · Rank #{suit.rank}</div>
            <p className="mt-1 text-[11px] text-slate-400">
              Score = Σ (weight × value), 0–100 · higher is better
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cell label="Capacity" value={formatNumber(site.capacity)} />
          <Cell label="Occupancy" value={formatNumber(site.occupied)} />
          <Cell label="Remaining" value={formatNumber(suit.remaining)} />
          <Cell label="Distance" value={`${suit.distanceKm} km`} />
        </div>

        <div className="mt-4 space-y-3">
          {suit.factors.map((f) => {
            const contribution = Math.round(f.value * f.weight);
            return (
              <div key={f.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    {f.key === "waterAvailability" && <Droplets className="h-3.5 w-3.5 text-slate-500" />}
                    {f.key === "roadAccessibility" && <Route className="h-3.5 w-3.5 text-slate-500" />}
                    {f.key === "healthcareAccess" && <HeartPulse className="h-3.5 w-3.5 text-slate-500" />}
                    {f.key === "educationAccess" && <GraduationCap className="h-3.5 w-3.5 text-slate-500" />}
                    {f.key === "hazardExposure" && <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />}
                    {f.label}
                  </span>
                  <span className="text-slate-400">
                    <span className="font-semibold text-slate-100">{Math.round(f.value)}</span>
                    <span className="mx-1 text-slate-600">×</span>
                    <span className="font-mono text-[11px] text-slate-500">{(f.weight * 100).toFixed(0)}%</span>
                    <span className="mx-1 text-slate-600">=</span>
                    <span className="font-semibold" style={{ color: sc }}>
                      {contribution}
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(contribution / suit.score) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: sc }}
                  />
                </div>
                <p className="mt-1 text-[10px] leading-snug text-slate-600">{f.note}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-slate-400">Composite Suitability</span>
          <span className="text-lg font-semibold text-slate-50">
            {suit.score}
            <span className="text-sm text-slate-500"> / 100</span>
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/15 bg-accent/[0.04] px-3 py-2.5 text-[11px] text-slate-300">
          <Info className="h-3.5 w-3.5 shrink-0 text-accent" />
          {suit.recommended
            ? "This is the highest-scoring site with available capacity — flagged as the recommended relocation site."
            : "A site with higher suitability and available capacity is recommended as primary."}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="label-mono text-[8px]">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-100">{value}</div>
    </div>
  );
}
