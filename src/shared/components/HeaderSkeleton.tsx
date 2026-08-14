export function HeaderSkeleton() {
  return (
    <header className="h-16 border-b border-slate-200 bg-slate-950">
      <div className="mx-auto flex h-full items-center justify-between px-6">
        <div className="h-8 w-32 animate-pulse rounded-md bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-800" />
          <div className="h-8 w-24 animate-pulse rounded-md bg-slate-800" />
        </div>
      </div>
    </header>
  );
}