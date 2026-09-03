import { cn } from "@/lib/utils";

const statusMap = {
  pending_verification: {
    label: "Menunggu Verifikasi",
    className: "bg-neo-yellow text-black",
  },
  verified: { label: "Terverifikasi", className: "bg-neo-blue text-white" },
  in_progress: {
    label: "Sedang Dikerjakan",
    className: "bg-neo-purple text-white",
  },
  resolved: { label: "Selesai", className: "bg-neo-mint text-black" },
  rejected: { label: "Ditolak", className: "bg-neo-red text-white" },
};

export function Badge({ status, className }) {
  const config = statusMap[status] || {
    label: status,
    className: "bg-neo-gray text-black",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-lg border-2 border-black px-2.5 py-1 font-display text-xs font-bold uppercase",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
