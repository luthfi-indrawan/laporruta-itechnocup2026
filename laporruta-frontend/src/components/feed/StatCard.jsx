import { Card } from '@/components/ui/Card';

export function StatCard({ value, label, icon: Icon }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="bg-neo-canvas flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="font-display text-2xl leading-none font-black">{value}</p>

        <p className="mt-1 text-[11px] leading-tight font-bold text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
