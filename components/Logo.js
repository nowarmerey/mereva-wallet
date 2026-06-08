"use client";

// Mereva Wallet brand mark. Replace /public/logo.png and app/icon.svg with the
// official asset for pixel-perfect branding; this SVG is a faithful stand-in.
export function LogoMark({ size = 32, className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="12" fill="#E30613" />
      <text
        x="32"
        y="47"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="46"
        fontStyle="italic"
        fontWeight="700"
      >
        M
      </text>
    </svg>
  );
}

export default function Logo({ size = 28, withText = true, className = "" }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {withText && (
        <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Mereva <span className="text-[#E30613]">Wallet</span>
        </span>
      )}
    </span>
  );
}
