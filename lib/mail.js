// Email helper. Uses Resend's REST API when RESEND_API_KEY is set; otherwise
// logs the email to the server console (handy in development).
const FROM = process.env.EMAIL_FROM || "Mereva Wallet <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[mail:dev] To: ${to}\n[mail:dev] Subject: ${subject}\n[mail:dev] (set RESEND_API_KEY to send for real)\n`);
    return { ok: true, dev: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("sendEmail failed:", e);
    return { ok: false };
  }
}

// Simple branded HTML wrapper.
export function emailLayout(title, bodyHtml, cta) {
  const button = cta
    ? `<a href="${cta.url}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;margin-top:12px">${cta.label}</a>`
    : "";
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;background:#f1f5f9;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#E30613;color:#fff;padding:18px 24px;font-weight:700;font-size:18px">Mereva Wallet</div>
      <div style="padding:24px;color:#334155;line-height:1.6">
        <h2 style="margin:0 0 12px;color:#0f172a">${title}</h2>
        ${bodyHtml}
        ${button}
      </div>
      <div style="padding:14px 24px;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0">© ${new Date().getFullYear()} Mereva Wallet</div>
    </div>
  </div>`;
}
