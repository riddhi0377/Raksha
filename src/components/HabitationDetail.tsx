import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Users,
  HeartPulse,
  Route,
  Clock,
  ShieldCheck,
  Flame,
  Mountain,
  Waves,
  Activity,
  Building2,
  ArrowRight,
  Radar,
} from "lucide-react";
import type { Habitat } from "../lib/data";
import { severityHex, riskSeverity, formatNumber } from "../lib/utils";

const hazardIcon: Record<string, typeof Flame> = {
  Flood: Waves,
  Landslide: Mountain,
  Seismic: Activity,
  Coastal: Waves,
  Industrial: Building2,
  Fire: Flame,
};

const factorMeta: { key: keyof Habitat["factors"]; label: string }[] = [
  { key: "flood", label: "Flood Exposure" },
  { key: "landslide", label: "Landslide Susceptibility" },
  { key: "seismic", label: "Seismic Vulnerability" },
  { key: "infrastructure", label: "Infrastructure Deficit" },
  { key: "accessibility", label: "Accessibility Risk" },
];

export function HabitationDetail({
  habitat,
  onClose,
  onNavigate,
}: {
  habitat: Habitat;
  onClose: () => void;
  onNavigate?: (id: string) => void;
}) {
  const sev = riskSeverity(habitat.riskScore);
  const hex = severityHex[sev];
  const HazardIcon = hazardIcon[habitat.primaryHazard] ?? Activity;

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={`${habitat.name} field analysis`}
      className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-navy-850/95 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between border-b border-white/[0.06] p-5">
        <div>
          <div className="label-mono text-accent/70">{habitat.id} · Field Analysis</div>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">{habitat.name}</h2>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" /> {habitat.district}, {habitat.state}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="focus-ring -mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: `${hex}1a`, color: hex, boxShadow: `inset 0 0 0 1px ${hex}55` }}
          >
            Priority {habitat.priority}
          </span>
          <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
            {habitat.status}
          </span>
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ background: `${hex}14`, color: hex }}
          >
            <HazardIcon className="h-3 w-3" /> {habitat.primaryHazard}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Risk Score" value={String(habitat.riskScore)} tone={hex} icon={<Activity className="h-3.5 w-3.5" />} />
          <Stat label="Population" value={formatNumber(habitat.population)} icon={<Users className="h-3.5 w-3.5" />} />
          <Stat label="Vulnerable" value={formatNumber(habitat.vulnerable)} icon={<HeartPulse className="h-3.5 w-3.5" />} />
          <Stat label="ETA to Site" value={`${habitat.etaHours}h`} icon={<Clock className="h-3.5 w-3.5" />} />
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
            <ShieldCheck className="h-4 w-4 text-hazard-low" /> Recommended Relocation Site
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-sm text-slate-100">{habitat.recommendedSite}</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Route className="h-3 w-3" /> {habitat.distanceKm} km
            </span>
          </div>
        </div>

        <div>
          <div className="label-mono mb-2.5 text-[9px]">Composite Risk Factors</div>
          <div className="space-y-3">
            {factorMeta.map((f) => {
              const v = habitat.factors[f.key];
              const c = v >= 80 ? severityHex.critical : v >= 60 ? severityHex.high : v >= 40 ? severityHex.moderate : severityHex.low;
              return (
                <div key={f.key}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{f.label}</span>
                    <span className="font-medium text-slate-200">{v}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${v}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: c }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNavigate?.("hazard")}
            className="focus-ring flex items-center justify-center gap-1.5 rounded-lg bg-accent py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-accent-deep"
          >
            <Radar className="h-3.5 w-3.5" /> Analyse Hazard
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate?.("simulation")}
              className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] py-2 text-sm text-slate-200 transition-colors hover:bg-white/[0.04]"
            >
              Plan Relocation <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="focus-ring rounded-lg border border-white/[0.08] px-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.04]"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-slate-500">
        <span className="text-slate-400">{icon}</span>
        <span className="label-mono text-[8px]">{label}</span>
      </div>
      <div className="mt-1.5 text-lg font-semibold" style={tone ? { color: tone } : undefined}>
        {value}
      </div>
    </div>
  );
}
