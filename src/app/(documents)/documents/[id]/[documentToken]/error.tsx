"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />

        <div className="absolute left-[10%] top-[20%] h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="absolute bottom-[10%] right-[10%] h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Error icon */}
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/10 bg-red-400/5 shadow-2xl backdrop-blur-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-10 w-10 text-red-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.008v.008H12V16.5Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>
        </div>

        {/* Heading */}
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
          Something went wrong
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          We hit a little snag
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-400">
          Something unexpected happened while loading this document. Don&apos;t
          worry — your work should be safe.
        </p>

        {/* Error message */}
        {error.message && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left backdrop-blur-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              Error details
            </p>

            <p className="break-words text-sm leading-6 text-slate-400">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
              />
            </svg>
            Try again
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/documents";
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            Back to documents
          </button>
        </div>

        {/* Status */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          <span>Unexpected application error</span>
        </div>

        {/* Optional digest for debugging */}
        {error.digest && (
          <p className="mt-3 text-[11px] text-slate-600">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
