"use client";

import { useEffect, useState } from "react";
import * as Y from "yjs";

import { getSocket, disconnectSocket } from "@/lib/realtime-updates/socket";

import {
  clearAllYjsDocuments,
  loadYjsUpdates,
  saveYjsUpdate,
} from "@/lib/browser-storage/yjs-indexdb";

import TiptapEditor from "./TiptapEditor";
import { useDocumentEditorStore } from "@/store/document-editor";
import {
  BinaryValue,
  CollaboratorsResponse,
  EditorProps,
} from "../types/docEditor";
import { toUint8Array } from "../utils/toUint8Array";

export default function Editor({
  userToken,
  documentId,
  documentToken,
}: EditorProps) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const { setCollaborators, removeCollaborator } = useDocumentEditorStore(
    (state) => state,
  );

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const document = new Y.Doc();
    const socket = getSocket(userToken);

    async function initialize() {
      try {
        const localUpdates = await loadYjsUpdates(documentId);

        for (const update of localUpdates) {
          Y.applyUpdate(document, update, "idb");
        }

        if (cancelled) {
          document.destroy();
          return;
        }

        const handleConnect = () => {
          if (cancelled) {
            return;
          }

          setConnectionStatus("connected");

          socket.emit("document:join", documentId);
          socket.emit(
            "collaborator:online-status",
            documentId,
            (response: CollaboratorsResponse) => {
              setCollaborators(response.data);
            },
          );
          socket.on("collaborator:presence", (users) => {
            setCollaborators(users);
          });
        };

        const handleConnectError = (error: Error) => {
          console.error("Socket connection error:", error.message);
          if (!cancelled) {
            setConnectionStatus("error");
          }
        };

        const handleDisconnect = () => {
          if (!cancelled) {
            setConnectionStatus("disconnected");
          }
          removeCollaborator();
        };

        const handleDocumentLoad = (state: BinaryValue) => {
          if (cancelled) {
            return;
          }

          const binaryState = toUint8Array(state);

          Y.applyUpdate(document, binaryState, "remote");
        };

        const handleRemoteDocumentUpdate = (content: BinaryValue) => {
          if (cancelled) {
            return;
          }

          const binaryUpdate = toUint8Array(content);

          Y.applyUpdate(document, binaryUpdate, "remote");
        };

        const handleLocalDocumentUpdate = async (
          update: Uint8Array,
          origin: unknown,
        ) => {
          if (cancelled) {
            return;
          }

          if (origin === "idb" || origin === "remote") {
            return;
          }

          try {
            await saveYjsUpdate(documentId, update);

            if (cancelled) {
              return;
            }

            socket.emit(
              "document:update",
              {
                documentId,
                content: update,
              },
              (response: {
                success: boolean;
                data?: {
                  id: string;
                };
                error?: string;
              }) => {
                if (!response?.success) {
                  console.error(
                    "Document update was rejected:",
                    response?.error,
                  );
                }
              },
            );
          } catch (error) {
            console.error("Failed to save or send document update:", error);
          }
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);
        socket.on("document:load", handleDocumentLoad);
        socket.on("document:update", handleRemoteDocumentUpdate);

        document.on("update", handleLocalDocumentUpdate);

        cleanup = () => {
          socket.off("connect", handleConnect);
          socket.off("connect_error", handleConnectError);
          socket.off("disconnect", handleDisconnect);
          socket.off("document:load", handleDocumentLoad);
          socket.off("document:update", handleRemoteDocumentUpdate);
          clearAllYjsDocuments();

          document.off("update", handleLocalDocumentUpdate);

          socket.emit("document:leave", documentId);
          // Drop the socket so presence updates to offline for other collaborators.
          disconnectSocket();

          document.destroy();
        };

        if (cancelled) {
          cleanup();
          return;
        }

        setYdoc(document);
        setIsReady(true);

        if (socket.connected) {
          handleConnect();
        } else {
          socket.connect();
        }
      } catch (error) {
        console.error("Failed to initialize collaborative document:", error);

        if (!cancelled) {
          setConnectionStatus("error");
        }

        document.destroy();
      }
    }

    initialize();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [documentId, userToken]);

  if (!isReady || !ydoc) {
    return (
      <div className="rounded-xl bg-white p-5 text-slate-500">
        Loading collaborative document...
      </div>
    );
  }

  return (
    <TiptapEditor
      ydoc={ydoc}
      connectionStatus={connectionStatus}
      documentToken={documentToken}
    />
  );
}
