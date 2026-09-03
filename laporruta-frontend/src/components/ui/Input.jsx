import { cn } from "@/lib/utils";

export function Input({ className, error, ref, ...props }) {
  return (
    <input
      ref={ref}
      className={cn("neo-input", error && "neo-input-error", className)}
      {...props}
    />
  );
}
