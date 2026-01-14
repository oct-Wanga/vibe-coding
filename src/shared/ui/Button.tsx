import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base = "rounded px-3 py-2 text-sm";
  const style = variant === "primary" ? "bg-black text-white" : "bg-transparent hover:bg-gray-100";
  return <button className={`${base} ${style} ${className}`} {...props} />;
}
