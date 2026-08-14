import Link from "next/link";
import { ProfileMenu } from "@/features/user/components/ProfileMenu";
import { fetchUserProfile } from "@/features/user/services/user-profile";

export default async function Header() {
  let data = undefined;
  try {
    data = await fetchUserProfile();
  } catch (error) {
    // Ignore error for unauthenticated visitors so the page layout doesn't crash before standard redirects occur
  }

  return (
    <header className="border-b z-[99999] border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/documents"
          className="text-xl font-semibold tracking-tight text-white"
        >
          Collab Doc Creator
        </Link>

        <ProfileMenu userData={data} />
      </div>
    </header>
  );
}
