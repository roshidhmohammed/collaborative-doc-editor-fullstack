"use client";

import { forwardRef } from "react";
import { cn } from "../utils/cn";
import { InputProps } from "../types/input";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <>
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border px-4 py-3 outline-none transition",
            error ? "border-red-500" : "border-gray-300 focus:border-blue-500",
            className,
          )}
          {...props}
        />

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </>
    );
  },
);

Input.displayName = "Input";

export default Input;
