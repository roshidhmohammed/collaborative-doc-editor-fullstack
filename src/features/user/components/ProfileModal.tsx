import { LogOut } from "lucide-react";
import Button from "@/shared/components/Button";
import { handleLogout } from "../actions/logout";
import { ProfileModalProps } from "../types/user";

export function ProfileModal({ userData }: ProfileModalProps) {
  return (
    <div className=" absolute right-0 mt-3 w-72 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/30 ">
      <div className="border-b border-slate-800 pb-3">
        <p className="text-sm font-semibold text-white">{userData?.fullName}</p>
        <p className="mt-1 text-sm text-slate-400">{userData?.email}</p>
      </div>

      <Button
        type="button"
        data-testid="logout-button"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
        onClick={async () => {
          await handleLogout();
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}

export default ProfileModal;
