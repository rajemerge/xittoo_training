export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f9ff] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 h-8 w-64 animate-pulse rounded bg-blue-100" />

        <div className="rounded-xl border border-[#d6e3f3] bg-white p-4">
          <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-slate-100" />

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}