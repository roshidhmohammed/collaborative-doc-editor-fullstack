import DocumentsEditorHeader from "@/features/docEditor/components/DocumentsEditorHeader";
import Editor from "@/features/docEditor/components/Editor";
import CollaboratorList from "@/features/collaborators/components/CollaboratorList";
import { getCookies } from "@/lib/auth/session";
import { verifySession } from "@/lib/dal/auth";
import { assignCollaborator } from "@/features/collaborators/services/assign-collaborator";
import { getDocumentById } from "@/features/docs/services/get-document";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DocumentPageProps } from "@/features/docs";

export async function generateMetadata({
  params,
}: DocumentPageProps): Promise<Metadata> {
  const { id: documentId } = await params;

  const document = await getDocumentById(documentId);

  if (!document) {
    return {
      title: "Document Not Found",
      description: "The requested document could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${document.name} | Online Document Editor`,
    description: `Edit and collaborate on "${document.name}" in real time with your team using our online document editor.`,

    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function DocumentPage({
  params,
}: {
  params: { id: string; documentToken: string };
}) {
  const { id: documentId, documentToken } = await params;
  const token = await getCookies();
  const session = await verifySession();

  if (!documentId || !documentToken) {
    notFound();
  }

  await assignCollaborator(documentId, session, documentToken);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DocumentsEditorHeader
          documentId={documentId}
          documentToken={documentToken}
        />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.6fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Editor</h2>
                <p className="text-sm text-slate-400">
                  Collaborate and write in real time.
                </p>
              </div>
            </div>

            <div className="min-h-105 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-slate-200 prose prose-invert max-w-none">
              <Editor
                userToken={token}
                documentId={documentId}
                documentToken={documentToken}
              />
            </div>
          </div>
          <CollaboratorList documentId={documentId} session={session} />
        </div>
      </div>
    </main>
  );
}
