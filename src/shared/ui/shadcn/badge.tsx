import * as React from "react";

import { cn } from "@/shared/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary";
};

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "secondary" && "bg-gray-100 text-gray-700",
        variant === "default" && "bg-black text-white",
        className,
      )}
      {...props}
    />
  );
}
