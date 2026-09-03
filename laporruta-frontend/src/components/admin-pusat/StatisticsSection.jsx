import { Activity, AlertTriangle, BarChart3, CheckCircle, Clock } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import { EmptyState, LoadingState, SummaryCard } from './AdminPusatShared';

import { formatStatus } from './utilsPusat';

export function StatisticsSection({ stats, isLoading }) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!stats) {
    return <EmptyState icon={BarChart3} text="Data statistik belum tersedia." />;
  }

  const statusBreakdown = stats.status_breakdown || {};

  const topCategories = stats.top_categories || [];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={BarChart3}
          label="Total Laporan"
          value={stats.total_reports || 0}
          description="Seluruh laporan"
        />

        <SummaryCard
          icon={CheckCircle}
          label="Resolution Rate"
          value={`${stats.resolution_rate || 0}%`}
          description="Tingkat penyelesaian"
        />

        <SummaryCard
          icon={Clock}
          label="Rata-rata"
          value={stats.avg_resolution_days || 0}
          description="Hari penyelesaian"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Pending"
          value={statusBreakdown.pending_verification || 0}
          description="Menunggu verifikasi"
        />
      </div>

      <Card padding="large">
        <div className="mb-5 flex items-center gap-2">
          <Activity className="h-5 w-5" />

          <h3 className="font-display text-xl font-black">Breakdown Status</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div
              key={status}
              className="bg-neo-canvas rounded-xl border-2 border-black p-4 text-center"
            >
              <Badge status={status} />

              <p className="font-display mt-2 text-2xl font-black">{count}</p>

              <p className="mt-1 text-[10px] font-bold text-slate-500">{formatStatus(status)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="large">
        <div className="mb-5 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />

          <h3 className="font-display text-xl font-black">Kategori Teratas</h3>
        </div>

        {!topCategories.length ? (
          <p className="text-sm font-medium text-slate-500">Belum ada data kategori.</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map((item, index) => {
              const percentage =
                stats.total_reports > 0
                  ? Math.min((Number(item.count) / stats.total_reports) * 100, 100)
                  : 0;

              return (
                <div key={item.category || index}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">{item.category}</span>

                    <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs font-black">
                      {item.count}
                    </span>
                  </div>

                  <div className="bg-neo-canvas h-5 overflow-hidden rounded-full border-2 border-black">
                    <div
                      className="bg-neo-purple h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
