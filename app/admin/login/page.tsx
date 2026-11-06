"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed."); return; }
      router.replace("/admin/registrations"); router.refresh();
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f3f8ff] px-4 py-10">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#d6e3f3] border-t-8 border-t-[#ffd60a] bg-white p-7 shadow-xl">
      <p className="text-sm font-bold uppercase tracking-widest text-[#0a4da3]">Xittoo Sewa</p>
      <h1 className="mt-2 text-2xl font-bold text-[#052f6b]">Admin sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to manage training registrations.</p>
      <label className="mt-6 block text-sm font-semibold text-slate-700">Username</label>
      <input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" required className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-black outline-none focus:border-blue-600" />
      <label className="mt-4 block text-sm font-semibold text-slate-700">Password</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-black outline-none focus:border-blue-600" />
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="mt-6 h-11 w-full rounded-lg bg-[#0a4da3] font-semibold text-white hover:bg-[#052f6b] disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  </main>;
}
