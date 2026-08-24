import { useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL = 4000;

const bgV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

const ambientV: Variants = {
  show: {
    scale: [1, 1.06, 1],
    rotate: [0, 1.2, 0],
    transition: { duration: 9, repeat: Infinity, ease: "easeInOut" },
  },
};

const ringsV: Variants = {
  show: {
    opacity: [0, 1],
    transition: { duration: 1, delay: 0.3, ease: "easeOut" },
  },
};

const shieldV: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 18 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.4 } },
};

const glowV: Variants = {
  show: {
    opacity: [0.3, 0.75, 0.3],
    scale: [1, 1.12, 1],
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1 },
  },
};

const lettersWrapV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.085, delayChildren: 1.1 } },
};

const letterV: Variants = {
  hidden: { opacity: 0, y: 26, rotateX: -90, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

const subV: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, delay: 2.2, ease: EASE } },
};

const tagV: Variants = {
  hidden: { opacity: 0, y: 10, letterSpacing: "0.1em" },
  show: { opacity: 1, y: 0, letterSpacing: "0.42em", transition: { duration: 0.6, delay: 3.0, ease: EASE } },
};

const RAKSHA = ["R", "A", "K", "S", "H", "A"];

function ShieldLogo() {
  return (
    <svg width="78" height="90" viewBox="0 0 78 90" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M39 4 L71 17 V45 C71 67 57 79 39 86 C21 79 7 67 7 45 V17 Z"
        fill="rgba(10,18,34,0.92)"
        stroke="url(#sg)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="39" cy="45" r="6.5" fill="#22d3ee" />
      <circle cx="39" cy="45" r="13.5" stroke="rgba(34,211,238,0.5)" strokeWidth="1.4" fill="none" />
      <circle cx="39" cy="45" r="20.5" stroke="rgba(34,211,238,0.22)" strokeWidth="1.4" fill="none" />
      <path d="M39 21 V69 M15 45 H63" stroke="rgba(34,211,238,0.16)" strokeWidth="1" />
    </svg>
  );
}

export function StartupIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, TOTAL);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] overflow-hidden bg-[#05070d]"
        initial={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.12 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <motion.div className="absolute inset-0" variants={bgV} initial="hidden" animate="show">
          <motion.div className="absolute inset-0" variants={ambientV} initial="hidden" animate="show">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <pattern id="introGrid" width="46" height="46" patternUnits="userSpaceOnUse">
                  <path d="M46 0H0V46" fill="none" stroke="rgba(120,160,200,0.06)" strokeWidth="1" />
                </pattern>
                <radialGradient id="introVig" cx="50%" cy="44%" r="75%">
                  <stop offset="0%" stopColor="#0a1124" />
                  <stop offset="100%" stopColor="#05070d" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#introVig)" />
              <rect width="100%" height="100%" fill="url(#introGrid)" />
              <motion.g
                stroke="rgba(56,189,248,0.10)"
                fill="none"
                variants={ringsV}
                initial="hidden"
                animate="show"
              >
                <circle cx="50%" cy="44%" r="190" />
                <circle cx="50%" cy="44%" r="330" />
                <circle cx="50%" cy="44%" r="470" />
              </motion.g>
              <path
                d="M-40 120 C 220 60, 360 220, 760 140"
                fill="none"
                stroke="rgba(56,189,248,0.06)"
                strokeWidth="1"
              />
              <path
                d="M-20 640 C 260 700, 520 520, 820 660"
                fill="none"
                stroke="rgba(56,189,248,0.05)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
          style={{ top: "50%" }}
          initial={{ y: -360, opacity: 0 }}
          animate={{ y: [-360, 360], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: 1.2, delay: 2.3, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border border-cyan-400/25"
              style={{ boxShadow: "0 0 30px rgba(34,211,238,0.15)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[-12px] rounded-full border border-dashed border-cyan-400/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[-4px] rounded-full bg-cyan-400/10 blur-md"
              variants={glowV}
              initial="hidden"
              animate="show"
            />
            <motion.div
              variants={shieldV}
              initial="hidden"
              animate="show"
              className="drop-shadow-[0_0_28px_rgba(34,211,238,0.35)]"
            >
              <ShieldLogo />
            </motion.div>
          </div>

          <motion.h1
            variants={lettersWrapV}
            initial="hidden"
            animate="show"
            className="mt-8 flex text-[44px] font-semibold tracking-[0.18em] text-slate-50"
            style={{ perspective: 600, textShadow: "0 0 40px rgba(56,189,248,0.25)" }}
          >
            {RAKSHA.map((ch, i) => (
              <motion.span key={i} variants={letterV} className="inline-block">
                {ch}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={subV}
            initial="hidden"
            animate="show"
            className="mt-4 max-w-[520px] px-6 text-[13px] font-light leading-relaxed text-slate-400"
          >
            Risk Assessment &amp; Knowledge System for Hazard Analysis
          </motion.p>

          <motion.p
            variants={tagV}
            initial="hidden"
            animate="show"
            className="mt-5 text-[11px] font-medium uppercase text-accent"
          >
            Hazard Command System
          </motion.p>

          <motion.div
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-cyan-400/0 via-cyan-300 to-cyan-400/0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: TOTAL / 1000, ease: "linear", delay: 0.2 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
