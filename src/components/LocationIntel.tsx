import { motion } from "framer-motion";
import { AlertTriangle, Crosshair, MapPin, ShieldCheck, X, Navigation, Radio } from "lucide-react";
import { Card, CardHeader, Badge, ProgressBar } from "./ui";
import type { Habitat, RelocationSite, HazardZone } from "../lib/data";
import { cn, formatNumber, formatCompact, riskSeverity, severityHex } from "../lib/utils";

const BUFFER_KM = 160;
const ZONE_KM = 200;

function dist(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function RiskGauge({ score }: { score: number }) {
  const sev = riskSeverity(score);
  const hex = severityHex[sev];
  const r = 26;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - score / 100);
  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={hex} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold" style={{ color: hex }}>
          {score}
        </span>
        <span className="label-mono text-[7px]">risk</span>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="label-mono text-[8px]">{label}</div>
      <div className="mt-1 text-sm font-semibold" style={{ color: color ?? "#e2e8f0" }}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

export function LocationIntel({
  habitats,
  relocationSites,
  hazardZones,
  selectedHabitatId,
  selectedSiteId,
  onSelectHabitat,
  onSelectSite,
  onClear,
}: {
  habitats: Habitat[];
  relocationSites: RelocationSite[];
  hazardZones: HazardZone[];
  selectedHabitatId?: string | null;
  selectedSiteId?: string | null;
  onSelectHabitat: (id: string) => void;
  onSelectSite?: (id: string) => void;
  onClear: () => void;
}) {
  const hab = habitats.find((h) => h.id === selectedHabitatId) ?? null;
  const site = relocationSites.find((s) => s.id === selectedSiteId) ?? null;

  const body = (() => {
    if (hab) {
      const rec = relocationSites.find((s) => s.name === hab.recommendedSite) || relocationSites[0];
      const dHabSite = Math.round(dist(hab.lat, hab.lng, rec.lat, rec.lng));
      const nearby = relocationSites
        .map((s) => ({ s, d: Math.round(dist(hab.lat, hab.lng, s.lat, s.lng)) }))
        .filter((x) => x.d <= BUFFER_KM)
        .sort((a, b) => a.d - b.d);
      const zones = hazardZones
        .map((z) => ({ z, d: Math.round(dist(hab.lat, hab.lng, z.coords.lat, z.coords.lng)) }))
        .filter((x) => x.d <= ZONE_KM)
        .sort((a, b) => b.z.riskIndex - a.z.riskIndex);
      const sev = riskSeverity(hab.riskScore);
      const hex = severityHex[sev];
      const households = Math.round(hab.population / 4.6);
      const action =
        hab.priority === "P0"
          ? `Immediate evacuation advised. Pre-stage transport to ${rec.name} (${dHabSite} km, ETA ${hab.etaHours}h).`
          : hab.priority === "P1"
          ? `Prioritise staged relocation within ${hab.etaHours}h window. Monitor ${zones[0]?.z.name ?? "nearby hazards"} for escalation.`
          : `Maintain watch status. Keep ${rec.name} on standby for surge capacity.`;

      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <RiskGauge score={hab.riskScore} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-50">{hab.name}</h3>
                <Badge tone={sev === "critical" ? "critical" : sev === "high" ? "high" : sev === "moderate" ? "moderate" : "low"}>{hab.priority}</Badge>
              </div>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3" /> {hab.district}, {hab.state}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="rounded px-1.5 py-0.5" style={{ background: `${hex}1a`, color: hex }}>
                  {hab.status}
                </span>
                <span className="text-slate-500">Primary: {hab.primaryHazard}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Population" value={formatCompact(hab.population)} sub={`${formatNumber(hab.vulnerable)} vulnerable`} />
            <Metric label="Households" value={formatNumber(households)} sub="est. affected" />
            <Metric label="Recommended Site" value={rec.name} sub={`${dHabSite} km · ETA ${hab.etaHours}h`} color="#38bdf8" />
            <Metric label="Hazard Index" value={String(hab.riskScore)} sub={sev} color={hex} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-mono text-[9px]">Nearby Safe Sites · {BUFFER_KM} km</span>
              <span className="text-[10px] text-slate-500">{nearby.length} found</span>
            </div>
            <div className="space-y-1.5">
              {nearby.slice(0, 5).map(({ s, d }) => {
                const remaining = s.capacity - s.occupied;
                const isRec = s.id === rec.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelectSite?.(s.id)}
                    className={cn(
                      "focus-ring flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-colors",
                      isRec ? "border-accent/40 bg-accent/[0.06]" : "border-white/[0.06] hover:bg-white/[0.03]"
                    )}
                  >
                    <ShieldCheck className={cn("h-4 w-4 shrink-0", isRec ? "text-accent" : "text-slate-500")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[12px] font-medium text-slate-100">{s.name}</p>
                        {isRec && <span className="rounded bg-accent/15 px-1 text-[8px] text-accent">RECOMMENDED</span>}
                      </div>
                      <p className="text-[10px] text-slate-500">{s.type} · {d} km</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-200">{formatCompact(remaining)}</div>
                      <div className="label-mono text-[7px]">free</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-mono text-[9px]">Active Hazard Zones · {ZONE_KM} km</span>
              <span className="text-[10px] text-slate-500">{zones.length} found</span>
            </div>
            <div className="space-y-1.5">
              {zones.slice(0, 4).map(({ z, d }) => {
                const zhex = severityHex[z.severity];
                return (
                  <div key={z.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] p-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: zhex }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-slate-100">{z.name}</p>
                      <p className="text-[10px] text-slate-500">{z.type} · {d} km</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold" style={{ color: zhex }}>{z.riskIndex}</div>
                      <div className="label-mono text-[7px]">index</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-accent/20 bg-accent/[0.05] p-3">
            <div className="label-mono mb-1 text-[9px] text-accent/80">Recommended Action</div>
            <p className="text-[12px] leading-relaxed text-slate-200">{action}</p>
          </div>

          <button onClick={onClear} className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] py-2 text-[11px] text-slate-400 hover:bg-white/[0.03] hover:text-slate-200">
            <X className="h-3 w-3" /> Clear selection
          </button>
        </div>
      );
    }

    if (site) {
      const remaining = site.capacity - site.occupied;
      const serves = habitats.filter((h) => h.recommendedSite === site.name);
      const zones = hazardZones
        .map((z) => ({ z, d: Math.round(dist(site.lat, site.lng, z.coords.lat, z.coords.lng)) }))
        .filter((x) => x.d <= ZONE_KM)
        .sort((a, b) => b.z.riskIndex - a.z.riskIndex);
      const util = Math.round((site.occupied / site.capacity) * 100);

      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-slate-900/40">
              <ShieldCheck className="h-7 w-7 text-site" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-50">{site.name}</h3>
                {site.proposed && <Badge tone="neutral">Proposed</Badge>}
              </div>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3" /> {site.district}, {site.state}
              </p>
              <div className="mt-1 text-[11px] text-slate-400">{site.type}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Capacity" value={formatCompact(site.capacity)} />
            <Metric label="Occupied" value={formatCompact(site.occupied)} sub={`${util}% used`} />
            <Metric label="Remaining" value={formatCompact(remaining)} color={remaining > 0 ? "#34d399" : "#f43f5e"} />
            <Metric label="Status" value={remaining > 0 ? "Available" : "Full"} color={remaining > 0 ? "#34d399" : "#f43f5e"} />
          </div>

          <div>
            <div className="mb-1.5 label-mono text-[9px]">Capacity Utilisation</div>
            <ProgressBar value={util} tone={util >= 90 ? "critical" : util >= 75 ? "high" : "ok"} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-mono text-[9px]">Serves Habitations</span>
              <span className="text-[10px] text-slate-500">{serves.length} linked</span>
            </div>
            <div className="space-y-1.5">
              {serves.map((h) => (
                <button
                  key={h.id}
                  onClick={() => onSelectHabitat(h.id)}
                  className="focus-ring flex w-full items-center gap-2 rounded-lg border border-white/[0.06] p-2 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <Crosshair className="h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-slate-100">{h.name}</p>
                    <p className="text-[10px] text-slate-500">{h.priority} · {h.distanceKm} km</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold" style={{ color: severityHex[riskSeverity(h.riskScore)] }}>{h.riskScore}</div>
                    <div className="label-mono text-[7px]">risk</div>
                  </div>
                </button>
              ))}
              {serves.length === 0 && <p className="text-[11px] text-slate-500">No habitations currently routed here.</p>}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-mono text-[9px]">Hazard Exposure · {ZONE_KM} km</span>
              <span className="text-[10px] text-slate-500">{zones.length} zones</span>
            </div>
            <div className="space-y-1.5">
              {zones.slice(0, 4).map(({ z, d }) => (
                <div key={z.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] p-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: severityHex[z.severity] }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-slate-100">{z.name}</p>
                    <p className="text-[10px] text-slate-500">{z.type} · {d} km</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold" style={{ color: severityHex[z.severity] }}>{z.riskIndex}</div>
                    <div className="label-mono text-[7px]">index</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onClear} className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] py-2 text-[11px] text-slate-400 hover:bg-white/[0.03] hover:text-slate-200">
            <X className="h-3 w-3" /> Clear selection
          </button>
        </div>
      );
    }

    const totalPop = habitats.reduce((s, h) => s + h.population, 0);
    const p0 = habitats.filter((h) => h.priority === "P0").length;
    const safeCap = relocationSites.reduce((s, r) => s + (r.capacity - r.occupied), 0);
    const top = [...habitats].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Habitats" value={String(habitats.length)} />
          <Metric label="At-Risk Pop" value={formatCompact(totalPop)} color="#38bdf8" />
          <Metric label="P0 Priority" value={String(p0)} color="#f43f5e" />
          <Metric label="Safe Capacity" value={formatCompact(safeCap)} color="#34d399" />
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-accent/[0.04] p-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <Navigation className="h-4 w-4 text-accent" />
            Select any marker, cluster or hazard zone on the map to inspect live location intelligence.
          </div>
        </div>

        <div>
          <div className="mb-1.5 label-mono text-[9px]">Highest Risk Habitations</div>
          <div className="space-y-1.5">
            {top.map((h, i) => {
              const hex = severityHex[riskSeverity(h.riskScore)];
              return (
                <button
                  key={h.id}
                  onClick={() => onSelectHabitat(h.id)}
                  className="focus-ring flex w-full items-center gap-2.5 rounded-lg border border-white/[0.06] p-2 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.04] font-mono text-[10px] text-slate-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-slate-100">{h.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{h.district}, {h.state}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold" style={{ color: hex }}>{h.riskScore}</div>
                    <div className="label-mono text-[7px]">risk</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  })();

  return (
    <Card className="flex h-full min-h-[440px] flex-col">
      <CardHeader
        title="Location Intelligence"
        subtitle="Live feature analysis"
        icon={<Radio className="h-4 w-4" />}
        action={
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Live
          </span>
        }
      />
      <motion.div
        key={selectedHabitatId ?? selectedSiteId ?? "overview"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="min-h-0 flex-1 overflow-y-auto pr-1"
      >
        {body}
      </motion.div>
    </Card>
  );
}
