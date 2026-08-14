"use client";

import { Toaster } from "sonner";

export default function SonnerProvider() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      richColors
      closeButton
      expand
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg shadow-lg",
          title: "font-semibold text-white",
          description: "text-zinc-400",
          actionButton: "bg-blue-600 text-white",
          cancelButton: "bg-zinc-700 text-white",
        },
      }}
    />
  );
}
