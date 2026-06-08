"use client";

import { formatMoney } from "@/lib/format";

const COLORS = [
  "from-indigo-400/40 to-indigo-500/20 border-indigo-300/50",
  "from-emerald-400/40 to-emerald-500/20 border-emerald-300/50",
  "from-sky-400/40 to-sky-500/20 border-sky-300/50",
  "from-violet-400/40 to-violet-500/20 border-violet-300/50",
  "from-amber-400/40 to-amber-500/20 border-amber-300/50",
  "from-rose-400/40 to-rose-500/20 border-rose-300/50",
];

// Floating, translucent "water bubbles" with the user's most common amounts.
// Tap a bubble to fill the amount field.
export default function AmountBubbles({ amounts, currency, onPick }) {
  if (!amounts || amounts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-full z-20 mb-2 h-24">
      <div className="relative h-full">
        {amounts.map((amt, i) => {
          const left = 4 + (i * 92) / Math.max(1, amounts.length - 1 || 1);
          const size = 58 + ((i * 7) % 18); // 58–76px
          return (
            <button
              type="button"
              key={`${amt}-${i}`}
              onClick={() => onPick(amt)}
              style={{
                left: `${Math.min(left, 88)}%`,
                width: size,
                height: size,
                animationDelay: `${(i % 6) * 0.5}s`,
                animationDuration: `${3.5 + (i % 3)}s`,
              }}
              className={`animate-bubble pointer-events-auto absolute bottom-0 flex -translate-x-1/2 items-center justify-center rounded-full border bg-gradient-to-br ${COLORS[i % COLORS.length]} text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:scale-110 dark:text-white`}
              title="Use this amount"
            >
              {formatMoney(amt, currency).replace(/\.00$/, "")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
