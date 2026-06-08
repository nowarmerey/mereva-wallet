// Generates PWA PNG icons from the brand mark. Run: node scripts/gen-icons.js
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

// Full-bleed square (maskable-safe): red background + white italic "M".
function svg(size) {
  const fs2 = Math.round(size * 0.62);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#E30613"/>
    <text x="50%" y="50%" dy="0.34em" text-anchor="middle" fill="#ffffff"
      font-family="Georgia, 'Times New Roman', serif" font-size="${fs2}"
      font-style="italic" font-weight="700">M</text>
  </svg>`;
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["maskable-512.png", 512],
  ["apple-touch-icon.png", 180],
];

for (const [name, size] of targets) {
  const resvg = new Resvg(svg(size), { fitTo: { mode: "width", value: size } });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(outDir, name), png);
  console.log("wrote", name, size + "px");
}
console.log("✅ icons generated in public/icons");
