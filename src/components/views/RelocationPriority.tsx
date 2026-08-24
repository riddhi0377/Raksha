import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  Users,
  Gauge,
  MapPin,
  X,
  Info,
  ListOrdered,
  SlidersHorizontal,
} from "lucide-react";
import { SectionHeader, Card, Badge, StatCard } from "../ui";
import {
  habitats,
  relocationScores,
  DEMO_LABEL,
  type PriorityLevel,
  type Habitat,
} from "../../lib/data";
import { formatNumber } from "../../lib/utils";

type BadgeTone = "accent" | "critical" | "high" | "moderate" | "low" | "neutral" | "ok";

const levelMeta: Record<PriorityLevel, { hex: string; tone: BadgeTone; label: string }> = {
  IMMEDIATE: { hex: "#f43f5e", tone: "critical", label: "IMMEDIATE" },
  HIGH: { hex: "#fb923c", tone: "high", label: "HIGH" },
  MEDIUM: { hex: "#facc15", tone: "moderate", label: "MEDIUM" },
  LOW: { hex: "#34d399", tone: "low", label: "LOW" },
};

const ACTION: Record<PriorityLevel, string> = {
  IMMEDIATE: "Evacuate now · P0",
  HIGH: "Pre-stage · P1",
  MEDIUM: "Monitor · P2",
  LOW: "Standby",
};

const priorityOptions: ("all" | PriorityLevel)[] = ["all", "IMMEDIATE", "HIGH", "MEDIUM", "LOW"];
const districts = ["all", ...Array.from(new Set(habitats.map((h) => h.district))).sort()];
const hazards = ["all", ...Array.from(new Set(habitats.map((h) => h.primaryHazard))).sort()];
const popBuckets = [
  { value: "all", label: "Any" },
  { value: "10000", label: "> 10k" },
  { value: "20000", label: "> 20k" },
  { value: "35000", label: "> 35k" },
];

export function RelocationPriority() {
  const [priority, setPriority] = useState<"all" | PriorityLevel>("all");
  const [district, setDistrict] = useState("all");
  const [hazard, setHazard] = useState("all");
  const [population, setPopulation] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = habitats
    .map((h) => ({ h, r: relocationScores[h.id] }))
    .filter(({ h, r }) => {
      if (priority !== "all" && r.level !== priority) return false;
      if (district !== "all" && h.district !== district) return false;
      if (hazard !== "all" && h.primaryHazard !== hazard) return false;
      if (population !== "all" && h.population < Number(population)) return false;
      return true;
    })
    .sort((a, b) => b.r.score - a.r.score);

  const immediate = rows.filter((r) => r.r.level === "IMMEDIATE").length;
  const high = rows.filter((r) => r.r.level === "HIGH").length;
  const popInScope = rows.reduce((s, r) => s + r.h.population, 0);
  const avgScore = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.r.score, 0) / rows.length)
    : 0;

  const selectedHab = selectedId ? habitats.find((h) => h.id === selectedId) ?? null : null;
  const selectedScore = selectedId ? relocationScores[selectedId] : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Relocation Priority"
        title="Relocation Priority Engine"
        description="Composite scoring of vulnerable habitations to sequence evacuation operations."
        action={<Badge tone="accent">{DEMO_LABEL}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Immediate Actions" value={immediate} icon={<AlertTriangle className="h-4 w-4" />} tone="critical" />
        <StatCard label="High Priority" value={high} icon={<Flame className="h-4 w-4" />} tone="high" />
        <StatCard label="Population in Scope" value={formatNumber(popInScope)} icon={<Users className="h-4 w-4" />} tone="accent" />
        <StatCard label="Avg Priority Score" value={avgScore} icon={<Gauge className="h-4 w-4" />} tone="low" />
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-xs font-medium">Filters</span>
          </div>
          <FilterSelect label="Priority" value={priority} options={priorityOptions} onChange={(v) => setPriority(v as "all" | PriorityLevel)} />
          <FilterSelect label="District" value={district} options={districts} onChange={setDistrict} />
          <FilterSelect label="Hazard" value={hazard} options={hazards} onChange={setHazard} />
          <FilterSelect
            label="Population"
            value={population}
            options={popBuckets.map((b) => b.value)}
            labels={Object.fromEntries(popBuckets.map((b) => [b.value, b.label]))}
            onChange={setPopulation}
          />
          <span className="ml-auto text-xs text-slate-500">
            {rows.length} habitations in view
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
          <ListOrdered className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-slate-100">Ranked Habitation Priority</h3>
          <span className="ml-auto label-mono text-[9px]">{DEMO_LABEL}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-2.5 font-medium">#</th>
                <th className="px-5 py-2.5 font-medium">Habitation</th>
                <th className="px-5 py-2.5 font-medium">Population</th>
                <th className="px-5 py-2.5 font-medium">Hazard</th>
                <th className="px-5 py-2.5 font-medium">Vulnerability</th>
                <th className="px-5 py-2.5 font-medium">Priority Score</th>
                <th className="px-5 py-2.5 font-medium">Level</th>
                <th className="px-5 py-2.5 font-medium">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ h, r }, i) => {
                const m = levelMeta[r.level];
                return (
                  <motion.tr
                    key={h.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedId(h.id)}
                    className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-100">{h.name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3" /> {h.district}, {h.state}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{formatNumber(h.population)}</td>
                    <td className="px-5 py-3">
                      <span className="font-medium" style={{ color: m.hex }}>
                        {r.hazardScore}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-200">{r.vulnerabilityScore}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: m.hex }} />
                        </div>
                        <span className="font-semibold" style={{ color: m.hex }}>
                          {r.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={m.tone}>{m.label}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-300">{ACTION[r.level]}</span>
                    </td>
                  </motion.tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                    No habitations match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-center text-[10px] text-slate-600">
        {DEMO_LABEL} · Scores are computed from the synthetic dataset for prototype demonstration only.
      </p>

      <AnimatePresence>
        {selectedHab && selectedScore && (
          <RelocationDetail
            habitation={selectedHab}
            score={selectedScore}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs">
      <span className="text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring rounded bg-transparent font-medium text-slate-100 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-navy-800 text-slate-100">
            {labels?.[o] ?? (o === "all" ? "All" : o)}
          </option>
        ))}
      </select>
    </label>
  );
}

function RelocationDetail({
  habitation,
  score,
  onClose,
}: {
  habitation: Habitat;
  score: (typeof relocationScores)[string];
  onClose: () => void;
}) {
  const m = levelMeta[score.level];
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
        aria-label="Relocation priority breakdown"
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-navy-850/95 p-5 shadow-panel backdrop-blur-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-mono text-accent/70">Relocation Priority Breakdown</div>
            <h2 className="mt-1 text-lg font-semibold text-slate-50">{habitation.name}</h2>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" /> {habitation.district}, {habitation.state}
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
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl font-bold" style={{ color: m.hex, background: `${m.hex}1a` }}>
            {score.score}
          </div>
          <div>
            <div className="text-xs text-slate-500">Relocation Priority Score</div>
            <Badge tone={m.tone} className="mt-1">
              {m.label}
            </Badge>
            <p className="mt-1.5 text-[11px] text-slate-500">Score = Σ (weight × value), 0–100</p>
          </div>
        </div>

        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full border border-white/[0.06]">
          {score.factors.map((f) => (
            <motion.div
              key={f.key}
              initial={{ width: 0 }}
              animate={{ width: `${(Math.round(f.value * f.weight) / score.score) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: levelMeta[score.level].hex }}
            />
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {score.factors.map((f) => {
            const contribution = Math.round(f.value * f.weight);
            return (
              <div key={f.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{f.label}</span>
                  <span className="text-slate-400">
                    <span className="font-semibold text-slate-100">{f.value}</span>
                    <span className="mx-1 text-slate-600">×</span>
                    <span className="font-mono text-[11px] text-slate-500">{(f.weight * 100).toFixed(0)}%</span>
                    <span className="mx-1 text-slate-600">=</span>
                    <span className="font-semibold" style={{ color: m.hex }}>
                      {contribution}
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(contribution / score.score) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: m.hex }}
                  />
                </div>
                <p className="mt-1 text-[10px] leading-snug text-slate-600">{f.source}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-slate-400">Composite Relocation Priority</span>
          <span className="text-lg font-semibold text-slate-50">
            {score.score}
            <span className="text-sm text-slate-500"> / 100</span>
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/15 bg-accent/[0.04] px-3 py-2.5 text-[11px] text-slate-300">
          <Info className="h-3.5 w-3.5 shrink-0 text-accent" />
          Recommended action: <strong className="text-accent">{ACTION[score.level]}</strong> · primary hazard {habitation.primaryHazard}.
        </div>
      </motion.div>
    </motion.div>
  );
}
