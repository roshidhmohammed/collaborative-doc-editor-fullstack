"use client";

import Button from "@/shared/components/Button";
import FormField from "@/shared/components/FormField";
import Input from "@/shared/components/Input";
import { createDocumentState } from "@/shared/types/actions";
import { createDocument } from "@/features/docs/actions/create-document";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const initialState: createDocumentState = {
  message: "",
  errors: "",
};

const CreateDocument = () => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createDocument,
    initialState,
  );
  useEffect(() => {
    if (state && state?.success) {
      toast.success(state.message);
      router.push(
        `/documents/${state.docDetails?.document.id}/${state.docDetails?.ownerToken}`,
      );
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <p  className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            New document
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Create your next idea
          </h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Start with a topic and build your collaborative document from there.
          </p>
        </div>

        <form action={formAction} className="w-full space-y-6">
          <FormField
            label="Enter the Topic (topic to create a document)"
            htmlFor="title"
            required
          >
            <Input
              type="text"
              name="title"
              id="title"
              required
              placeholder="e.g. Product launch plan"
              error={
                typeof state?.errors !== "string"
                  ? state?.errors?.title?.[0]
                  : undefined
              }
              className="border-slate-700 bg-slate-900/80 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-0"
            />
          </FormField>

          <div className="flex justify-center">
            <Button
              type="submit"
              loading={isPending}
              className="mx-auto w-auto rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDocument;
