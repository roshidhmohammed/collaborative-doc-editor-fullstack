import CreateDocument from "@/features/docs/components/CreateDocuments";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a New Document",
  description:
    "Create a new document and start writing, editing, and collaborating with your team.",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function CreateDocumentPage() {
  return (
    <div className="h-full bg-slate-900">
      <CreateDocument />
    </div>
      );
}
