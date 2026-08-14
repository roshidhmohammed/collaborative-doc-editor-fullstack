import Footer from "@/shared/components/Footer";
import Header from "@/shared/components/Header";
import { HeaderSkeleton } from "@/shared/components/HeaderSkeleton";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
