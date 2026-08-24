import { useState } from "react";
import { AlertTriangle, Truck, Users, ShieldCheck, ArrowUpRight } from "lucide-react";
import { SectionHeader, StatCard } from "../ui";
import { GisMap } from "../GisMap";
import { LocationIntel } from "../LocationIntel";
import { habitats, hazardZones, relocationSites, DEMO_LABEL } from "../../lib/data";
import { formatCompact } from "../../lib/utils";

export function Dashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const highRisk = habitats.filter((h) => h.riskScore >= 60);
  const p0 = habitats.filter((h) => h.priority === "P0");
  const popAtRisk = highRisk.reduce((s, h) => s + h.population, 0);
  const safeCapacity = relocationSites.reduce((s, r) => s + (r.capacity - r.occupied), 0);

  const selectHabitat = (id: string) => {
    setSelectedSiteId(null);
    setSelectedHabitatId(id);
  };
  const selectSite = (id: string) => {
    setSelectedHabitatId(null);
    setSelectedSiteId(id);
  };
  const clearSelection = () => {
    setSelectedHabitatId(null);
    setSelectedSiteId(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Command Center · National Situation"
        title="RAKSHA Command Center"
        description={`Real-time hazard red-zone monitoring, carrying-capacity assessment and relocation prioritisation. Source: ${DEMO_LABEL}.`}
        action={
          <button
            onClick={() => onNavigate("relocation")}
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-accent/10 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
          >
            Relocation Board <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="High-Risk Habitations" value={highRisk.length} icon={<AlertTriangle className="h-4 w-4" />} tone="critical" />
        <StatCard label="Immediate Relocation" value={p0.length} icon={<Truck className="h-4 w-4" />} tone="high" />
        <StatCard label="Population at Risk" value={formatCompact(popAtRisk)} icon={<Users className="h-4 w-4" />} tone="accent" />
        <StatCard label="Available Safe Capacity" value={formatCompact(safeCapacity)} icon={<ShieldCheck className="h-4 w-4" />} tone="ok" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:h-[680px] xl:grid-cols-[2.1fr_1fr]">
        <div className="h-full min-h-[460px]">
          <GisMap
            habitats={habitats}
            relocationSites={relocationSites}
            hazardZones={hazardZones}
            selectedHabitatId={selectedHabitatId ?? undefined}
            selectedSiteId={selectedSiteId ?? undefined}
            onSelectHabitat={selectHabitat}
            onSelectSite={selectSite}
          />
        </div>

        <div className="h-full min-h-[440px]">
          <LocationIntel
            habitats={habitats}
            relocationSites={relocationSites}
            hazardZones={hazardZones}
            selectedHabitatId={selectedHabitatId}
            selectedSiteId={selectedSiteId}
            onSelectHabitat={selectHabitat}
            onSelectSite={selectSite}
            onClear={clearSelection}
          />
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-600">
        {DEMO_LABEL} · Map markers, hazard zones and relocation sites are synthetic and for prototype demonstration only.
      </p>
    </div>
  );
}
