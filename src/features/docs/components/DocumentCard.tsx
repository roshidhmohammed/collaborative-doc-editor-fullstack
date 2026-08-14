import type { DocumentCardProps } from "../types/docs";

const DocumentCard = ({ document }: DocumentCardProps) => {
  const collaboratorCount = Array.isArray(document?.collaborators)
    ? document.collaborators.length
    : (document?.collaborators ?? 0);

  return (
    <article
      data-testid="document-card"
      className="flex min-h-57.5 flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl"
    >
      <div>
        <div className="mb-5 h-2.5 w-16 rounded-full bg-cyan-400/60" />
        <h3 className="text-lg font-semibold text-white">{document.name}</h3>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-300">
        <span className="rounded-full bg-slate-800 px-3 py-1">
          {collaboratorCount} collab
        </span>
      </div>
    </article>
  );
};

export default DocumentCard;
