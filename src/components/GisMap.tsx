import { useEffect, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import type { Habitat, RelocationSite, HazardZone } from "../lib/data";
import { formatNumber } from "../lib/utils";
import "maplibre-gl/dist/maplibre-gl.css";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) || undefined;

const RAMP = [
  { min: 80, label: "Critical", color: "#f43f5e", key: "critical" },
  { min: 60, label: "High", color: "#fb923c", key: "high" },
  { min: 40, label: "Moderate", color: "#facc15", key: "moderate" },
  { min: 20, label: "Low", color: "#38bdf8", key: "low" },
  { min: 0, label: "Safe", color: "#34d399", key: "safe" },
];

function ramp(score: number) {
  return RAMP.find((r) => score >= r.min) ?? RAMP[RAMP.length - 1];
}
function bucket(score: number) {
  return ramp(score).key;
}
function rampColor(score: number) {
  return ramp(score).color;
}

const C = {
  accent: "#38bdf8",
  site: "#22d3ee",
};

function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function circlePolygon(lng: number, lat: number, radiusKm: number, steps = 48): [number, number][] {
  const coords: [number, number][] = [];
  const dLat = radiusKm / 110.574;
  const dLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(t), lat + dLat * Math.sin(t)]);
  }
  return coords;
}

function chaikin(pts: [number, number][], iters: number): [number, number][] {
  let p = pts;
  for (let k = 0; k < iters; k++) {
    const out: [number, number][] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i];
      const b = p[(i + 1) % p.length];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    p = out;
  }
  return p;
}

// Smooth, organically irregular hazard blob (seeded so it is stable per zone).
function hazardPolygon(lng: number, lat: number, radiusKm: number, rand: () => number): [number, number][] {
  const n = 46;
  const step = (Math.PI * 2) / n;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const ang = i * step;
    const jitter = 0.72 + rand() * 0.5;
    const rKm = radiusKm * jitter;
    const dLat = rKm / 110.574;
    const dLng = rKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    pts.push([lng + dLng * Math.cos(ang), lat + dLat * Math.sin(ang)]);
  }
  const smooth = chaikin(pts, 2);
  smooth.push(smooth[0]);
  return smooth;
}

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

const WATER: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[92.9, 27.5], [93.5, 26.9], [94.2, 26.2], [94.9, 26.0], [95.3, 25.6]] } },
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[85.8, 20.9], [85.9, 20.5], [86.2, 20.3], [86.4, 20.1], [86.6, 19.8]] } },
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[84.7, 25.4], [85.0, 25.2], [85.2, 25.0], [85.4, 24.7]] } },
  ],
};

const ROADS: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[84.0, 19.0], [85.8, 20.0], [86.5, 20.8], [87.0, 21.5]] } },
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[82.71, 18.81], [83.5, 19.5], [84.5, 20.0], [85.8, 20.3]] } },
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[91.7, 26.14], [92.0, 26.5], [92.9, 27.48], [94.9, 27.48]] } },
    { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[78.0, 30.0], [78.4, 30.3], [78.98, 30.28], [79.5, 30.4]] } },
  ],
};

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

function defaultStyle(): any {
  if (TOKEN) return "mapbox://styles/mapbox/dark-v11";
  return {
    version: 8 as const,
    glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    sources: {
      carto: {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors © CARTO",
      },
    },
    layers: [{ id: "carto", type: "raster", source: "carto" }],
  };
}

function loadGl() {
  if (TOKEN) {
    return import("mapbox-gl").then((m) => ({
      gl: (m as any).default ?? m,
      mapbox: true,
    }));
  }
  return import("maplibre-gl").then((m) => ({
    gl: (m as any).default ?? m,
    mapbox: false,
  }));
}

function makeIconImage(shape: "house" | "diamond", color: string, size = 64): { width: number; height: number; data: Uint8Array } {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const x = c.getContext("2d")!;
  const m = size * 0.15;
  x.clearRect(0, 0, size, size);
  x.lineJoin = "round";
  x.lineWidth = size * 0.09;
  x.strokeStyle = "rgba(4,18,31,0.92)";
  x.fillStyle = color;
  x.beginPath();
  if (shape === "house") {
    x.moveTo(size / 2, m);
    x.lineTo(size - m, size * 0.47);
    x.lineTo(size - m, size - m);
    x.lineTo(m, size - m);
    x.lineTo(m, size * 0.47);
  } else {
    x.moveTo(size / 2, m);
    x.lineTo(size - m, size / 2);
    x.lineTo(size / 2, size - m);
    x.lineTo(m, size / 2);
  }
  x.closePath();
  x.fill();
  x.stroke();
  x.fillStyle = "rgba(255,255,255,0.28)";
  if (shape === "house") {
    x.beginPath();
    x.moveTo(size / 2, m + size * 0.06);
    x.lineTo(size - m + size * 0.07, size * 0.49);
    x.lineTo(size / 2, size * 0.49);
    x.closePath();
    x.fill();
  }
  const img = x.getImageData(0, 0, size, size);
  return { width: size, height: size, data: new Uint8Array(img.data.buffer) };
}

function habPopupHTML(h: Habitat): string {
  const col = rampColor(h.riskScore);
  return `<div class="rk-pop"><div class="rk-pop-h">${h.name}</div><div class="rk-pop-sub">${h.district}, ${h.state}</div><div class="rk-pop-grid"><div><span>Population</span><b>${h.population.toLocaleString("en-IN")}</b></div><div><span>Risk Score</span><b style="color:${col}">${h.riskScore}</b></div><div><span>Primary Hazard</span><b>${h.primaryHazard}</b></div><div><span>Priority</span><b style="color:${col}">${h.priority}</b></div></div></div>`;
}

function sitePopupHTML(s: RelocationSite): string {
  const remaining = s.capacity - s.occupied;
  return `<div class="rk-pop"><div class="rk-pop-h">${s.name}</div><div class="rk-pop-sub">${s.district}, ${s.state} · ${s.type}</div><div class="rk-pop-grid"><div><span>Capacity</span><b>${s.capacity.toLocaleString("en-IN")}</b></div><div><span>Occupied</span><b>${s.occupied.toLocaleString("en-IN")}</b></div><div><span>Remaining</span><b>${formatNumber(remaining)}</b></div><div><span>Status</span><b>${s.proposed ? "Proposed" : "Operational"}</b></div></div></div>`;
}

const FILL_RAMP: any[] = [
  "interpolate",
  ["linear"],
  ["get", "score"],
  0,
  "#34d399",
  20,
  "#38bdf8",
  40,
  "#facc15",
  60,
  "#fb923c",
  80,
  "#f43f5e",
  100,
  "#f43f5e",
];

export function GisMap({
  habitats,
  relocationSites,
  hazardZones,
  selectedHabitatId,
  selectedSiteId,
  onSelectHabitat,
  onSelectSite,
}: {
  habitats: Habitat[];
  relocationSites: RelocationSite[];
  hazardZones: HazardZone[];
  selectedHabitatId?: string;
  selectedSiteId?: string;
  onSelectHabitat: (id: string) => void;
  onSelectSite?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const glRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const prevHab = useRef<string | null>(null);
  const prevSite = useRef<string | null>(null);
  const prevRec = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [engine, setEngine] = useState<"mapbox" | "maplibre">("maplibre");
  const [distanceInfo, setDistanceInfo] = useState<{ hab: string; site: string; km: number } | null>(null);
  const [layers, setLayers] = useState({
    hazard: true,
    heatmap: false,
    population: false,
    habitations: true,
    sites: true,
    roads: true,
    water: true,
  });
  const [query, setQuery] = useState("");

  const cancelAnim = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    mapRef.current?.getSource("ripple")?.setData(EMPTY);
  };

  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | null = null;
    (async () => {
      const { gl, mapbox } = await loadGl();
      if (cancelled || !containerRef.current) return;
      glRef.current = gl;
      if (mapbox) gl.accessToken = TOKEN;
      setEngine(mapbox ? "mapbox" : "maplibre");

      const map = new gl.Map({
        container: containerRef.current,
        style: defaultStyle(),
        center: [82, 22.5],
        zoom: 4.4,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
        antialias: true,
        maxZoom: 14,
      });
      mapRef.current = map;
      map.on("error", (e: any) => console.warn("[GisMap]", e?.error?.message || e));
      map.addControl(new gl.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new gl.AttributionControl({ compact: true }), "bottom-right");

      map.on("load", () => {
        if (cancelled) return;

        try {
          RAMP.forEach((r) =>
            map.addImage(`rk-hab-${r.key}`, makeIconImage("house", r.color), { pixelRatio: 2 })
          );
          map.addImage("rk-site", makeIconImage("diamond", C.site), { pixelRatio: 2 });
        } catch (err) {
          console.warn("[GisMap] icon images failed", err);
        }

        const habFC: FeatureCollection = {
          type: "FeatureCollection",
          features: habitats.map((h) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [h.lng, h.lat] },
            properties: {
              hid: h.id,
              name: h.name,
              score: h.riskScore,
              pop: h.population,
              priority: h.priority,
              bucket: bucket(h.riskScore),
            },
          })),
        };
        const siteFC: FeatureCollection = {
          type: "FeatureCollection",
          features: relocationSites.map((s) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [s.lng, s.lat] },
            properties: {
              sid: s.id,
              name: s.name,
              capacity: s.capacity,
              occupied: s.occupied,
              remaining: s.capacity - s.occupied,
              type: s.type,
              proposed: s.proposed ? 1 : 0,
            },
          })),
        };
        const hazardFC: FeatureCollection = {
          type: "FeatureCollection",
          features: hazardZones.map((z) => ({
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [hazardPolygon(z.coords.lng, z.coords.lat, 10 + (z.riskIndex / 100) * 30, seeded(z.id))] },
            properties: { score: z.riskIndex, name: z.name, type: z.type, severity: z.severity },
          })),
        };
        const heatFC: FeatureCollection = {
          type: "FeatureCollection",
          features: hazardZones.map((z) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [z.coords.lng, z.coords.lat] },
            properties: { w: z.riskIndex / 100 },
          })),
        };
        const popFC: FeatureCollection = {
          type: "FeatureCollection",
          features: habitats.map((h) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [h.lng, h.lat] },
            properties: { pop: h.population },
          })),
        };

        map.addSource("hab", { type: "geojson", data: habFC, cluster: true, clusterRadius: 50, clusterMaxZoom: 8, promoteId: "hid" });
        map.addSource("site", { type: "geojson", data: siteFC, promoteId: "sid" });
        map.addSource("hazard", { type: "geojson", data: hazardFC });
        map.addSource("hazard-heat-src", { type: "geojson", data: heatFC });
        map.addSource("pop", { type: "geojson", data: popFC });
        map.addSource("road", { type: "geojson", data: ROADS });
        map.addSource("water", { type: "geojson", data: WATER });
        map.addSource("distance", { type: "geojson", data: EMPTY });
        map.addSource("highlight", { type: "geojson", data: EMPTY });
        map.addSource("buffer", { type: "geojson", data: EMPTY });
        map.addSource("nearby", { type: "geojson", data: EMPTY });
        map.addSource("ripple", { type: "geojson", data: EMPTY });

        map.addLayer({ id: "water", type: "line", source: "water", paint: { "line-color": "#1e3a5f", "line-width": 2, "line-opacity": 0.7, "line-blur": 0.5 } });
        map.addLayer({ id: "road", type: "line", source: "road", paint: { "line-color": "#46586b", "line-width": 1.5, "line-opacity": 0.65, "line-dasharray": [2, 2] } });
        map.addLayer({ id: "hazard-fill", type: "fill", source: "hazard", paint: { "fill-color": FILL_RAMP, "fill-opacity": 0.22 } });
        map.addLayer({ id: "hazard-line", type: "line", source: "hazard", paint: { "line-color": FILL_RAMP, "line-width": 1.5, "line-opacity": 0.85, "line-blur": 0.3 } });
        map.addLayer({
          id: "hazard-heat",
          type: "heatmap",
          source: "hazard-heat-src",
          paint: {
            "heatmap-weight": ["get", "w"],
            "heatmap-intensity": 0.7,
            "heatmap-radius": 30,
            "heatmap-opacity": 0.7,
            "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0,0,0,0)", 0.2, "#22d3ee", 0.4, "#34d399", 0.6, "#facc15", 0.8, "#fb923c", 1, "#f43f5e"],
          },
        });
        map.addLayer({
          id: "pop-density",
          type: "circle",
          source: "pop",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "pop"], 0, 4, 55000, 24],
            "circle-color": C.site,
            "circle-opacity": 0.26,
            "circle-stroke-color": "#67e8f9",
            "circle-stroke-width": 0.5,
            "circle-stroke-opacity": 0.5,
          },
        });
        map.addLayer({
          id: "hab-clusters",
          type: "circle",
          source: "hab",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": ["interpolate", ["linear"], ["get", "point_count"], 0, "#22d3ee", 8, "#38bdf8", 20, "#6366f1", 40, "#a855f7"],
            "circle-radius": ["step", ["get", "point_count"], 16, 8, 24, 20, 32, 40, 40],
            "circle-opacity": 0.9,
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255,255,255,0.85)",
          },
        });
        map.addLayer({
          id: "hab-cluster-count",
          type: "symbol",
          source: "hab",
          filter: ["has", "point_count"],
          layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 12, "text-font": ["Open Sans Regular"], "text-allow-overlap": true },
          paint: { "text-color": "#04121f" },
        });
        map.addLayer({
          id: "hab-unclustered",
          type: "symbol",
          source: "hab",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": ["match", ["get", "bucket"], "critical", "rk-hab-critical", "high", "rk-hab-high", "moderate", "rk-hab-moderate", "low", "rk-hab-low", "safe", "rk-hab-safe", "rk-hab-moderate"],
            "icon-size": ["interpolate", ["linear"], ["get", "score"], 0, 0.52, 100, 0.95],
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          paint: {},
        });
        map.addLayer({
          id: "site",
          type: "symbol",
          source: "site",
          layout: {
            "icon-image": "rk-site",
            "icon-size": 0.85,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          paint: {},
        });
        map.addLayer({
          id: "nearby",
          type: "circle",
          source: "nearby",
          paint: { "circle-radius": 9, "circle-color": "rgba(34,211,238,0.12)", "circle-stroke-color": "#22d3ee", "circle-stroke-width": 2 },
        });
        map.addLayer({ id: "highlight-fill", type: "fill", source: "highlight", paint: { "fill-color": C.accent, "fill-opacity": 0.05 } });
        map.addLayer({ id: "highlight-line", type: "line", source: "highlight", paint: { "line-color": C.accent, "line-width": 2, "line-opacity": 0.9 } });
        map.addLayer({
          id: "buffer",
          type: "line",
          source: "buffer",
          paint: { "line-color": C.accent, "line-width": 1, "line-opacity": 0.55, "line-dasharray": [3, 3] },
        });
        map.addLayer({
          id: "distance",
          type: "line",
          source: "distance",
          paint: { "line-color": C.accent, "line-width": 2, "line-dasharray": [4, 3], "line-opacity": 0.95 },
        });
        map.addLayer({ id: "ripple", type: "line", source: "ripple", paint: { "line-color": C.accent, "line-width": 2, "line-opacity": 0.5 } });

        const setV = (id: string, on: boolean) => {
          if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
        };
        setV("hazard-fill", layers.hazard);
        setV("hazard-line", layers.hazard);
        setV("hazard-heat", layers.heatmap);
        setV("pop-density", layers.population);
        setV("hab-clusters", layers.habitations);
        setV("hab-cluster-count", layers.habitations);
        setV("hab-unclustered", layers.habitations);
        setV("site", layers.sites);
        setV("road", layers.roads);
        setV("water", layers.water);

        const showTip = (e: any, html: string) => {
          const tip = tipRef.current;
          if (!tip) return;
          tip.innerHTML = html;
          tip.style.left = `${e.point.x}px`;
          tip.style.top = `${e.point.y}px`;
          tip.style.opacity = "1";
        };
        const hideTip = () => {
          if (tipRef.current) tipRef.current.style.opacity = "0";
        };
        const cursor = (on: boolean) => (map.getCanvas().style.cursor = on ? "pointer" : "");

        map.on("mousemove", "hab-unclustered", (e: any) => {
          const p = e.features[0].properties;
          showTip(e, `<b>${p.name}</b><br>Risk ${p.score} · Pop ${Number(p.pop).toLocaleString("en-IN")}`);
          cursor(true);
        });
        map.on("mouseleave", "hab-unclustered", () => {
          hideTip();
          cursor(false);
        });
        map.on("mousemove", "site", (e: any) => {
          const p = e.features[0].properties;
          showTip(e, `<b>${p.name}</b><br>${p.type} · ${Number(p.remaining).toLocaleString("en-IN")} free`);
          cursor(true);
        });
        map.on("mouseleave", "site", () => {
          hideTip();
          cursor(false);
        });
        map.on("mousemove", "hazard-fill", (e: any) => {
          const p = e.features[0].properties;
          showTip(e, `<b>${p.name}</b><br>${p.type} · Risk Index ${p.score}`);
          cursor(false);
        });
        map.on("mouseleave", "hazard-fill", () => hideTip());
        map.on("mouseenter", "hab-clusters", () => cursor(true));
        map.on("mouseleave", "hab-clusters", () => cursor(false));

        map.on("click", "hab-unclustered", (e: any) => {
          const id = e.features[0].properties.hid as string;
          const h = habitats.find((x) => x.id === id);
          if (!h) return;
          popupRef.current?.remove();
          popupRef.current = new gl.Popup({ offset: 16, closeButton: true, className: "raksha-popup" })
            .setLngLat([h.lng, h.lat])
            .setHTML(habPopupHTML(h))
            .addTo(map);
          onSelectHabitat(id);
        });
        map.on("click", "hab-clusters", (e: any) => {
          const f = e.features[0];
          const src = map.getSource("hab") as any;
          const zc = src.getClusterExpansionZoom(f.properties.cluster_id);
          const coords = (f.geometry as any).coordinates as [number, number];
          if (zc && typeof zc.then === "function") {
            zc.then((z: number) => map.easeTo({ center: coords, zoom: z }));
          } else {
            map.easeTo({ center: coords, zoom: 7 });
          }
        });
        map.on("click", "site", (e: any) => {
          const id = e.features[0].properties.sid as string;
          const s = relocationSites.find((x) => x.id === id);
          if (!s) return;
          popupRef.current?.remove();
          popupRef.current = new gl.Popup({ offset: 16, closeButton: true, className: "raksha-popup" })
            .setLngLat([s.lng, s.lat])
            .setHTML(sitePopupHTML(s))
            .addTo(map);
          onSelectSite?.(id);
        });

        ro = new ResizeObserver(() => map.resize());
        if (containerRef.current) ro.observe(containerRef.current);
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      cancelAnim();
      popupRef.current?.remove();
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const setV = (id: string, on: boolean) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    };
    setV("hazard-fill", layers.hazard);
    setV("hazard-line", layers.hazard);
    setV("hazard-heat", layers.heatmap);
    setV("pop-density", layers.population);
    setV("hab-clusters", layers.habitations);
    setV("hab-cluster-count", layers.habitations);
    setV("hab-unclustered", layers.habitations);
    setV("site", layers.sites);
    setV("road", layers.roads);
    setV("water", layers.water);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    if (prevHab.current) {
      try {
        map.setFeatureState({ source: "hab", id: prevHab.current }, { selected: false });
      } catch {}
    }
    if (prevRec.current) {
      try {
        map.setFeatureState({ source: "site", id: prevRec.current }, { recommended: false });
      } catch {}
    }
    if (prevSite.current) {
      try {
        map.setFeatureState({ source: "site", id: prevSite.current }, { selected: false });
      } catch {}
    }
    prevHab.current = null;
    prevRec.current = null;
    prevSite.current = null;
    cancelAnim();
    map.getSource("highlight")?.setData(EMPTY);
    map.getSource("buffer")?.setData(EMPTY);
    map.getSource("nearby")?.setData(EMPTY);
    map.getSource("distance")?.setData(EMPTY);
    setDistanceInfo(null);

    if (selectedHabitatId) {
      const hab = habitats.find((h) => h.id === selectedHabitatId);
      if (!hab) return;
      const site = relocationSites.find((s) => s.name === hab.recommendedSite) || relocationSites[0];
      prevHab.current = hab.id;
      prevRec.current = site.id;
      try {
        map.setFeatureState({ source: "hab", id: hab.id }, { selected: true });
      } catch {}
      try {
        map.setFeatureState({ source: "site", id: site.id }, { recommended: true });
      } catch {}

      const focusKm = 18;
      const bufferKm = 160;
      const nearby = relocationSites
        .map((s) => ({ s, d: haversine(hab.lat, hab.lng, s.lat, s.lng) }))
        .filter((x) => x.d <= bufferKm)
        .sort((a, b) => a.d - b.d);

      map.getSource("highlight")?.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [circlePolygon(hab.lng, hab.lat, focusKm)] }, properties: {} }],
      });
      map.getSource("buffer")?.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [circlePolygon(hab.lng, hab.lat, bufferKm)] }, properties: {} }],
      });
      map.getSource("nearby")?.setData({
        type: "FeatureCollection",
        features: nearby.map((x) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [x.s.lng, x.s.lat] },
          properties: { name: x.s.name },
        })),
      });
      map.getSource("distance")?.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "LineString", coordinates: [[hab.lng, hab.lat], [site.lng, site.lat]] }, properties: {} }],
      });

      const t0 = performance.now();
      const dur = 1600;
      const loop = (now: number) => {
        const phase = ((now - t0) % dur) / dur;
        const r = focusKm * (0.5 + phase * 2.4);
        const op = 0.55 * (1 - phase);
        map.getSource("ripple")?.setData({
          type: "FeatureCollection",
          features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [circlePolygon(hab.lng, hab.lat, r)] }, properties: {} }],
        });
        try {
          map.setPaintProperty("ripple", "line-opacity", op);
        } catch {}
        try {
          map.setPaintProperty("ripple", "line-width", 2 + phase * 2.5);
        } catch {}
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

      const bounds = new glRef.current.LngLatBounds([hab.lng, hab.lat], [site.lng, site.lat]);
      map.fitBounds(bounds, { padding: { top: 90, bottom: 90, left: 90, right: 90 }, maxZoom: 8, duration: 1200 });
      setDistanceInfo({ hab: hab.name, site: site.name, km: Math.round(haversine(hab.lat, hab.lng, site.lat, site.lng)) });
      return;
    }

    if (selectedSiteId) {
      const site = relocationSites.find((s) => s.id === selectedSiteId);
      if (!site) return;
      prevSite.current = site.id;
      try {
        map.setFeatureState({ source: "site", id: site.id }, { selected: true });
      } catch {}
      map.flyTo({ center: [site.lng, site.lat], zoom: 8, duration: 900 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHabitatId, selectedSiteId, ready, habitats, relocationSites]);

  const runSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q || !mapRef.current) return;
    const hab = habitats.find((h) => h.name.toLowerCase().includes(q));
    if (hab) {
      onSelectHabitat(hab.id);
      return;
    }
    const site = relocationSites.find((s) => s.name.toLowerCase().includes(q));
    if (site) {
      mapRef.current.flyTo({ center: [site.lng, site.lat], zoom: 9, duration: 1200 });
      onSelectSite?.(site.id);
    }
  };

  const resetView = () => mapRef.current?.flyTo({ center: [82, 22.5], zoom: 4.4, duration: 1000 });

  const toggles: { key: keyof typeof layers; label: string; color: string }[] = [
    { key: "hazard", label: "Hazard Zones", color: C.accent },
    { key: "heatmap", label: "Hazard Heatmap", color: "#f43f5e" },
    { key: "population", label: "Population Density", color: C.site },
    { key: "habitations", label: "Habitats", color: "#facc15" },
    { key: "sites", label: "Relocation Sites", color: C.site },
    { key: "roads", label: "Roads", color: "#46586b" },
    { key: "water", label: "Water Bodies", color: "#1e3a5f" },
  ];

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-navy-900 xl:h-[680px]">
      <div ref={containerRef} className="absolute inset-0" />
      <div ref={tipRef} className="raksha-tip" />

      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-navy-900/70 text-xs text-slate-500">
          Loading interactive map…
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-10 w-60 max-w-[70%] space-y-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/[0.08] bg-navy-900/80 p-1.5 backdrop-blur-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search location…"
            aria-label="Search location"
            className="focus-ring h-8 w-full rounded bg-transparent pl-2 text-xs text-slate-200 placeholder:text-slate-600"
          />
          <button onClick={runSearch} className="focus-ring rounded bg-accent/20 px-2 py-1 text-[11px] font-medium text-accent hover:bg-accent/30">
            Go
          </button>
        </div>

        <div className="pointer-events-auto rounded-lg border border-white/[0.08] bg-navy-900/80 p-2 backdrop-blur-md">
          <div className="label-mono mb-1.5 px-1 text-[9px]">Layers</div>
          <div className="grid grid-cols-1 gap-1">
            {toggles.map((t) => (
              <button
                key={t.key}
                onClick={() => setLayers((l) => ({ ...l, [t.key]: !l[t.key] }))}
                className={`focus-ring flex items-center gap-2 rounded px-2 py-1 text-left text-[11px] transition-colors ${
                  layers[t.key] ? "text-slate-100" : "text-slate-500"
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${layers[t.key] ? "ring-1 ring-white/30" : "opacity-40"}`} style={{ background: t.color }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={resetView}
        className="focus-ring pointer-events-auto absolute right-3 top-[112px] z-10 rounded-lg border border-white/[0.08] bg-navy-900/80 px-2.5 py-1.5 text-[11px] text-slate-300 backdrop-blur-md transition-colors hover:text-slate-100"
      >
        Reset View
      </button>

      {distanceInfo && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-lg border border-accent/25 bg-navy-900/85 px-3 py-1.5 text-[11px] text-slate-200 backdrop-blur-md">
          <span className="text-accent">{distanceInfo.hab}</span> → <span className="text-slate-100">{distanceInfo.site}</span> ·{" "}
          <span className="font-semibold">{distanceInfo.km} km</span>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 z-10 w-52 rounded-lg border border-white/[0.08] bg-navy-900/85 p-2.5 backdrop-blur-md">
        <div className="label-mono mb-1.5 text-[9px]">Risk Thresholds</div>
        <div
          className="h-2 w-full rounded-full"
          style={{ background: "linear-gradient(90deg,#34d399 0%,#38bdf8 20%,#facc15 40%,#fb923c 60%,#f43f5e 80%,#f43f5e 100%)" }}
        />
        <div className="mt-1 flex justify-between text-[8px] text-slate-500">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </div>
        <div className="mt-2 space-y-1">
          {[["Critical", "#f43f5e", "80+"], ["High", "#fb923c", "60-79"], ["Moderate", "#facc15", "40-59"], ["Low", "#38bdf8", "20-39"], ["Safe", "#34d399", "0-19"]].map(
            ([l, c, r]) => (
              <div key={l} className="flex items-center gap-2 text-[10px] text-slate-300">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c as string }} />
                <span className="flex-1">{l}</span>
                <span className="text-slate-500">{r}</span>
              </div>
            )
          )}
          <div className="flex items-center gap-2 border-t border-white/5 pt-1 text-[10px] text-slate-300">
            <span className="hab-swatch" />
            <span className="flex-1">Habitation</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="site-swatch" />
            <span className="flex-1">Relocation Site</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md border border-white/[0.06] bg-navy-900/70 px-2 py-1 text-[9px] text-slate-500 backdrop-blur-md">
        Demonstration Dataset · not official hazard boundaries
      </div>

      <div className="pointer-events-none absolute left-3 bottom-[196px] z-10 hidden text-[9px] text-slate-600 sm:block">
        Engine: {engine === "mapbox" ? "Mapbox GL JS" : "MapLibre GL (fallback)"}
      </div>
    </div>
  );
}
