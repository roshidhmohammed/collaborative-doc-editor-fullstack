import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-px-4 py-8">
      <section className="w-full max-w-md rounded-xl bg-gray-900  p-8 shadow-lg">
        {children}
      </section>
    </main>
  );
}
