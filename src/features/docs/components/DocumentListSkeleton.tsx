const DocumentCardSkeleton = () => {
  return (
    <article data-testid="document-card-skeleton" className="animate-pulse flex min-h-57.5 flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      <div>
        {/* Accent bar */}
        <div data-testid="skeleton-accent" className="mb-5 h-2.5 w-16 rounded-full bg-slate-700" />

        {/* Title */}
        <div data-testid="skeleton-title" className="h-6 w-3/4 rounded bg-slate-700" />
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        {/* Collaborator badge */}
        <div   data-testid="skeleton-collaborator" className="h-8 w-24 rounded-full bg-slate-700" />
      </div>
    </article>
  );
};

export const DocumentListSkeleton = () => {
  return (
    <div  data-testid="document-list-skeleton" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <DocumentCardSkeleton key={index} />
      ))}
    </div>
  );
};
