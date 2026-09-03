import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMyReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Flame, MapPin, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function MyReports() {
  const { user, updateLastSeen } = useAuth();

  const { data: reports = [], isLoading } = useMyReports();

  useEffect(() => {
    updateLastSeen();
  }, [updateLastSeen]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="py-12 text-center">
        <Card className="mx-auto max-w-md p-8">
          <AlertCircle className="text-neo-gray mx-auto mb-4 h-12 w-12" />
          <h3 className="font-display text-xl font-black">Belum Ada Laporan</h3>
          <p className="mb-4 text-sm text-slate-600">Anda belum pernah mengirimkan laporan.</p>
          <Link to="/laporkan">
            <Button variant="primary">Buat Laporan Pertama</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-black">Laporan Saya</h2>
        <Link to="/laporkan">
          <Button variant="primary" size="sm">
            + Laporan Baru
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => {
          const isUnread = new Date(report.updated_at) > new Date(user?.last_seen_at || 0);

          return (
            <Link key={report.id} to={`/laporan/${report.id}`}>
              <Card className="group hover:shadow-neo-lg transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge status={report.status} />
                    {isUnread && (
                      <span
                        className="bg-neo-red flex h-2.5 w-2.5 rounded-full"
                        title="Pembaruan Baru"
                      />
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </div>

                <h3 className="font-display group-hover:text-neo-purple mt-3 text-lg font-black">
                  {report.title}
                </h3>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center gap-1 rounded-lg border-2 border-black px-2 py-0.5 text-xs font-bold"
                      style={{
                        backgroundColor: report.category?.color || '#3A86EF',
                      }}
                    >
                      {report.category?.name}
                    </span>
                    <span className="text-neo-pink flex items-center gap-1 text-sm font-bold">
                      <Flame className="h-4 w-4" />
                      {report.upvote_count || 0}
                    </span>
                  </div>
                  {report.thumbnail_url && (
                    <div className="h-10 w-10 overflow-hidden rounded-lg border-2 border-black">
                      <img
                        src={report.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
