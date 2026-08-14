"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordInputProps } from "../types/password";
import { cn } from "../utils/cn";

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, className, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <>
        <div className="relative">
          <input
            ref={ref}
            type={show ? "text" : "password"}
            className={cn(
              "w-full rounded-lg border px-4 py-3 pr-12 outline-none",
              error
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500",
              className,
            )}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {show ? (
              <EyeOff size={18} className="text-black" />
            ) : (
              <Eye size={18} className="text-black" />
            )}
          </button>
        </div>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
