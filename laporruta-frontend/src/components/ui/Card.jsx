import { cn } from "@/lib/utils";

export function Card({ children, className, padding = "normal" }) {
  const paddings = {
    none: "",
    small: "p-3",
    normal: "p-5",
    large: "p-8",
  };

  return (
    <div
      className={cn("neo-card overflow-hidden", paddings[padding], className)}
    >
      {children}
    </div>
  );
}
