import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute left-[10%] top-[20%] h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-[10%] right-[10%] h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg text-center">
        {/* 404 */}
        <div className="mb-8">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-[120px] font-black leading-none tracking-tighter text-transparent sm:text-[160px]">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-8 w-8 text-slate-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A3.375 3.375 0 0 1 11.25 4.875v-1.5A3.375 3.375 0 0 0 7.875 0H6.75"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 21h7.5A2.25 2.25 0 0 0 18 18.75V6.621a2.25 2.25 0 0 0-.659-1.591l-2.871-2.871A2.25 2.25 0 0 0 12.879 1.5H6.75A2.25 2.25 0 0 0 4.5 3.75v15A2.25 2.25 0 0 0 6.75 21H8.25Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 12.75h7.5M8.25 16.5h5.25"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Document not found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-400">
          The document you&apos;re looking for doesn&apos;t exist, has been
          removed, or you may not have permission to access it.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/documents"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to documents
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            Go to homepage
          </Link>
        </div>

        {/* Small status */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Everything else is working normally</span>
        </div>
      </div>
    </main>
  );
}
