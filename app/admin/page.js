"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState("users");

  if (status === "loading") return <p className="text-slate-500">Loading…</p>;
  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        🚫 You do not have access to this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        Admin Dashboard
      </h2>
      <div className="flex flex-wrap gap-2">
        {[
          ["users", "👥 Users"],
          ["plans", "💎 Plans & Offers"],
          ["feedback", "💬 Feedback"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === k
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "users" ? <UsersTab /> : tab === "plans" ? <PlansTab /> : <FeedbackTab />}
    </div>
  );
}

function FeedbackTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/feedback");
    setItems(res.ok ? await res.json() : []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setApproved(id, approved) {
    await fetch(`/api/admin/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    load();
  }
  async function remove(id) {
    if (!confirm("Delete this feedback?")) return;
    await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-slate-500">Loading feedback…</p>;
  if (items.length === 0)
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
        No feedback yet.
      </p>
    );

  return (
    <div className="space-y-3">
      {items.map((f) => (
        <div
          key={f.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {f.name}{" "}
                <span className="text-amber-400">
                  {"⭐".repeat(Math.min(5, Math.max(1, f.rating)))}
                </span>
                {f.approved && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Published
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.message}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(f.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                onClick={() => setApproved(f.id, !f.approved)}
                className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                {f.approved ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => remove(f.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState({}); // per-user custom days input
  const [query, setQuery] = useState("");

  function dayVal(id) {
    return days[id] ?? 30;
  }

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? users
    : users.filter((u) =>
        [u.name, u.email, u.role, u.membership?.status]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    setUsers(res.ok ? await res.json() : []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function act(id, body) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }
  async function remove(id) {
    if (!confirm("Delete this user and ALL their data?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-slate-500">Loading users…</p>;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          placeholder="Search users by name, email, role or status…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <p className="text-xs text-slate-400">
        {filtered.length} / {users.length} users
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Tx</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((u) => {
              const m = u.membership;
              return (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {u.name || "—"}
                    </p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-slate-600 dark:text-slate-300">
                      {m?.status || "none"}
                    </span>
                    {m?.currentPeriodEnd && (
                      <p className="text-xs text-slate-400">
                        until {new Date(m.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u._count?.transactions ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <input
                        type="number"
                        min="1"
                        value={dayVal(u.id)}
                        onChange={(e) =>
                          setDays((d) => ({ ...d, [u.id]: e.target.value }))
                        }
                        className="w-14 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        title="Days"
                      />
                      <button
                        onClick={() => act(u.id, { grantDays: Number(dayVal(u.id)) })}
                        className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"
                        title="Grant full access for N days"
                      >
                        Grant
                      </button>
                      <button
                        onClick={() => act(u.id, { trialDays: Number(dayVal(u.id)) })}
                        className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300"
                        title="Grant a trial for N days"
                      >
                        Trial
                      </button>
                      <button
                        onClick={() => act(u.id, { unlimited: true })}
                        className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300"
                        title="Lifetime / unlimited access"
                      >
                        ∞ Unlimited
                      </button>
                      <button
                        onClick={() => act(u.id, { revoke: true })}
                        className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
                      >
                        Revoke
                      </button>
                      <button
                        onClick={() =>
                          act(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" })
                        }
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {u.role === "ADMIN" ? "Make user" : "Make admin"}
                      </button>
                      <button
                        onClick={() => remove(u.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

const emptyPlan = {
  name: "",
  description: "",
  price: "",
  currency: "usd",
  interval: "month",
  trialDays: 0,
  features: "",
  stripePriceId: "",
  isFeatured: false,
  active: true,
  sortOrder: 0,
};

function PlansTab() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyPlan);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/plans");
    setPlans(res.ok ? await res.json() : []);
  }
  useEffect(() => {
    load();
  }, []);

  function startEdit(p) {
    setEditingId(p.id);
    let feats = "";
    try {
      feats = (JSON.parse(p.features || "[]") || []).join("\n");
    } catch {
      feats = p.features || "";
    }
    setForm({
      name: p.name,
      description: p.description || "",
      price: (p.priceCents / 100).toString(),
      currency: p.currency,
      interval: p.interval,
      trialDays: p.trialDays,
      features: feats,
      stripePriceId: p.stripePriceId || "",
      isFeatured: p.isFeatured,
      active: p.active,
      sortOrder: p.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    const url = editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed");
    }
    setForm(emptyPlan);
    setEditingId(null);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {editingId ? "Edit plan / offer" : "Create plan / offer"}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input type="number" step="0.01" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input className={inputClass} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Interval</label>
            <select className={inputClass} value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })}>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Trial days</label>
            <input type="number" className={inputClass} value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Stripe Price ID</label>
            <input className={inputClass} value={form.stripePriceId} onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })} placeholder="price_..." />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>Description</label>
            <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>Features (one per line)</label>
            <textarea rows={3} className={inputClass} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
          </label>
          <div>
            <label className={labelClass}>Sort order</label>
            <input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            {editingId ? "Update plan" : "Create plan"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm(emptyPlan); setEditingId(null); }} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">{p.name}</h4>
              {!p.active && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">inactive</span>}
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {(p.priceCents / 100).toFixed(2)} {p.currency.toUpperCase()}
              <span className="text-sm font-normal text-slate-400"> / {p.interval}</span>
            </p>
            <p className="mt-2 text-xs text-slate-400">{p.stripePriceId || "no Stripe price"}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => startEdit(p)} className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10">Edit</button>
              <button onClick={() => remove(p.id)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
