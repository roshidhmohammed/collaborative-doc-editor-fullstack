import Link from "next/link";
import { FilePlus2 } from "lucide-react";

import { PAGEROUTES } from "@/shared/constants/apiRoutes";

const CreateDocumentCard = async (props: React.HTMLAttributes<HTMLElement> = {}) => {
  return (
    <Link
      href={PAGEROUTES.CREATE_DOCUMENT}
      data-testid={(props as Record<string, string> | undefined)?.["data-testid"] ?? "create-document-card"}
      className="group flex min-h-57.5 flex-col justify-between rounded-3xl border border-dashed border-cyan-400/30 bg-slate-900/60 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)] transition hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-900/80"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
        <FilePlus2 className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white">
          Create new document
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Start a fresh document with a topic and invite collaborators
          instantly.
        </p>
      </div>
    </Link>
  );
};

export default CreateDocumentCard;
