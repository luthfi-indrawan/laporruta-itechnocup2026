import { useParams, Link, useLocation } from 'react-router-dom';
import { formatActionType } from '../components/shared/reportUtils';
import { useAuth } from '@/hooks/useAuth';
import { useReportDetail, useUpvoteReport } from '@/hooks/useReports';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReportComments } from '@/components/report/ReportComments';

import { MapPin, Flame, Clock, Share2, ArrowLeft, CheckCircle2, History } from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function ReportDetail() {
  const { id } = useParams();
  const location = useLocation();

  const { user, isAuthenticated } = useAuth();

  const isFromMyReports =
    location.state?.from === 'my-reports' || document.referrer.includes('/laporan-saya');

  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useReportDetail({
    id,
    isAuthenticated,
    userRole: user?.role,
  });

  const upvoteMutation = useUpvoteReport();

  const handleShare = async () => {
    const shareData = {
      title: report?.title || 'Laporan LaporRuta',
      text: report?.description || '',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      alert('Link laporan berhasil disalin.');
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Failed to share report:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Card className="p-8 text-center">
          <h2 className="font-display text-xl font-black">Laporan Tidak Ditemukan</h2>

          <p className="mt-2 text-sm text-slate-600">
            Laporan ini mungkin belum tersedia, telah dihapus, atau kamu tidak memiliki akses untuk
            melihatnya.
          </p>

          {error?.response?.data?.message && (
            <p className="mt-2 text-xs font-bold text-red-500">{error.response.data.message}</p>
          )}

          <Link to="/" className="mt-4 inline-block">
            <Button variant="primary">Kembali ke Peta</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const categoryName = report.category?.name || 'Tanpa Kategori';

  const categoryColor = report.category?.color || '#3A86EF';

  const upvoteCount = Number(report.upvote_count) || 0;

  const hasUpvoted = Boolean(report.has_upvoted);

  const commentCount = Number(report.comment_count) || 0;

  const comments = Array.isArray(report.comments) ? report.comments : [];

  const canUpvote =
    user?.role === 'user' && ['verified', 'in_progress', 'resolved'].includes(report.status);

  const timeline = Array.isArray(report.timeline) ? report.timeline : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <Link
        to={isFromMyReports ? '/laporan-saya' : '/'}
        className="hover:text-neo-purple inline-flex items-center gap-2 font-bold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />

        {isFromMyReports ? 'Kembali ke Laporan Saya' : 'Kembali ke Peta'}
      </Link>

      <Card padding="large" className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border-2 border-black px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: categoryColor,
              }}
            >
              {categoryName}
            </span>

            <Badge status={report.status} />
          </div>

          {report.created_at && (
            <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Clock className="h-3 w-3" />

              {formatDistanceToNow(new Date(report.created_at), {
                addSuffix: true,
                locale: idLocale,
              })}
            </span>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl leading-tight font-black">{report.title}</h1>

          {report.updated_at && report.updated_at !== report.created_at && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              Diperbarui{' '}
              {formatDistanceToNow(new Date(report.updated_at), {
                addSuffix: true,
                locale: idLocale,
              })}
            </p>
          )}
        </div>

        <p className="text-base leading-relaxed font-medium text-slate-800">{report.description}</p>

        <div className="bg-neo-canvas flex items-start gap-3 rounded-xl border-2 border-black p-4">
          <MapPin className="text-neo-red mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">Lokasi</p>

            <p className="mt-1 text-sm font-bold">
              {report.address_text || 'Lokasi tersedia di peta'}
            </p>

            {report.wilayah?.name && (
              <p className="mt-1 text-xs font-medium text-slate-600">
                {report.wilayah.name}

                {report.wilayah.type && ` • ${report.wilayah.type}`}
              </p>
            )}

            {report.lat != null && report.lng != null && (
              <p className="mt-1 text-xs font-medium text-slate-500">
                {report.lat}, {report.lng}
              </p>
            )}
          </div>
        </div>

        {report.images?.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-display text-lg font-black">Bukti Laporan</h2>

              <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs font-bold">
                {report.images.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {report.images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border-2 border-black bg-slate-100"
                >
                  <img
                    src={img.image_url}
                    alt={`Bukti laporan ${report.title}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute bottom-2 left-2">
                    <span className="shadow-neo-sm rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase">
                      {img.is_after ? 'Setelah' : 'Sebelum'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black pt-4">
          <div>
            {canUpvote ? (
              <Button
                variant={hasUpvoted ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => upvoteMutation.mutate(id)}
                isLoading={upvoteMutation.isPending}
                disabled={upvoteMutation.isPending}
              >
                <Flame className="h-4 w-4" />
                {hasUpvoted ? 'Batal Dukung' : 'Dukung'} ({upvoteCount})
              </Button>
            ) : (
              <div className="flex items-center gap-1 font-bold text-slate-500">
                <Flame className="text-neo-pink h-4 w-4" />
                {upvoteCount} dukungan
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="hover:bg-neo-canvas flex items-center gap-1 rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-bold transition-colors"
          >
            <Share2 className="h-3 w-3" />
            Bagikan
          </button>
        </div>
      </Card>

      {timeline.length > 0 && (
        <Card padding="large" className="space-y-5">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />

            <h2 className="font-display text-xl font-black">Perjalanan Laporan</h2>
          </div>

          <div className="space-y-0">
            {timeline.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {index < timeline.length - 1 && (
                  <div className="absolute top-7 left-[11px] h-full w-0.5 bg-black" />
                )}

                <div className="bg-neo-yellow relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black">
                  <CheckCircle2 className="h-3 w-3" />
                </div>

                <div className="pb-6">
                  <p className="font-display text-sm font-black">
                    {formatActionType(item.action_type)}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-600">
                    {item.actor_name ? `oleh ${item.actor_name}` : 'Sistem'}
                  </p>

                  {(item.old_value || item.new_value) && (
                    <div className="bg-neo-canvas mt-2 rounded-lg border-2 border-black p-2 text-xs font-medium">
                      {item.old_value && (
                        <p>
                          <span className="font-bold">Sebelumnya:</span> {item.old_value}
                        </p>
                      )}

                      {item.new_value && (
                        <p>
                          <span className="font-bold">Menjadi:</span> {item.new_value}
                        </p>
                      )}
                    </div>
                  )}

                  {item.created_at && (
                    <p className="mt-2 text-[11px] font-medium text-slate-500">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ReportComments reportId={report.id} comments={comments} commentCount={commentCount} />
    </div>
  );
}
