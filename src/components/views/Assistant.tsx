import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Cpu,
  ShieldAlert,
  Building2,
  Gauge,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";
import { SectionHeader, Card, CardHeader, Badge } from "../ui";
import {
  habitats,
  relocationSites,
  habitatAnalyses,
  relocationScores,
  siteSuitability,
  capacityAnalysis,
  CAPACITY_RESOURCE_LABELS,
  DEMO_LABEL,
} from "../../lib/data";
import { formatNumber, severityHex, riskSeverity } from "../../lib/utils";

/* ------------------------------------------------------------------ */
/* Local, deterministic explanation engine.                            */
/* No external AI / network calls - every output is derived from the   */
/* precomputed dataset (habitat analyses, relocation scores, site      */
/* suitability and carrying-capacity engines).                         */
/* ------------------------------------------------------------------ */

type QuestionId = "habitation" | "site" | "capacity" | "change";

interface Answer {
  recommendation: string;
  evidence: string[];
  riskFactors: { label: string; value: number; note?: string }[];
  action: string;
}

const QUESTIONS: { id: QuestionId; label: string; icon: React.ReactNode }[] = [
  { id: "habitation", label: "Why is this habitation prioritized?", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  { id: "site", label: "Why was this relocation site recommended?", icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: "capacity", label: "What factors are limiting carrying capacity?", icon: <Gauge className="h-3.5 w-3.5" /> },
  { id: "change", label: "What would change the recommendation?", icon: <RefreshCw className="h-3.5 w-3.5" /> },
];

function defaultSiteForHab(habId: string): string {
  const hab = habitats.find((h) => h.id === habId)!;
  const matched = relocationSites.find((s) => s.name === hab.recommendedSite);
  if (matched) return matched.id;
  const rec = Object.values(siteSuitability).find((s) => s.recommended);
  return rec?.siteId ?? relocationSites[0].id;
}

function buildAnswer(q: QuestionId, habId: string, siteId: string): Answer {
  const hab = habitats.find((h) => h.id === habId)!;
  const hA = habitatAnalyses[hab.id];
  const rS = relocationScores[hab.id];
  const site = relocationSites.find((s) => s.id === siteId)!;
  const sS = siteSuitability[site.id];
  const cA = capacityAnalysis[site.id];

  const hazComp = hA.components.find((c) => c.key === "hazardSeverity")!.value;
  const vulnComp = hA.components.find((c) => c.key === "populationVulnerability")!.value;
  const vulnPct = Math.round((hab.vulnerable / hab.population) * 100);

  if (q === "habitation") {
    const top = [...hA.components].sort((a, b) => b.value - a.value).slice(0, 3);
    const maxHazard = Math.max(
      hA.hazardScores.flood,
      hA.hazardScores.landslide,
      hA.hazardScores.earthquake,
      hA.hazardScores.cloudburst,
      hA.hazardScores.erosion
    );
    return {
      recommendation: `${hab.name} holds ${rS.level} relocation priority (score ${rS.score}/100) and is flagged ${hab.priority}. The composite hazard model places its exposure at ${hab.riskScore}/100, driven primarily by ${hab.primaryHazard} risk.`,
      evidence: [
        `Hazard Severity component = ${hazComp} (weight 35%, contributes ${Math.round(hazComp * 0.35)} pts to the score).`,
        `Population Vulnerability = ${vulnComp} - ${vulnPct}% of ${formatNumber(hab.population)} residents are children, elderly or disabled.`,
        `Historical Disaster Frequency = ${rS.historicalFrequency}; Infrastructure Exposure = ${rS.infrastructureExposure}.`,
        `Evacuation Accessibility = ${rS.evacuationAccessibility}; ${hab.name} lies in ${hab.district}, ${hab.state}.`,
      ],
      riskFactors: [
        ...top.map((c) => ({ label: c.label, value: c.value, note: `contributes ${c.contribution} pts` })),
        { label: `${hab.primaryHazard} Hazard Score`, value: maxHazard, note: "peak per-hazard exposure" },
      ],
      action: `Initiate ${hab.priority} relocation toward an available safe site; pre-position transport and medical assets given the ${vulnPct}% vulnerable population.`,
    };
  }

  if (q === "site") {
    const ordered = [...sS.factors].sort((a, b) => a.value - b.value).slice(0, 3);
    const strong = [...sS.factors].sort((a, b) => b.value * b.weight - a.value * a.weight).slice(0, 2);
    return {
      recommendation: `${site.name} is the highest-ranked relocation site (suitability ${sS.score}/100, rank ${sS.rank} of ${relocationSites.length})${
        sS.recommended ? " and is flagged as the recommended destination" : ""
      }. It was selected because it balances low hazard exposure with available capacity.`,
      evidence: [
        `Hazard Exposure (raw) = ${sS.hazardExposure} -> safety score ${100 - sS.hazardExposure}.`,
        `Remaining capacity = ${formatNumber(sS.remaining)} of ${formatNumber(sS.capacity)} (${Math.round((sS.remaining / sS.capacity) * 100)}% free).`,
        `Distance from nearest settlement = ${sS.distanceKm} km; Road Access = ${sS.roadAccess}; Healthcare Access = ${sS.healthcareAccess}.`,
        `Strongest factors: ${strong.map((f) => `${f.label} (${Math.round(f.value * f.weight)} pts)`).join(", ")}.`,
      ],
      riskFactors: ordered.map((f) => ({ label: f.label, value: f.value, note: `weight ${Math.round(f.weight * 100)}%` })),
      action: `Confirm ${site.name} readiness and stage water, healthcare and road access before intake; monitor occupancy to avoid breaching safe carrying capacity.`,
    };
  }

  if (q === "capacity") {
    const ordered = Object.entries(cA.breakdown)
      .map(([k, v]) => ({ k: k as keyof typeof cA.breakdown, v }))
      .sort((a, b) => a.v - b.v)
      .slice(0, 3);
    const limitingLabel = CAPACITY_RESOURCE_LABELS[cA.limitingKey];
    return {
      recommendation: `${site.name} safe carrying capacity = ${formatNumber(cA.safeCapacity)} people (utilization ${cA.utilization}%, status ${cA.status}). The binding constraint is ${limitingLabel}.`,
      evidence: [
        `Current population ${formatNumber(cA.currentPopulation)}; remaining headroom ${formatNumber(cA.remaining)}.`,
        `Calculated as the minimum across 7 sub-capacities (land, housing, water, healthcare, education, road, environmental).`,
        `Limiting sub-capacity: ${limitingLabel} = ${formatNumber(cA.breakdown[cA.limitingKey])}.`,
      ],
      riskFactors: ordered.map((o) => ({
        label: CAPACITY_RESOURCE_LABELS[o.k],
        value: Math.round((o.v / cA.safeCapacity) * 100),
        note: `${formatNumber(o.v)} people`,
      })),
      action: `Augment ${limitingLabel} (provisioning / infrastructure) to lift safe capacity before accepting ${formatNumber(hab.population)} incoming residents; otherwise evaluate an alternative site.`,
    };
  }

  // change
  const threshold = Math.min(60, Math.round(hab.riskScore * 0.6));
  const shortfall = Math.max(0, hab.population - cA.remaining);
  const capacityOk = cA.remaining >= hab.population;
  const exposureOk = sS.hazardExposure <= threshold;
  return {
    recommendation: `The recommendation stands because ${site.name} can absorb ${formatNumber(
      Math.min(hab.population, cA.remaining)
    )} of ${formatNumber(hab.population)} residents at raw hazard exposure ${sS.hazardExposure}. It would change if any of: (a) an alternative site offered >= ${formatNumber(
      hab.population
    )} remaining capacity, (b) site hazard exposure dropped below ${threshold}, or (c) ${hab.name} risk fell below 60 via mitigation.`,
    evidence: [
      `Capacity headroom ${formatNumber(cA.remaining)} vs required ${formatNumber(hab.population)} (${capacityOk ? "sufficient" : `short by ${formatNumber(shortfall)}`}).`,
      `Site hazard exposure ${sS.hazardExposure} vs threshold ${threshold} (${exposureOk ? "within limit" : "above limit"}).`,
      `Limiting factor at ${site.name}: ${CAPACITY_RESOURCE_LABELS[cA.limitingKey]}.`,
    ],
    riskFactors: [
      { label: "Capacity headroom", value: Math.round((cA.remaining / Math.max(1, hab.population)) * 100), note: `${formatNumber(cA.remaining)} free` },
      { label: "Site hazard exposure", value: sS.hazardExposure, note: `threshold ${threshold}` },
      { label: "Habitation risk score", value: hab.riskScore, note: "flip below 60" },
    ],
    action: `To flip the recommendation, expand ${CAPACITY_RESOURCE_LABELS[cA.limitingKey]} at ${site.name} by ${formatNumber(
      shortfall
    )} capacity, identify a lower-exposure site, or mitigate ${hab.name} risk below 60 to lower its priority.`,
  };
}

export function Assistant({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const rankedHabs = useMemo(
    () => [...habitats].sort((a, b) => relocationScores[b.id].score - relocationScores[a.id].score),
    []
  );
  const [habId, setHabId] = useState(rankedHabs[0].id);
  const [siteId, setSiteId] = useState(defaultSiteForHab(rankedHabs[0].id));
  const [question, setQuestion] = useState<QuestionId>("habitation");
  const [runId, setRunId] = useState(0);

  const hab = habitats.find((h) => h.id === habId)!;
  const site = relocationSites.find((s) => s.id === siteId)!;

  const answer = useMemo(() => buildAnswer(question, habId, siteId), [question, habId, siteId]);

  const regenerate = () => setRunId((r) => r + 1);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Decision Support"
        title="AI Decision Assistant"
        description="A deterministic, on-device explanation engine that answers relocation decisions using the calculated risk, site and capacity models."
        action={
          <div className="flex items-center gap-2">
            <Badge tone="accent">
              <Cpu className="h-3 w-3" /> Local Engine
            </Badge>
            <Badge tone="neutral">{DEMO_LABEL}</Badge>
          </div>
        }
      />

      <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/[0.05] p-3 text-xs text-slate-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          This assistant provides <span className="font-medium text-slate-100">decision-support explanations</span> derived
          from the computed dataset. It is <span className="font-medium text-slate-100">not an emergency instruction system</span>{" "}
          and must not replace on-ground assessment by responsible authorities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <Selector
          label="Vulnerable Habitation"
          value={habId}
          options={rankedHabs.map((h) => ({
            id: h.id,
            label: h.name,
            sub: `${h.district} - ${rS_level(h.id)}`,
            tone: riskSeverity(relocationScores[h.id].score),
          }))}
          onSelect={(id) => {
            setHabId(id);
            setSiteId(defaultSiteForHab(id));
            setRunId((r) => r + 1);
          }}
        />
        <Selector
          label="Relocation Site"
          value={siteId}
          options={[...relocationSites]
            .map((s) => ({ s, m: siteSuitability[s.id] }))
            .sort((a, b) => b.m.score - a.m.score)
            .map(({ s, m }) => ({
              id: s.id,
              label: s.name,
              sub: `Suitability ${m.score}${m.recommended ? " - Recommended" : ""}`,
              tone: riskSeverity(100 - m.hazardExposure),
            }))}
          onSelect={(id) => {
            setSiteId(id);
            setRunId((r) => r + 1);
          }}
        />
        <button
          onClick={regenerate}
          className="focus-ring flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent ring-1 ring-inset ring-accent/25 transition-colors hover:bg-accent/15"
        >
          <RefreshCw className="h-4 w-4" /> Regenerate
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q) => {
          const sel = q.id === question;
          return (
            <button
              key={q.id}
              onClick={() => {
                setQuestion(q.id);
                setRunId((r) => r + 1);
              }}
              className={`focus-ring flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                sel
                  ? "border-accent/40 bg-accent/[0.1] text-accent"
                  : "border-white/[0.08] text-slate-400 hover:bg-white/[0.03]"
              }`}
            >
              {q.icon}
              {q.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${question}-${habId}-${siteId}-${runId}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="label-mono text-accent/70">AI Recommendation</div>
                <div className="text-xs text-slate-500">
                  {hab.name} → {site.name} · generated by RAKSHA Decision Engine
                </div>
              </div>
            </div>
            <p className="relative text-[15px] leading-relaxed text-slate-100">{answer.recommendation}</p>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Evidence" subtitle="Computed from the analytical models" />
              <ul className="space-y-2.5">
                {answer.evidence.map((e, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Key Risk Factors" subtitle="Highest-impact inputs" />
              <div className="space-y-3">
                {answer.riskFactors.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{f.label}</span>
                      <span className="font-semibold" style={{ color: severityHex[riskSeverity(f.value)] }}>
                        {f.value}
                        {f.note ? <span className="ml-1.5 font-normal text-slate-500">{f.note}</span> : null}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, f.value)}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: severityHex[riskSeverity(f.value)] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="border-accent/20 bg-accent/[0.04]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="label-mono text-accent/70">Recommended Action</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-100">{answer.action}</p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate("simulation")}
                    className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.03]"
                  >
                    Test this in Relocation Simulation <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </Card>

          <p className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <AlertTriangle className="h-3 w-3" />
            Decision-support output from the {DEMO_LABEL}. Not an emergency instruction. Verify on ground before action.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function rS_level(habId: string): string {
  return relocationScores[habId].level;
}

function Selector({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { id: string; label: string; sub: string; tone: HazardSeverity }[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = options.find((o) => o.id === value)!;
  return (
    <div ref={ref} className="relative">
      <div className="label-mono mb-1.5 text-slate-500">{label}</div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: severityHex[current.tone] }} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-100">{current.label}</div>
            <div className="truncate text-[11px] text-slate-500">{current.sub}</div>
          </div>
        </div>
        <ArrowRight className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-navy-900/95 p-1.5 shadow-2xl backdrop-blur"
          >
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  onSelect(o.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04] ${
                  o.id === value ? "bg-accent/[0.08]" : ""
                }`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: severityHex[o.tone] }} />
                <div className="min-w-0">
                  <div className="truncate text-sm text-slate-100">{o.label}</div>
                  <div className="truncate text-[11px] text-slate-500">{o.sub}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type HazardSeverity = "critical" | "high" | "moderate" | "low";
