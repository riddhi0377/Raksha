import { motion } from "framer-motion";

export function Gauge({
  value,
  size = 132,
  label,
  caption,
  tone = "accent",
}: {
  value: number;
  size?: number;
  label?: string;
  caption?: string;
  tone?: "accent" | "critical" | "high" | "moderate" | "low" | "ok";
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color: Record<string, string> = {
    accent: "#38bdf8",
    critical: "#f43f5e",
    high: "#fb923c",
    moderate: "#facc15",
    low: "#34d399",
    ok: "#34d399",
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color[tone]}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-slate-50">{value}</span>
          {label && <span className="label-mono mt-0.5 text-[9px]">{label}</span>}
        </div>
      </div>
      {caption && <p className="mt-2 text-xs text-slate-400">{caption}</p>}
    </div>
  );
}
