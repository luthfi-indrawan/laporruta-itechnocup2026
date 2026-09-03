export function SummaryCard({ icon, label, value, description, accent }) {
  const accentClass = {
    yellow: 'bg-neo-yellow',
    purple: 'bg-neo-purple text-white',
    pink: 'bg-neo-pink',
  };

  return (
    <div className="shadow-neo-sm rounded-xl border-2 border-black bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black ${
            accentClass[accent] || 'bg-neo-canvas'
          }`}
        >
          {icon}
        </div>

        <span className="font-display text-2xl font-black">{value}</span>
      </div>

      <p className="mt-3 text-xs font-black uppercase">{label}</p>

      <p className="mt-0.5 text-[11px] font-medium text-slate-500">{description}</p>
    </div>
  );
}
