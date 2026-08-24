import {
  LayoutDashboard,
  Radar,
  Truck,
  ShieldCheck,
  Gauge,
  FlaskConical,
  Brain,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hint: string;
}

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard, hint: "Overview" },
  { id: "hazard", label: "Hazard Intelligence", icon: Radar, hint: "Red zones" },
  { id: "relocation", label: "Relocation Priority", icon: Truck, hint: "Dispatch" },
  { id: "safe", label: "Safe Sites", icon: ShieldCheck, hint: "Shelters" },
  { id: "capacity", label: "Capacity Analysis", icon: Gauge, hint: "Resources" },
  { id: "simulation", label: "Simulation", icon: FlaskConical, hint: "Forecast" },
  { id: "assistant", label: "AI Assistant", icon: Brain, hint: "Decisions" },
];
