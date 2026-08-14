"use client";

import { UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ProfileModal from "./ProfileModal";
import { ProfileModalProps } from "../types/user";

export function ProfileMenu({ userData }: ProfileModalProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-100 transition hover:border-cyan-400/50 hover:bg-slate-800"
        aria-label="Open profile menu"
      >
        <UserCircle2 className="h-6 w-6" />
      </button>
      {isMenuOpen && (
        <ProfileModal data-testid="profile-modal" userData={userData} />
      )}
    </div>
  );
}
