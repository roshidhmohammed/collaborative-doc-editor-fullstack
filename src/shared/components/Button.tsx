"use client";

import { ButtonProps } from "@/shared/types/button";
import { cn } from "@/shared/utils/cn";

export default function Button({
  children,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition",
        "hover:bg-blue-700",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
