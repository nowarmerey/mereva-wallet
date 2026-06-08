"use client";

// Catches errors in the root layout itself. Must render <html>/<body>.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0f172a", color: "#e2e8f0", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <h2 style={{ margin: "12px 0 8px" }}>Something went wrong</h2>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Please try again.</p>
            <button
              onClick={() => reset()}
              style={{ marginTop: 16, background: "#6366f1", color: "#fff", border: 0, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
