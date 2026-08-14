export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading documents"
      className="relative min-h-screen overflow-hidden bg-slate-950 px-6"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute left-[10%] top-[20%] h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-[10%] right-[10%] h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl py-8">
        {/* Header skeleton */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded-md bg-slate-950/10" />

            <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-950/10 sm:w-80" />

            <div className="h-4 w-72 animate-pulse rounded-md bg-slate-950/5 sm:w-96" />
          </div>

          <div className="h-11 w-36 animate-pulse rounded-xl bg-slate-950/10" />
        </div>

        {/* Search / filter skeleton */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="h-11 flex-1 animate-pulse rounded-xl border border-slate-950/5 bg-slate-950/5" />

          <div className="h-11 w-full animate-pulse rounded-xl border border-slate-950/5 bg-slate-950/5 sm:w-32" />
        </div>
      </div>
    </main>
  );
}
