"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import * as Y from "yjs";

import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Collaboration from "@tiptap/extension-collaboration";

import Menubar from "./Menubar";
import {
  selectCanEditDocument,
  useFetchDocumentDetails,
} from "../hooks/useFetchDocumentDetails";
import { useEffect } from "react";

type TiptapEditorProps = {
  ydoc: Y.Doc;
  connectionStatus: string;
  documentToken: string;
};

function TiptapEditor({
  ydoc,
  connectionStatus,
  documentToken,
}: TiptapEditorProps) {
  const { data: canEdit = false } = useFetchDocumentDetails(documentToken, {
    select: selectCanEditDocument,
  });

  const editor = useEditor({
    immediatelyRender: false,
    editable: canEdit,
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),

      Collaboration.configure({
        document: ydoc,
        field: "default",
      }),

      Highlight,

      Typography,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    // editorProps: {
    //   attributes: {
    //     class:
    //       "min-h-[420px] rounded-xl bg-white p-5 text-slate-900 outline-none",
    //   },
    // },
  });

  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [editor, canEdit]);

  if (!editor) {
    return (
      <div className="rounded-xl bg-white p-5 text-slate-500">
        Creating editor...
      </div>
    );
  }

  return (
    <div className="tiptap " data-testid="document-editor">
      <div className="text-sm text-slate-400" data-testid="realtime-status">
        Realtime status: {connectionStatus}
      </div>

      {canEdit && <Menubar editor={editor} />}
      <EditorContent editor={editor} data-testid="editor-content" />
    </div>
  );
}

export default TiptapEditor;
