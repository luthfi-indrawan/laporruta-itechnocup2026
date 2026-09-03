import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  isLoading = false,
  ...props
}) {
  const variants = {
    primary: "bg-neo-yellow text-black",
    secondary: "bg-neo-pink text-black",
    success: "bg-neo-mint text-black",
    danger: "bg-neo-red text-white",
    ghost: "bg-white text-black",
    outline: "bg-transparent text-black",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        "neo-border rounded-xl font-display font-black uppercase tracking-tight neo-btn inline-flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        variant === "outline" && "hover:bg-neo-canvas",
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
      )}
      {children}
    </button>
  );
}
