"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Registration = {
  id: number;
  registrationNo: string;
  fullName: string;
  phone: string;
  email: string | null;
  district: string;
  municipality: string;
  training: string;
  status: string;
  createdAt: string;
};

type RegistrationDetail = Registration & {
  age: number;
  gender: string;
  province: string;
  address: string | null;
  education: string;
  hasExperience: boolean;
  experienceNote: string | null;
};

const statusOptions = ["PENDING", "SHORTLISTED", "SELECTED", "REJECTED"];
const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  SHORTLISTED: "Shortlisted",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

const inputClass =
  "h-10 rounded-lg border border-[#c8d7e9] bg-[#f9fcff] px-3 text-sm text-[#0c1b33] outline-none focus:border-[#0a4da3]";

export default function RegistrationsDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<RegistrationDetail | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/registrations?q=${encodeURIComponent(search)}&status=${filter}`,
        { cache: "no-store" },
      );
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("Unable to load registrations.");
      setRegistrations(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const timer = setTimeout(() => void loadRegistrations(), 250);
    return () => clearTimeout(timer);
  }, [loadRegistrations]);

  async function viewRegistration(id: number) {
    setError("");
    const response = await fetch(`/api/admin/registrations/${id}`, {
      cache: "no-store",
    });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!response.ok) {
      setError("Unable to load registration details.");
      return;
    }
    setSelected(await response.json());
  }

  async function updateStatus(status: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/registrations/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Status update failed.");

      setSelected({ ...selected, status: data.status });
      setRegistrations((items) =>
        items.map((item) =>
          item.id === selected.id ? { ...item, status: data.status } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Xittoo Sewa Logo"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#052f6b]">Applicants</h1>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-[#c8d7e9] bg-white px-3 py-2 text-sm font-semibold text-[#173c70] hover:bg-blue-50"
          >
            Logout
          </button>
        </header>

        <section className="rounded-xl border border-[#d6e3f3] border-t-4 border-t-[#ffd60a] bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone or registration no."
              className={`${inputClass} flex-1`}
            />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={inputClass}
            >
              <option value="ALL">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-[#d6e3f3] bg-[#f5f9ff] text-xs text-[#52647f]">
                <tr>
                  <th className="px-3 py-3 font-semibold">Reg. No.</th>
                  <th className="px-3 py-3 font-semibold">Applicant</th>
                  <th className="px-3 py-3 font-semibold">Phone</th>
                  <th className="px-3 py-3 font-semibold">Location</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f8]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  registrations.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f9fcff]">
                      <td className="px-3 py-3 font-semibold text-[#0a4da3]">
                        {item.registrationNo}
                      </td>
                      <td className="px-3 py-3 font-medium text-[#173c70]">
                        {item.fullName}
                      </td>
                      <td className="px-3 py-3">
                        <a
                          href={`tel:${item.phone}`}
                          className="text-[#0a4da3] hover:underline"
                        >
                          {item.phone}
                        </a>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {item.municipality}, {item.district}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-[#eaf4ff] px-2.5 py-1 text-xs font-medium text-[#0a4da3]">
                          {statusLabel[item.status] || item.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => void viewRegistration(item.id)}
                          className="font-semibold text-[#0a4da3] hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-3"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section className="my-4 w-full max-w-xl rounded-xl border-t-4 border-t-[#ffd60a] bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#e5edf7] px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-[#0a4da3]">
                  {selected.registrationNo}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#052f6b]">
                  {selected.fullName}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-4 sm:grid-cols-2">
              {(
                [
                  ["Phone", selected.phone],
                  ["Email", selected.email || "Not provided"],
                  ["Age", String(selected.age)],
                  ["Gender", selected.gender],
                  ["Province", selected.province],
                  ["District", selected.district],
                  ["Municipality", selected.municipality],
                  ["Address", selected.address || "Not provided"],
                  ["Education", selected.education],
                  ["Training", selected.training.replaceAll("_", " ")],
                  ["Experience", selected.hasExperience ? "Yes" : "No"],
                  [
                    "Experience details",
                    selected.experienceNote || "Not provided",
                  ],
                ] as [string, string][]
              ).map(([title, value]) => (
                <div key={title}>
                  <p className="text-xs text-slate-500">{title}</p>
                  <p className="mt-1 break-words text-sm font-medium text-[#173c70]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e5edf7] px-5 py-4">
              <label className="mb-2 block text-sm font-semibold text-[#173c70]">
                Registration Status
              </label>
              <select
                value={selected.status}
                disabled={saving}
                onChange={(event) => void updateStatus(event.target.value)}
                className={`${inputClass} w-full sm:max-w-xs`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
              <div className="mt-4 flex gap-2">
                <a
                  href={`tel:${selected.phone}`}
                  className="rounded-lg bg-[#0a4da3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#052f6b]"
                >
                  Call
                </a>
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Xittoo Sewa Registration ${selected.registrationNo}`)}`}
                    className="rounded-lg border border-[#0a4da3] px-4 py-2 text-sm font-semibold text-[#0a4da3] hover:bg-[#f5f9ff]"
                  >
                    Email
                  </a>
                )}
              </div>
              {saving && (
                <p className="mt-2 text-xs text-slate-500">Saving...</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
