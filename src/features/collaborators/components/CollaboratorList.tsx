"use client";

import { Users, Crown } from "lucide-react";
import { useDocumentEditorStore } from "@/store/document-editor";

const CollaboratorList = ({
  documentId,
  session,
}: {
  documentId: string;
  session: string | undefined;
}) => {
  const collaborators = useDocumentEditorStore((state) => state.collaborators);

  console.log(collaborators)

  return (
    <aside
      className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
      data-testid="collaborator-list"
    >
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Collaborators</h3>
      </div>

      <div className="mt-4 space-y-3">
        {collaborators.length === 0 && (
          <p className="text-sm text-slate-400">No collaborators yet.</p>
        )}

        {collaborators.map((person) => (
          <div
            key={person.user.id}
            data-testid={`collaborator-row-${person.user.email}`}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 font-semibold text-white">
                {person.user.fullName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">
                    {session?.userId === person.user.id
                      ? "You"
                      : person.user.fullName}
                  </p>

                  {person.isCreator && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      <Crown size={12} />
                      Owner
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-400">{person.user.email}</p>

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {person.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  person.onlineStatus === "online"
                    ? "bg-emerald-500"
                    : "bg-slate-500"
                }`}
              />

              <span
                data-testid={`collaborator-status-${person.user.email}`}
                className={`text-sm ${
                  person.onlineStatus === "online"
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {person.onlineStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CollaboratorList;
