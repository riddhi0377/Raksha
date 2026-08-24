export type HazardSeverity = "critical" | "high" | "moderate" | "low";

export type HazardType =
  | "Flood Risk"
  | "Landslide"
  | "Seismic"
  | "Coastal Erosion"
  | "Industrial"
  | "Fire Prone";

export interface HazardZone {
  id: string;
  name: string;
  district: string;
  state: string;
  type: HazardType;
  severity: HazardSeverity;
  riskIndex: number; // 0 - 100
  population: number;
  vulnerable: number; // children + elderly + disabled
  affectedAreaKm2: number;
  lastUpdated: string;
  trend: "rising" | "stable" | "falling";
  coords: { lat: number; lng: number };
}

export interface RelocationTask {
  id: string;
  zone: string;
  households: number;
  people: number;
  priority: "P0" | "P1" | "P2";
  etaHours: number;
  status: "Queued" | "En Route" | "Relocated" | "Blocked";
  safeSite: string;
  distanceKm: number;
}

export interface SafeSite {
  id: string;
  name: string;
  type: "Relief Camp" | "School" | "Community Hall" | "Multipurpose Shelter";
  district: string;
  capacity: number;
  occupied: number;
  rating: number; // structural safety 0-100
  amenities: string[];
  status: "Operational" | "Expanding" | "Full";
}

export interface CapacityMetric {
  label: string;
  total: number;
  used: number;
  unit: string;
  region: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  trigger: string;
  severity: HazardSeverity;
  displaced: number;
  atRiskSites: number;
  mitigation: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  severity: HazardSeverity;
  time: string;
  read: boolean;
}

export const DEMO_LABEL = "Demonstration Dataset";

export const hazardZones: HazardZone[] = [
  {
    id: "HZ-2041",
    name: "Asamudyalankha Block",
    district: "Koraput",
    state: "Odisha",
    type: "Flood Risk",
    severity: "critical",
    riskIndex: 92,
    population: 18420,
    vulnerable: 6230,
    affectedAreaKm2: 47.3,
    lastUpdated: "2026-02-14T08:12:00Z",
    trend: "rising",
    coords: { lat: 18.81, lng: 82.71 },
  },
  {
    id: "HZ-2042",
    name: "Lower Baitarani Belt",
    district: "Kendrapara",
    state: "Odisha",
    type: "Flood Risk",
    severity: "critical",
    riskIndex: 88,
    population: 24110,
    vulnerable: 8120,
    affectedAreaKm2: 61.8,
    lastUpdated: "2026-02-14T08:05:00Z",
    trend: "rising",
    coords: { lat: 20.5, lng: 86.42 },
  },
  {
    id: "HZ-2053",
    name: "Nilgiri Foothills",
    district: "Balasore",
    state: "Odisha",
    type: "Landslide",
    severity: "high",
    riskIndex: 74,
    population: 9120,
    vulnerable: 2870,
    affectedAreaKm2: 22.1,
    lastUpdated: "2026-02-14T07:48:00Z",
    trend: "stable",
    coords: { lat: 21.46, lng: 86.98 },
  },
  {
    id: "HZ-2061",
    name: "Mahanadi Embankment",
    district: "Cuttack",
    state: "Odisha",
    type: "Flood Risk",
    severity: "high",
    riskIndex: 69,
    population: 33240,
    vulnerable: 10420,
    affectedAreaKm2: 88.4,
    lastUpdated: "2026-02-14T07:30:00Z",
    trend: "rising",
    coords: { lat: 20.46, lng: 85.88 },
  },
  {
    id: "HZ-2078",
    name: "Coastal Ganjam Strip",
    district: "Ganjam",
    state: "Odisha",
    type: "Coastal Erosion",
    severity: "moderate",
    riskIndex: 58,
    population: 15780,
    vulnerable: 4980,
    affectedAreaKm2: 34.6,
    lastUpdated: "2026-02-14T06:55:00Z",
    trend: "stable",
    coords: { lat: 19.36, lng: 84.99 },
  },
  {
    id: "HZ-2089",
    name: "Industrial Belt Jajpur",
    district: "Jajpur",
    state: "Odisha",
    type: "Industrial",
    severity: "moderate",
    riskIndex: 51,
    population: 12840,
    vulnerable: 3120,
    affectedAreaKm2: 18.9,
    lastUpdated: "2026-02-14T06:40:00Z",
    trend: "falling",
    coords: { lat: 20.85, lng: 86.33 },
  },
  {
    id: "HZ-2094",
    name: "Dhenkanal Reserve",
    district: "Dhenkanal",
    state: "Odisha",
    type: "Fire Prone",
    severity: "low",
    riskIndex: 34,
    population: 6740,
    vulnerable: 1410,
    affectedAreaKm2: 12.2,
    lastUpdated: "2026-02-14T06:20:00Z",
    trend: "falling",
    coords: { lat: 20.66, lng: 85.6 },
  },
  {
    id: "HZ-2102",
    name: "Seismic Pocket Rayagada",
    district: "Rayagada",
    state: "Odisha",
    type: "Seismic",
    severity: "high",
    riskIndex: 71,
    population: 10560,
    vulnerable: 3790,
    affectedAreaKm2: 27.5,
    lastUpdated: "2026-02-14T05:58:00Z",
    trend: "stable",
    coords: { lat: 19.17, lng: 83.42 },
  },
  {
    id: "HZ-3001",
    name: "Dibrugarh Riverine Belt",
    district: "Dibrugarh",
    state: "Assam",
    type: "Flood Risk",
    severity: "critical",
    riskIndex: 89,
    population: 28900,
    vulnerable: 9100,
    affectedAreaKm2: 74.2,
    lastUpdated: "2026-02-14T08:20:00Z",
    trend: "rising",
    coords: { lat: 27.48, lng: 94.9 },
  },
  {
    id: "HZ-3002",
    name: "Barak Valley Margin",
    district: "Cachar",
    state: "Assam",
    type: "Flood Risk",
    severity: "high",
    riskIndex: 77,
    population: 19800,
    vulnerable: 6400,
    affectedAreaKm2: 41.3,
    lastUpdated: "2026-02-14T08:02:00Z",
    trend: "rising",
    coords: { lat: 24.83, lng: 92.94 },
  },
  {
    id: "HZ-3011",
    name: "Tehri Slope Complex",
    district: "Tehri",
    state: "Uttarakhand",
    type: "Landslide",
    severity: "critical",
    riskIndex: 86,
    population: 7600,
    vulnerable: 2100,
    affectedAreaKm2: 19.8,
    lastUpdated: "2026-02-14T07:40:00Z",
    trend: "rising",
    coords: { lat: 30.38, lng: 78.43 },
  },
  {
    id: "HZ-3012",
    name: "Mandakini Belt",
    district: "Rudraprayag",
    state: "Uttarakhand",
    type: "Landslide",
    severity: "high",
    riskIndex: 81,
    population: 5400,
    vulnerable: 1680,
    affectedAreaKm2: 15.4,
    lastUpdated: "2026-02-14T07:22:00Z",
    trend: "stable",
    coords: { lat: 30.28, lng: 78.98 },
  },
  {
    id: "HZ-3021",
    name: "Patna Diara Cluster",
    district: "Patna",
    state: "Bihar",
    type: "Flood Risk",
    severity: "critical",
    riskIndex: 85,
    population: 33700,
    vulnerable: 10800,
    affectedAreaKm2: 58.1,
    lastUpdated: "2026-02-14T08:15:00Z",
    trend: "rising",
    coords: { lat: 25.61, lng: 85.14 },
  },
  {
    id: "HZ-3031",
    name: "Mumbai Coastal Ward",
    district: "Mumbai",
    state: "Maharashtra",
    type: "Coastal Erosion",
    severity: "high",
    riskIndex: 72,
    population: 42500,
    vulnerable: 13200,
    affectedAreaKm2: 36.7,
    lastUpdated: "2026-02-14T06:48:00Z",
    trend: "stable",
    coords: { lat: 19.04, lng: 72.85 },
  },
  {
    id: "HZ-3032",
    name: "Chennai Low-Lying Zone",
    district: "Chennai",
    state: "Tamil Nadu",
    type: "Flood Risk",
    severity: "high",
    riskIndex: 74,
    population: 51200,
    vulnerable: 16800,
    affectedAreaKm2: 63.5,
    lastUpdated: "2026-02-14T06:30:00Z",
    trend: "rising",
    coords: { lat: 13.08, lng: 80.27 },
  },
  {
    id: "HZ-3041",
    name: "Kutch Coastal Settlement",
    district: "Kutch",
    state: "Gujarat",
    type: "Coastal Erosion",
    severity: "moderate",
    riskIndex: 63,
    population: 14300,
    vulnerable: 3900,
    affectedAreaKm2: 28.9,
    lastUpdated: "2026-02-14T05:40:00Z",
    trend: "falling",
    coords: { lat: 23.25, lng: 69.67 },
  },
  {
    id: "HZ-3051",
    name: "Kerala Backwater Reach",
    district: "Alappuzha",
    state: "Kerala",
    type: "Flood Risk",
    severity: "moderate",
    riskIndex: 66,
    population: 19500,
    vulnerable: 6100,
    affectedAreaKm2: 24.6,
    lastUpdated: "2026-02-14T05:20:00Z",
    trend: "stable",
    coords: { lat: 9.49, lng: 76.33 },
  },
  {
    id: "HZ-3061",
    name: "Imphal Seismic Pocket",
    district: "Imphal",
    state: "Manipur",
    type: "Seismic",
    severity: "high",
    riskIndex: 78,
    population: 12300,
    vulnerable: 3500,
    affectedAreaKm2: 21.2,
    lastUpdated: "2026-02-14T05:05:00Z",
    trend: "stable",
    coords: { lat: 24.82, lng: 93.94 },
  },
  {
    id: "HZ-3071",
    name: "Visakhapatnam Slope",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    type: "Landslide",
    severity: "high",
    riskIndex: 70,
    population: 26800,
    vulnerable: 7900,
    affectedAreaKm2: 31.4,
    lastUpdated: "2026-02-14T04:50:00Z",
    trend: "stable",
    coords: { lat: 17.69, lng: 83.22 },
  },
];

export const relocationTasks: RelocationTask[] = [
  {
    id: "RL-9001",
    zone: "Asamudyalankha Block",
    households: 1840,
    people: 6230,
    priority: "P0",
    etaHours: 2.5,
    status: "En Route",
    safeSite: "Koraput Central Relief Camp",
    distanceKm: 14.2,
  },
  {
    id: "RL-9002",
    zone: "Lower Baitarani Belt",
    households: 2310,
    people: 8120,
    priority: "P0",
    etaHours: 4.0,
    status: "Queued",
    safeSite: "Kendrapara Multipurpose Shelter",
    distanceKm: 22.8,
  },
  {
    id: "RL-9003",
    zone: "Nilgiri Foothills",
    households: 760,
    people: 2870,
    priority: "P1",
    etaHours: 6.5,
    status: "En Route",
    safeSite: "Balasore Community Hall",
    distanceKm: 9.6,
  },
  {
    id: "RL-9004",
    zone: "Mahanadi Embankment",
    households: 2980,
    people: 10420,
    priority: "P1",
    etaHours: 8.0,
    status: "Blocked",
    safeSite: "Cuttack School Campus",
    distanceKm: 31.4,
  },
  {
    id: "RL-9005",
    zone: "Coastal Ganjam Strip",
    households: 1120,
    people: 4980,
    priority: "P2",
    etaHours: 11.0,
    status: "Queued",
    safeSite: "Ganjam Relief Camp",
    distanceKm: 18.1,
  },
  {
    id: "RL-9006",
    zone: "Seismic Pocket Rayagada",
    households: 980,
    people: 3790,
    priority: "P1",
    etaHours: 7.2,
    status: "Relocated",
    safeSite: "Rayagada Multipurpose Shelter",
    distanceKm: 12.7,
  },
];

export const safeSites: SafeSite[] = [
  {
    id: "SS-101",
    name: "Koraput Central Relief Camp",
    type: "Relief Camp",
    district: "Koraput",
    capacity: 8000,
    occupied: 5120,
    rating: 91,
    amenities: ["Medical", "Power", "Food", "Comms"],
    status: "Operational",
  },
  {
    id: "SS-102",
    name: "Kendrapara Multipurpose Shelter",
    type: "Multipurpose Shelter",
    district: "Kendrapara",
    capacity: 12000,
    occupied: 9400,
    rating: 88,
    amenities: ["Medical", "Power", "Food", "Water", "Comms"],
    status: "Expanding",
  },
  {
    id: "SS-103",
    name: "Balasore Community Hall",
    type: "Community Hall",
    district: "Balasore",
    capacity: 3000,
    occupied: 1180,
    rating: 74,
    amenities: ["Food", "Water"],
    status: "Operational",
  },
  {
    id: "SS-104",
    name: "Cuttack School Campus",
    type: "School",
    district: "Cuttack",
    capacity: 9000,
    occupied: 7380,
    rating: 82,
    amenities: ["Medical", "Power", "Food", "Water"],
    status: "Operational",
  },
  {
    id: "SS-105",
    name: "Ganjam Relief Camp",
    type: "Relief Camp",
    district: "Ganjam",
    capacity: 6000,
    occupied: 4410,
    rating: 79,
    amenities: ["Power", "Food", "Water", "Comms"],
    status: "Operational",
  },
  {
    id: "SS-106",
    name: "Rayagada Multipurpose Shelter",
    type: "Multipurpose Shelter",
    district: "Rayagada",
    capacity: 5000,
    occupied: 3790,
    rating: 86,
    amenities: ["Medical", "Power", "Food", "Water", "Comms"],
    status: "Operational",
  },
  {
    id: "SS-107",
    name: "Puri Coastal Shelter",
    type: "Multipurpose Shelter",
    district: "Puri",
    capacity: 7000,
    occupied: 7000,
    rating: 90,
    amenities: ["Medical", "Power", "Food", "Water", "Comms"],
    status: "Full",
  },
];

export const capacityMetrics: CapacityMetric[] = [
  { label: "Shelter Beds", total: 46000, used: 38280, unit: "beds", region: "Odisha Cluster" },
  { label: "Medical Capacity", total: 1240, used: 712, unit: "beds", region: "Health Grid" },
  { label: "Transport Fleet", total: 320, used: 188, unit: "vehicles", region: "Logistics" },
  { label: "Food Rations", total: 210000, used: 96500, unit: "meals", region: "Supply" },
];

export const simulationScenarios: SimulationScenario[] = [
  {
    id: "SC-01",
    name: "Mahanadi Breach +2m",
    trigger: "Monsoon surge at Naraj barrage",
    severity: "critical",
    displaced: 142000,
    atRiskSites: 9,
    mitigation: "Pre-stage 6 camps, deploy 40 boats",
  },
  {
    id: "SC-02",
    name: "Cyclone Landfall Cat-4",
    trigger: "Bay of Bengal depression",
    severity: "critical",
    displaced: 96500,
    atRiskSites: 12,
    mitigation: "Mandatory evacuation 24h window",
  },
  {
    id: "SC-03",
    name: "Landslide Cascade",
    trigger: "250mm rainfall in 12h",
    severity: "high",
    displaced: 31400,
    atRiskSites: 5,
    mitigation: "Cutoff Nilgiri road access",
  },
  {
    id: "SC-04",
    name: "Industrial Leak",
    trigger: "Storage tank failure",
    severity: "moderate",
    displaced: 12840,
    atRiskSites: 3,
    mitigation: "Downwind corridor evacuation",
  },
];

export const notifications: Notification[] = [
  {
    id: "N-1",
    title: "Critical red zone escalation",
    body: "Asamudyalankha Block risk index crossed 90. Auto-prioritised to P0.",
    severity: "critical",
    time: "4m ago",
    read: false,
  },
  {
    id: "N-2",
    title: "Relocation route blocked",
    body: "RL-9004 Mahanadi Embankment route obstructed by debris. Re-routing.",
    severity: "high",
    time: "22m ago",
    read: false,
  },
  {
    id: "N-3",
    title: "Safe site nearing capacity",
    body: "Kendrapara Multipurpose Shelter at 78% occupancy. Expansion advised.",
    severity: "moderate",
    time: "1h ago",
    read: false,
  },
  {
    id: "N-4",
    title: "Sensor network healthy",
    body: "All 412 field sensors reporting nominal telemetry.",
    severity: "low",
    time: "3h ago",
    read: true,
  },
];

export type HazardCategory =
  | "Flood"
  | "Landslide"
  | "Seismic"
  | "Coastal"
  | "Industrial"
  | "Fire";

export interface Habitat {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  vulnerable: number;
  riskScore: number; // 0 - 100
  priority: "P0" | "P1" | "P2";
  primaryHazard: HazardCategory;
  status: "Critical" | "Watch" | "Stable";
  recommendedSite: string;
  distanceKm: number;
  etaHours: number;
  factors: {
    flood: number;
    landslide: number;
    seismic: number;
    infrastructure: number;
    accessibility: number;
  };
}

export interface RelocationSite {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  type: "Relief Camp" | "Multipurpose Shelter" | "Community Hall" | "School";
  proposed: boolean;
}

export interface Infrastructure {
  id: string;
  name: string;
  type: "Hospital" | "Shelter" | "Depot" | "Comms";
  lat: number;
  lng: number;
  status: "Operational" | "Strained" | "Offline";
}

export const habitats: Habitat[] = [
  {
    id: "HB-01",
    name: "Asamudyalankha Block",
    district: "Koraput",
    state: "Odisha",
    lat: 18.81,
    lng: 82.71,
    population: 18420,
    vulnerable: 6230,
    riskScore: 94,
    priority: "P0",
    primaryHazard: "Flood",
    status: "Critical",
    recommendedSite: "Koraput Central Relief Camp",
    distanceKm: 14.2,
    etaHours: 2.5,
    factors: { flood: 95, landslide: 40, seismic: 30, infrastructure: 55, accessibility: 78 },
  },
  {
    id: "HB-02",
    name: "Lower Baitarani Belt",
    district: "Kendrapara",
    state: "Odisha",
    lat: 20.5,
    lng: 86.42,
    population: 24110,
    vulnerable: 8120,
    riskScore: 90,
    priority: "P0",
    primaryHazard: "Flood",
    status: "Critical",
    recommendedSite: "Kendrapara Multipurpose Shelter",
    distanceKm: 22.8,
    etaHours: 4.0,
    factors: { flood: 92, landslide: 35, seismic: 28, infrastructure: 60, accessibility: 70 },
  },
  {
    id: "HB-03",
    name: "Dibrugarh Riverine Belt",
    district: "Dibrugarh",
    state: "Assam",
    lat: 27.48,
    lng: 94.9,
    population: 28900,
    vulnerable: 9100,
    riskScore: 88,
    priority: "P0",
    primaryHazard: "Flood",
    status: "Critical",
    recommendedSite: "Dibrugarh Camp",
    distanceKm: 18.5,
    etaHours: 3.5,
    factors: { flood: 90, landslide: 45, seismic: 35, infrastructure: 50, accessibility: 72 },
  },
  {
    id: "HB-04",
    name: "Tehri Slope Complex",
    district: "Tehri",
    state: "Uttarakhand",
    lat: 30.38,
    lng: 78.43,
    population: 7600,
    vulnerable: 2100,
    riskScore: 86,
    priority: "P0",
    primaryHazard: "Landslide",
    status: "Critical",
    recommendedSite: "Dehradun Hill Base",
    distanceKm: 42.0,
    etaHours: 6.5,
    factors: { flood: 30, landslide: 94, seismic: 62, infrastructure: 40, accessibility: 85 },
  },
  {
    id: "HB-05",
    name: "Patna Diara Cluster",
    district: "Patna",
    state: "Bihar",
    lat: 25.61,
    lng: 85.14,
    population: 33700,
    vulnerable: 10800,
    riskScore: 85,
    priority: "P0",
    primaryHazard: "Flood",
    status: "Critical",
    recommendedSite: "Patna North Shelter",
    distanceKm: 11.4,
    etaHours: 2.0,
    factors: { flood: 91, landslide: 20, seismic: 32, infrastructure: 58, accessibility: 64 },
  },
  {
    id: "HB-06",
    name: "Mandakini Belt",
    district: "Rudraprayag",
    state: "Uttarakhand",
    lat: 30.28,
    lng: 78.98,
    population: 5400,
    vulnerable: 1680,
    riskScore: 81,
    priority: "P0",
    primaryHazard: "Landslide",
    status: "Watch",
    recommendedSite: "Dehradun Hill Base",
    distanceKm: 55.2,
    etaHours: 8.0,
    factors: { flood: 35, landslide: 88, seismic: 66, infrastructure: 38, accessibility: 82 },
  },
  {
    id: "HB-07",
    name: "Barak Valley Margin",
    district: "Cachar",
    state: "Assam",
    lat: 24.83,
    lng: 92.94,
    population: 19800,
    vulnerable: 6400,
    riskScore: 79,
    priority: "P1",
    primaryHazard: "Flood",
    status: "Watch",
    recommendedSite: "Guwahati East Shelter",
    distanceKm: 26.7,
    etaHours: 5.0,
    factors: { flood: 84, landslide: 50, seismic: 40, infrastructure: 48, accessibility: 75 },
  },
  {
    id: "HB-08",
    name: "Imphal Seismic Pocket",
    district: "Imphal",
    state: "Manipur",
    lat: 24.82,
    lng: 93.94,
    population: 12300,
    vulnerable: 3500,
    riskScore: 78,
    priority: "P1",
    primaryHazard: "Seismic",
    status: "Watch",
    recommendedSite: "Imphal Central Shelter",
    distanceKm: 9.3,
    etaHours: 2.2,
    factors: { flood: 25, landslide: 55, seismic: 90, infrastructure: 45, accessibility: 80 },
  },
  {
    id: "HB-09",
    name: "Guwahati Hillside",
    district: "Kamrup",
    state: "Assam",
    lat: 26.14,
    lng: 91.73,
    population: 22100,
    vulnerable: 6800,
    riskScore: 77,
    priority: "P1",
    primaryHazard: "Landslide",
    status: "Watch",
    recommendedSite: "Guwahati East Shelter",
    distanceKm: 12.1,
    etaHours: 3.0,
    factors: { flood: 48, landslide: 86, seismic: 44, infrastructure: 52, accessibility: 68 },
  },
  {
    id: "HB-10",
    name: "Chennai Low-Lying Zone",
    district: "Chennai",
    state: "Tamil Nadu",
    lat: 13.08,
    lng: 80.27,
    population: 51200,
    vulnerable: 16800,
    riskScore: 74,
    priority: "P1",
    primaryHazard: "Flood",
    status: "Watch",
    recommendedSite: "Chennai Inland Hall",
    distanceKm: 16.8,
    etaHours: 3.8,
    factors: { flood: 82, landslide: 18, seismic: 30, infrastructure: 60, accessibility: 58 },
  },
  {
    id: "HB-11",
    name: "Mumbai Coastal Ward",
    district: "Mumbai",
    state: "Maharashtra",
    lat: 19.04,
    lng: 72.85,
    population: 42500,
    vulnerable: 13200,
    riskScore: 72,
    priority: "P1",
    primaryHazard: "Coastal",
    status: "Watch",
    recommendedSite: "Mumbai Transit Shelter",
    distanceKm: 8.4,
    etaHours: 1.8,
    factors: { flood: 60, landslide: 22, seismic: 35, infrastructure: 70, accessibility: 50 },
  },
  {
    id: "HB-12",
    name: "Visakhapatnam Slope",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat: 17.69,
    lng: 83.22,
    population: 26800,
    vulnerable: 7900,
    riskScore: 70,
    priority: "P1",
    primaryHazard: "Landslide",
    status: "Watch",
    recommendedSite: "Vizag Hill Base",
    distanceKm: 14.0,
    etaHours: 3.2,
    factors: { flood: 45, landslide: 80, seismic: 42, infrastructure: 56, accessibility: 66 },
  },
  {
    id: "HB-13",
    name: "Kutch Coastal Settlement",
    district: "Kutch",
    state: "Gujarat",
    lat: 23.25,
    lng: 69.67,
    population: 14300,
    vulnerable: 3900,
    riskScore: 64,
    priority: "P2",
    primaryHazard: "Coastal",
    status: "Stable",
    recommendedSite: "Kutch Desert Shelter",
    distanceKm: 19.6,
    etaHours: 4.2,
    factors: { flood: 38, landslide: 16, seismic: 28, infrastructure: 44, accessibility: 74 },
  },
  {
    id: "HB-14",
    name: "Kerala Backwater Reach",
    district: "Alappuzha",
    state: "Kerala",
    lat: 9.49,
    lng: 76.33,
    population: 19500,
    vulnerable: 6100,
    riskScore: 66,
    priority: "P2",
    primaryHazard: "Flood",
    status: "Stable",
    recommendedSite: "Kochi Relief Camp",
    distanceKm: 21.3,
    etaHours: 4.5,
    factors: { flood: 78, landslide: 24, seismic: 26, infrastructure: 50, accessibility: 62 },
  },
  {
    id: "HB-15",
    name: "Jajpur Industrial Belt",
    district: "Jajpur",
    state: "Odisha",
    lat: 20.85,
    lng: 86.33,
    population: 12840,
    vulnerable: 3120,
    riskScore: 58,
    priority: "P2",
    primaryHazard: "Industrial",
    status: "Stable",
    recommendedSite: "Cuttack School Campus",
    distanceKm: 31.4,
    etaHours: 6.0,
    factors: { flood: 40, landslide: 22, seismic: 30, infrastructure: 38, accessibility: 70 },
  },
];

export const relocationSites: RelocationSite[] = [
  { id: "RS-01", name: "Koraput Central Relief Camp", district: "Koraput", state: "Odisha", lat: 18.81, lng: 82.71, capacity: 8000, occupied: 5120, type: "Relief Camp", proposed: false },
  { id: "RS-02", name: "Kendrapara Multipurpose Shelter", district: "Kendrapara", state: "Odisha", lat: 20.5, lng: 86.42, capacity: 12000, occupied: 9400, type: "Multipurpose Shelter", proposed: false },
  { id: "RS-03", name: "Guwahati East Shelter", district: "Kamrup", state: "Assam", lat: 26.2, lng: 91.8, capacity: 9000, occupied: 1200, type: "Multipurpose Shelter", proposed: true },
  { id: "RS-04", name: "Dibrugarh Camp", district: "Dibrugarh", state: "Assam", lat: 27.3, lng: 94.9, capacity: 11000, occupied: 3000, type: "Relief Camp", proposed: true },
  { id: "RS-05", name: "Dehradun Hill Base", district: "Dehradun", state: "Uttarakhand", lat: 30.31, lng: 78.03, capacity: 6000, occupied: 800, type: "Multipurpose Shelter", proposed: true },
  { id: "RS-06", name: "Patna North Shelter", district: "Patna", state: "Bihar", lat: 25.62, lng: 85.1, capacity: 14000, occupied: 6200, type: "Multipurpose Shelter", proposed: false },
  { id: "RS-07", name: "Chennai Inland Hall", district: "Chennai", state: "Tamil Nadu", lat: 13.05, lng: 80.1, capacity: 18000, occupied: 9100, type: "Community Hall", proposed: false },
  { id: "RS-08", name: "Mumbai Transit Shelter", district: "Mumbai", state: "Maharashtra", lat: 19.07, lng: 72.88, capacity: 22000, occupied: 13400, type: "Multipurpose Shelter", proposed: false },
  { id: "RS-09", name: "Kochi Relief Camp", district: "Kochi", state: "Kerala", lat: 9.96, lng: 76.24, capacity: 8000, occupied: 2600, type: "Relief Camp", proposed: false },
  { id: "RS-10", name: "Kutch Desert Shelter", district: "Kutch", state: "Gujarat", lat: 23.3, lng: 69.7, capacity: 7000, occupied: 500, type: "Multipurpose Shelter", proposed: true },
  { id: "RS-11", name: "Imphal Central Shelter", district: "Imphal", state: "Manipur", lat: 24.8, lng: 93.94, capacity: 6500, occupied: 1500, type: "Relief Camp", proposed: true },
  { id: "RS-12", name: "Vizag Hill Base", district: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.7, lng: 83.2, capacity: 7500, occupied: 900, type: "Multipurpose Shelter", proposed: true },
];

export const infrastructure: Infrastructure[] = [
  { id: "IN-01", name: "AIIMS Patna", type: "Hospital", lat: 25.6, lng: 85.1, status: "Operational" },
  { id: "IN-02", name: "Guwahati Medical College", type: "Hospital", lat: 26.16, lng: 91.75, status: "Operational" },
  { id: "IN-03", name: "Bhubaneswar Logistics Depot", type: "Depot", lat: 20.29, lng: 85.82, status: "Operational" },
  { id: "IN-04", name: "Chennai Comms Hub", type: "Comms", lat: 13.08, lng: 80.27, status: "Operational" },
  { id: "IN-05", name: "Mumbai Relief Warehouse", type: "Depot", lat: 19.07, lng: 72.88, status: "Strained" },
  { id: "IN-06", name: "Dehradun Forward Base", type: "Shelter", lat: 30.31, lng: 78.03, status: "Operational" },
  { id: "IN-07", name: "Kochi Naval Logistics", type: "Depot", lat: 9.96, lng: 76.24, status: "Operational" },
  { id: "IN-08", name: "Silchar Field Hospital", type: "Hospital", lat: 24.83, lng: 92.78, status: "Strained" },
];

/* ------------------------------------------------------------------ */
/* Explainable hazard analytics (synthetic, for demonstration only)   */
/* ------------------------------------------------------------------ */

export interface HazardScores {
  flood: number;
  landslide: number;
  earthquake: number;
  cloudburst: number;
  erosion: number;
}

export interface RiskDrivers {
  historicalFrequency: number;
  rainfallIntensity: number;
  slopeInstability: number;
  populationDensity: number;
  roadAccessibility: number;
  proximityToHazard: number;
  infrastructureExposure: number;
}

export interface RiskComponentDef {
  key: string;
  label: string;
  weight: number; // 0..1
}

export interface RiskComponent extends RiskComponentDef {
  value: number; // 0..100
  contribution: number; // weight * value
}

export interface HazardAnalysis {
  hazardScores: HazardScores;
  riskDrivers: RiskDrivers;
  components: RiskComponent[];
  overall: number;
}

export const RISK_WEIGHTS: RiskComponentDef[] = [
  { key: "hazardSeverity", label: "Hazard Severity", weight: 0.35 },
  { key: "populationVulnerability", label: "Population Vulnerability", weight: 0.25 },
  { key: "historicalEvents", label: "Historical Events", weight: 0.15 },
  { key: "infrastructureExposure", label: "Infrastructure Exposure", weight: 0.15 },
  { key: "accessibility", label: "Accessibility", weight: 0.1 },
];

function seeded(id: string): () => number {
  let s = 2166136261;
  for (let i = 0; i < id.length; i++) {
    s ^= id.charCodeAt(i);
    s = Math.imul(s, 16777619);
  }
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(n)));

const hazardKeyOf: Record<string, keyof HazardScores> = {
  Flood: "flood",
  Landslide: "landslide",
  Seismic: "earthquake",
  Coastal: "erosion",
  Industrial: "erosion",
  Fire: "erosion",
};

function analyze(h: Habitat): HazardAnalysis {
  const r = seeded(h.id);
  const pull = h.riskScore / 100;
  const primaryKey = hazardKeyOf[h.primaryHazard] ?? "flood";

  const hazardScores: HazardScores = {
    flood: 0,
    landslide: 0,
    earthquake: 0,
    cloudburst: 0,
    erosion: 0,
  };
  (Object.keys(hazardScores) as (keyof HazardScores)[]).forEach((k) => {
    if (k === primaryKey) {
      hazardScores[k] = clamp(78 + r() * 20);
    } else {
      hazardScores[k] = clamp(18 + r() * 42 * (0.6 + pull * 0.5));
    }
  });
  // cloudburst correlates with rainfall / flood regime
  hazardScores.cloudburst = clamp(hazardScores.flood * 0.5 + 22 + r() * 28);
  hazardScores.erosion = clamp(hazardScores.erosion * 0.7 + 24 + r() * 22);

  const riskDrivers: RiskDrivers = {
    historicalFrequency: clamp(34 + r() * 54 + (h.primaryHazard === "Flood" || h.primaryHazard === "Landslide" ? 10 : 0)),
    rainfallIntensity: clamp(40 + r() * 55),
    slopeInstability: clamp(h.factors.landslide * 0.7 + r() * 22),
    populationDensity: clamp((h.population / 55000) * 100 + r() * 8),
    roadAccessibility: clamp(h.factors.accessibility),
    proximityToHazard: clamp(48 + pull * 46 + r() * 8),
    infrastructureExposure: clamp(h.factors.infrastructure),
  };

  const components: RiskComponent[] = RISK_WEIGHTS.map((w) => {
    let value = 0;
    switch (w.key) {
      case "hazardSeverity":
        value = Math.max(
          hazardScores.flood,
          hazardScores.landslide,
          hazardScores.earthquake,
          hazardScores.cloudburst,
          hazardScores.erosion
        );
        break;
      case "populationVulnerability":
        value = (h.vulnerable / h.population) * 100 * 0.7 + 24 + r() * 14;
        break;
      case "historicalEvents":
        value = riskDrivers.historicalFrequency;
        break;
      case "infrastructureExposure":
        value = riskDrivers.infrastructureExposure;
        break;
      case "accessibility":
        value = riskDrivers.roadAccessibility;
        break;
    }
    const v = clamp(value);
    return { ...w, value: v, contribution: Math.round(v * w.weight) };
  });

  const overall = components.reduce((s, c) => s + c.contribution, 0);
  return { hazardScores, riskDrivers, components, overall };
}

export const habitatAnalyses: Record<string, HazardAnalysis> = Object.fromEntries(
  habitats.map((h) => [h.id, analyze(h)])
);

// Keep the headline risk score consistent with the explainable model.
habitats.forEach((h) => {
  h.riskScore = habitatAnalyses[h.id].overall;
});

/* ------------------------------------------------------------------ */
/* Relocation Priority Engine (synthetic, demonstration only)          */
/* ------------------------------------------------------------------ */

export type PriorityLevel = "IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW";

export interface RelocationFactor {
  key: string;
  label: string;
  weight: number; // 0..1
  value: number; // 0..100 (derived from dataset)
  source: string;
}

export interface RelocationScore {
  habitatId: string;
  hazardScore: number;
  vulnerabilityScore: number;
  historicalFrequency: number;
  infrastructureExposure: number;
  evacuationAccessibility: number;
  factors: RelocationFactor[];
  score: number; // 0..100 weighted
  level: PriorityLevel;
}

export const RELOCATION_WEIGHTS = {
  hazardSeverity: 0.35,
  populationVulnerability: 0.25,
  historicalDisasterFrequency: 0.15,
  infrastructureExposure: 0.1,
  evacuationAccessibility: 0.15,
};

function relocationLevel(score: number): PriorityLevel {
  if (score >= 80) return "IMMEDIATE";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

const relocationSources: Record<string, string> = {
  hazardSeverity: "Maximum of per-hazard scores (Flood, Landslide, Earthquake, Cloudburst, Erosion) from the habitat analysis.",
  populationVulnerability: "Share of vulnerable residents (children, elderly, disabled) relative to total population.",
  historicalDisasterFrequency: "Modelled frequency of past disaster events recorded for the zone.",
  infrastructureExposure: "Deficit in resilient infrastructure (shelters, medical, communications).",
  evacuationAccessibility: "Road and terrain accessibility risk along evacuation routes.",
};

export const relocationScores: Record<string, RelocationScore> = Object.fromEntries(
  habitats.map((h) => {
    const a = habitatAnalyses[h.id];
    const hazardScore = a.components.find((c) => c.key === "hazardSeverity")!.value;
    const vulnerabilityScore = a.components.find((c) => c.key === "populationVulnerability")!.value;
    const historicalFrequency = a.riskDrivers.historicalFrequency;
    const infrastructureExposure = a.riskDrivers.infrastructureExposure;
    const evacuationAccessibility = a.riskDrivers.roadAccessibility;

    const raw: [keyof typeof RELOCATION_WEIGHTS, number][] = [
      ["hazardSeverity", hazardScore],
      ["populationVulnerability", vulnerabilityScore],
      ["historicalDisasterFrequency", historicalFrequency],
      ["infrastructureExposure", infrastructureExposure],
      ["evacuationAccessibility", evacuationAccessibility],
    ];

    const factors: RelocationFactor[] = raw.map(([key, value]) => ({
      key,
      label:
        key === "hazardSeverity"
          ? "Hazard Severity"
          : key === "populationVulnerability"
          ? "Population Vulnerability"
          : key === "historicalDisasterFrequency"
          ? "Historical Disaster Frequency"
          : key === "infrastructureExposure"
          ? "Infrastructure Exposure"
          : "Evacuation Accessibility",
      weight: RELOCATION_WEIGHTS[key],
      value,
      source: relocationSources[key],
    }));

    const score = Math.round(raw.reduce((s, [key, value]) => s + value * RELOCATION_WEIGHTS[key], 0));
    return [
      h.id,
      {
        habitatId: h.id,
        hazardScore,
        vulnerabilityScore,
        historicalFrequency,
        infrastructureExposure,
        evacuationAccessibility,
        factors,
        score,
        level: relocationLevel(score),
      },
    ];
  })
);

/* ------------------------------------------------------------------ */
/* Safe Site Suitability Engine (synthetic, demonstration only)        */
/* ------------------------------------------------------------------ */

function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function nearestZone(lat: number, lng: number) {
  let best = { dist: Infinity, riskIndex: 0 };
  for (const z of hazardZones) {
    const d = haversine(lat, lng, z.coords.lat, z.coords.lng);
    if (d < best.dist) best = { dist: d, riskIndex: z.riskIndex };
  }
  return best;
}

function nearestKm(lat: number, lng: number, pts: { lat: number; lng: number }[]): number {
  return Math.min(...pts.map((p) => haversine(lat, lng, p.lat, p.lng)));
}

export interface SiteFactor {
  key: string;
  label: string;
  weight: number;
  value: number; // 0..100 effective value used in scoring
  note: string;
}

export interface SiteSuitability {
  siteId: string;
  hazardExposure: number; // raw 0..100 (lower is better)
  capacity: number;
  occupancy: number;
  remaining: number;
  waterAccess: number;
  roadAccess: number;
  healthcareAccess: number;
  educationAccess: number;
  distanceKm: number;
  factors: SiteFactor[];
  score: number;
  rank: number;
  recommended: boolean;
}

export const SITE_WEIGHTS = {
  hazardExposure: 0.3,
  availableCapacity: 0.2,
  waterAvailability: 0.15,
  roadAccessibility: 0.15,
  healthcareAccess: 0.1,
  educationAccess: 0.05,
  distanceFromSettlement: 0.05,
};

export const siteSuitability: Record<string, SiteSuitability> = Object.fromEntries(
  relocationSites.map((s) => {
    const r = seeded(s.id);
    const remaining = s.capacity - s.occupied;
    const nz = nearestZone(s.lat, s.lng);
    const rawExposure = clamp((1 - Math.min(nz.dist, 1000) / 1000) * nz.riskIndex + 6);
    const hazardSafety = 100 - rawExposure;
    const capacityScore = s.capacity > 0 ? (remaining / s.capacity) * 100 : 0;

    const dHabitat = nearestKm(s.lat, s.lng, habitats.map((h) => ({ lat: h.lat, lng: h.lng })));
    const distanceScore = clamp(100 - dHabitat / 12);

    const dInfra = nearestKm(s.lat, s.lng, infrastructure.map((p) => ({ lat: p.lat, lng: p.lng })));
    const roadAccess = clamp(100 - dInfra / 220 + (r() - 0.5) * 8);

    const hospitals = infrastructure.filter((p) => p.type === "Hospital");
    const dHosp = hospitals.length
      ? nearestKm(s.lat, s.lng, hospitals.map((p) => ({ lat: p.lat, lng: p.lng })))
      : 300 + r() * 200;
    const healthcareAccess = clamp(100 - dHosp / 280 + (r() - 0.5) * 8);

    const waterAccess = clamp((s.proposed ? 52 : 70) + r() * 26);

    const eduBase =
      s.type === "School"
        ? 78
        : s.type === "Community Hall"
        ? 66
        : s.type === "Multipurpose Shelter"
        ? 58
        : 46;
    const educationAccess = clamp(eduBase + r() * 22);

    const factors: SiteFactor[] = [
      {
        key: "hazardExposure",
        label: "Hazard Exposure",
        weight: SITE_WEIGHTS.hazardExposure,
        value: hazardSafety,
        note: `Safety-adjusted = 100 − raw exposure (${Math.round(rawExposure)}). Lower hazard exposure yields a higher score.`,
      },
      {
        key: "availableCapacity",
        label: "Available Capacity",
        weight: SITE_WEIGHTS.availableCapacity,
        value: capacityScore,
        note: "Remaining capacity ÷ total capacity, as a percentage.",
      },
      {
        key: "waterAvailability",
        label: "Water Availability",
        weight: SITE_WEIGHTS.waterAvailability,
        value: waterAccess,
        note: "Derived from site provisioning (existing sites score higher).",
      },
      {
        key: "roadAccessibility",
        label: "Road Accessibility",
        weight: SITE_WEIGHTS.roadAccessibility,
        value: roadAccess,
        note: "Based on distance to nearest logistics/infrastructure node.",
      },
      {
        key: "healthcareAccess",
        label: "Healthcare Access",
        weight: SITE_WEIGHTS.healthcareAccess,
        value: healthcareAccess,
        note: "Based on distance to nearest hospital.",
      },
      {
        key: "educationAccess",
        label: "Education Access",
        weight: SITE_WEIGHTS.educationAccess,
        value: educationAccess,
        note: "Derived from site type and provisioning.",
      },
      {
        key: "distanceFromSettlement",
        label: "Distance From Settlement",
        weight: SITE_WEIGHTS.distanceFromSettlement,
        value: distanceScore,
        note: "Closer to origin settlements scores higher.",
      },
    ];

    const score = Math.round(factors.reduce((acc, f) => acc + f.value * f.weight, 0));

    return [
      s.id,
      {
        siteId: s.id,
        hazardExposure: Math.round(rawExposure),
        capacity: s.capacity,
        occupancy: s.occupied,
        remaining,
        waterAccess: Math.round(waterAccess),
        roadAccess: Math.round(roadAccess),
        healthcareAccess: Math.round(healthcareAccess),
        educationAccess: Math.round(educationAccess),
        distanceKm: Math.round(dHabitat),
        factors,
        score,
        rank: 0,
        recommended: false,
      },
    ];
  })
);

// Rank best → worst and flag the recommended (highest-scoring, non-full) site.
const rankedSites = Object.values(siteSuitability).sort((a, b) => b.score - a.score);
rankedSites.forEach((s, i) => (s.rank = i + 1));
const recommended = rankedSites.find((s) => s.remaining > 0);
if (recommended) recommended.recommended = true;

/* ------------------------------------------------------------------ */
/* Safe Carrying Capacity Engine (synthetic, demonstration only)        */
/* ------------------------------------------------------------------ */

export type CapacityStatus = "SAFE" | "NEAR CAPACITY" | "OVER CAPACITY";

export interface CapacityBreakdown {
  land: number;
  housing: number;
  water: number;
  healthcare: number;
  education: number;
  road: number;
  environmental: number;
}

export interface CapacityAnalysis {
  siteId: string;
  safeCapacity: number;
  currentPopulation: number;
  remaining: number;
  utilization: number; // %
  status: CapacityStatus;
  limitingKey: keyof CapacityBreakdown;
  breakdown: CapacityBreakdown;
}

export const CAPACITY_RESOURCE_LABELS: Record<keyof CapacityBreakdown, string> = {
  land: "Available land",
  housing: "Housing capacity",
  water: "Water availability",
  healthcare: "Healthcare capacity",
  education: "Education capacity",
  road: "Road / accessibility",
  environmental: "Environmental constraints",
};

export const capacityAnalysis: Record<string, CapacityAnalysis> = Object.fromEntries(
  relocationSites.map((s) => {
    const r = seeded(s.id + "-cap");
    const suit = siteSuitability[s.id];
    const nominal = s.capacity;

    const land = Math.round(nominal * (0.6 + r() * 0.45));
    const housing = nominal;
    const water = Math.round(nominal * (0.5 + (suit.waterAccess / 100) * 0.7));
    const healthcare = Math.round(nominal * (0.45 + (suit.healthcareAccess / 100) * 0.75));
    const education = Math.round(nominal * (0.6 + (suit.educationAccess / 100) * 0.6));
    const road = Math.round(nominal * (0.55 + (suit.roadAccess / 100) * 0.7));
    const environmental = Math.round(
      nominal * (1 - (suit.hazardExposure / 100) * 0.45) * (0.8 + r() * 0.2)
    );

    const breakdown: CapacityBreakdown = {
      land,
      housing,
      water,
      healthcare,
      education,
      road,
      environmental,
    };

    const safeCapacity = Math.min(...Object.values(breakdown));
    const currentPopulation = s.occupied;
    const remaining = safeCapacity - currentPopulation;
    const utilization = safeCapacity > 0 ? (currentPopulation / safeCapacity) * 100 : 0;
    const status: CapacityStatus =
      utilization >= 100 ? "OVER CAPACITY" : utilization >= 85 ? "NEAR CAPACITY" : "SAFE";

    const entries = Object.entries(breakdown) as [keyof CapacityBreakdown, number][];
    const limiting = entries.reduce((a, b) => (b[1] < a[1] ? b : a));

    return [
      s.id,
      {
        siteId: s.id,
        safeCapacity,
        currentPopulation,
        remaining,
        utilization: Math.round(utilization),
        status,
        limitingKey: limiting[0],
        breakdown,
      },
    ];
  })
);
