import { BarChart3, CheckCircle, FileText } from 'lucide-react';

import { Card } from '@/components/ui/Card';

export function SummaryCard({ icon: Icon, label, value, description }) {
  return (
    <div className="shadow-neo-sm rounded-xl border-2 border-black bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{label}</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="bg-neo-canvas font-display rounded-xl border-2 border-black px-3 py-1 text-2xl font-black">
              {value}
            </span>
          </div>

          <p className="mt-2 text-xs font-bold text-slate-500">{description}</p>
        </div>

        <div className="bg-neo-yellow rounded-xl border-2 border-black p-2">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function DetailMetric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />

        <p className="text-[10px] font-black tracking-widest uppercase">{label}</p>
      </div>

      <p className="font-display mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

export function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase">{label}</p>

      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border-2 border-black bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
    </div>
  );
}

export function EmptyReports() {
  return (
    <Card className="p-10 text-center">
      <div className="bg-neo-canvas mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black">
        <FileText className="h-7 w-7" />
      </div>

      <h3 className="font-display mt-4 text-lg font-black">Tidak ada laporan</h3>

      <p className="mt-1 text-sm font-medium text-slate-500">
        Tidak ada laporan pada filter yang sedang dipilih.
      </p>
    </Card>
  );
}

export function EmptyState({ icon: Icon, text }) {
  return (
    <div className="bg-neo-canvas rounded-xl border-2 border-dashed border-black p-8 text-center">
      <Icon className="mx-auto h-8 w-8" />

      <p className="mt-2 text-sm font-bold text-slate-500">{text}</p>
    </div>
  );
}
