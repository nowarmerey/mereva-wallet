// Next.js App Router web app manifest -> served at /manifest.webmanifest
export default function manifest() {
  return {
    name: "Mereva Wallet",
    short_name: "Mereva",
    description: "Personal expense manager — track money, budgets and goals.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#E30613",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
