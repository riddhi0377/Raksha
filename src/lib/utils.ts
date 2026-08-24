import type { HazardSeverity } from "./data";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const severityMeta: Record<
  HazardSeverity,
  { label: string; text: string; bg: string; dot: string; ring: string }
> = {
  critical: {
    label: "Critical",
    text: "text-hazard-critical",
    bg: "bg-hazard-critical/10",
    dot: "bg-hazard-critical",
    ring: "ring-hazard-critical/30",
  },
  high: {
    label: "High",
    text: "text-hazard-high",
    bg: "bg-hazard-high/10",
    dot: "bg-hazard-high",
    ring: "ring-hazard-high/30",
  },
  moderate: {
    label: "Moderate",
    text: "text-hazard-moderate",
    bg: "bg-hazard-moderate/10",
    dot: "bg-hazard-moderate",
    ring: "ring-hazard-moderate/30",
  },
  low: {
    label: "Low",
    text: "text-hazard-low",
    bg: "bg-hazard-low/10",
    dot: "bg-hazard-low",
    ring: "ring-hazard-low/30",
  },
};

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function pct(used: number, total: number): number {
  return Math.round((used / total) * 100);
}

export const severityHex: Record<HazardSeverity, string> = {
  critical: "#f43f5e",
  high: "#fb923c",
  moderate: "#facc15",
  low: "#34d399",
};

export function riskSeverity(score: number): HazardSeverity {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

export function classifyRisk(score: number): { label: string; severity: HazardSeverity; hex: string } {
  const severity = riskSeverity(score);
  return { label: `${severityMeta[severity].label} Risk`, severity, hex: severityHex[severity] };
}
