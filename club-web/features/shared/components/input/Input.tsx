import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, containerClassName, leftSection, rightSection, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "backdrop-blur-md flex min-h-12 sm:min-h-14 w-full items-center gap-3 rounded-full border duration-200 border-white/20 bg-transparent px-4 transition-colors",
          "focus-within:border-white/30",
          containerClassName,
        )}
      >
        {leftSection && (
          <div className="flex shrink-0 items-center">{leftSection}</div>
        )}

        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent text-base outline-none placeholder:text-zinc-400",
            className,
          )}
          {...props}
        />

        {rightSection && (
          <div className="flex shrink-0 items-center">{rightSection}</div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
