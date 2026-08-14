import DocumentList from "@/features/docs/components/DocumentList";
import { DocumentListSkeleton } from "@/features/docs/components/DocumentListSkeleton";
import DocumentsHeader from "@/features/docs/components/DocumentsHeader";
import { verifySession } from "@/lib/dal/auth";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "My Documents",
  description:
    "Manage, organize, and collaborate on your documents from your personal workspace.",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function DocumentsPage() {
  await verifySession();
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl ">
        <DocumentsHeader />
        <Suspense fallback={<DocumentListSkeleton />}>
          <DocumentList />
        </Suspense>
      </div>
    </main>
  );
}
