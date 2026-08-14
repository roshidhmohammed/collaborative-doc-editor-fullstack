import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <section className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Real-Time Collaborative Document Editor
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Real-Time Collaborative Document Editor
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Create, edit, and collaborate on documents in real time with your
            team.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 px-6 py-4 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Register
          </Link>
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-300 sm:grid-cols-3">
          <div>
            <h2>Secure Document Sharing</h2>
            <p>
              Share documents with collaborators while maintaining control over
              access and permissions.
            </p>
          </div>
          <div>
            <h2>Collaborative Team Workspace</h2>

            <p>
              Organize documents, invite collaborators, and keep your team
              synchronized in one workspace.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Team productivity
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Organize documents, invite collaborators, and stay in sync across
              your team.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
