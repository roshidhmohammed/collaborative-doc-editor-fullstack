import Link from "next/link";
import CreateDocumentCard from "./CreateDocumentCard";
import DocumentCard from "./DocumentCard";
import { getAllDocuments } from "@/features/docs/services/get-all-documents";

const DocumentList = async () => {
  const items = await getAllDocuments();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <CreateDocumentCard data-testid="create-document-card" />
      {items?.length === 0 && (
        <p className="flex min-h-57.5 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
          No documents yet. Create your first one to get started.
        </p>
      )}
      {items?.map((document, index) => (
        <Link
          href={`/documents/${document?.id}/${document.associatedRoleToken}`}
          key={document.id ?? document.id ?? `${document.name}-${index}`}
        >
          <DocumentCard data-testid="document-card" document={document} />
        </Link>
      ))}
    </div>
  );
};

export default DocumentList;
