"use client";

import { formatMoney } from "@/lib/format";

const COLORS = [
  "from-indigo-400/50 to-indigo-600/30 border-indigo-300/60",
  "from-emerald-400/50 to-emerald-600/30 border-emerald-300/60",
  "from-sky-400/50 to-sky-600/30 border-sky-300/60",
  "from-violet-400/50 to-violet-600/30 border-violet-300/60",
  "from-amber-400/50 to-amber-600/30 border-amber-300/60",
  "from-rose-400/50 to-rose-600/30 border-rose-300/60",
];

// Fixed slots in the gutters AROUND the centered modal (no overlap, full screen).
const SLOTS = [
  { left: "11%", top: "26%" },
  { left: "15%", top: "52%" },
  { left: "10%", top: "76%" },
  { right: "11%", top: "26%" },
  { right: "15%", top: "52%" },
  { right: "10%", top: "76%" },
];
const SIZES = [88, 80, 74, 84, 78, 72];

// Floating, translucent "water bubbles" of the user's most common amounts,
// drifting around the Add-Transaction dialog. Tap one to fill the amount.
export default function AmountBubbles({ amounts, currency, onPick }) {
  if (!amounts || amounts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden sm:block">
      {amounts.slice(0, 6).map((amt, i) => {
        const slot = SLOTS[i];
        const size = SIZES[i] || 70;
        return (
          <button
            type="button"
            key={`${amt}-${i}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onPick(amt);
            }}
            style={{
              ...slot,
              width: size,
              height: size,
              animationDelay: `${(i % 6) * 0.6}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
            className={`animate-float pointer-events-auto absolute flex items-center justify-center rounded-full border bg-gradient-to-br ${COLORS[i % COLORS.length]} text-xs font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-110`}
            title="Use this amount"
          >
            {formatMoney(amt, currency).replace(/[.,]00$/, "")}
          </button>
        );
      })}
    </div>
  );
}
