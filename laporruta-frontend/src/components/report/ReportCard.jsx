import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, MessageCircle, MapPin, Share2, Clock3, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ReportCard({ report }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [shareSuccess, setShareSuccess] = useState(false);

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/reports/${report.id}/upvotes`);

      return res.data.result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['public-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['report', report.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['my-reports'],
      });
    },
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/laporan/${report.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: report.title,
          text: report.description || '',
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      setShareSuccess(true);

      setTimeout(() => {
        setShareSuccess(false);
      }, 2000);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Failed to share report:', error);
      }
    }
  };

  const upvoteCount = Number(report.upvote_count) || 0;

  const hasUpvoted = Boolean(report.has_upvoted);

  const canUpvote =
    isAuthenticated &&
    user?.role === 'user' &&
    ['verified', 'in_progress', 'resolved'].includes(report.status);

  const categoryName = report.category?.name || report.category_name || 'Tanpa Kategori';

  const categoryColor = report.category?.color || report.category_color || '#3A86EF';

  const comments = Array.isArray(report.comments) ? report.comments : [];

  return (
    <Card className="overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-neo-yellow font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black font-black">
              {getInitial(report.user?.full_name || report.user_name || 'U')}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {report.user?.full_name || report.user_name || 'Warga LaporRuta'}
              </p>

              <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <MapPin className="h-3 w-3 shrink-0" />

                <span className="truncate">
                  {report.wilayah?.name || report.address_text || 'Lokasi tersedia'}
                </span>
              </div>
            </div>
          </div>

          <Badge status={report.status} />
        </div>
      </div>

      {report.thumbnail_url ? (
        <Link to={`/laporan/${report.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden border-y-2 border-black bg-slate-100">
            <img
              src={report.thumbnail_url}
              alt={report.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              loading="lazy"
            />

            <div className="absolute top-3 left-3">
              <span
                className="shadow-neo-sm rounded-full border-2 border-black px-3 py-1 text-xs font-black"
                style={{
                  backgroundColor: categoryColor,
                }}
              >
                {categoryName}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <Link to={`/laporan/${report.id}`} className="block">
          <div className="bg-neo-canvas relative flex aspect-[4/3] items-center justify-center border-y-2 border-black">
            <div className="text-center">
              <MapPin className="mx-auto h-10 w-10" />

              <p className="mt-2 text-xs font-black uppercase">Tidak ada foto</p>
            </div>
          </div>
        </Link>
      )}

      <div className="space-y-3 p-4">
        <Link to={`/laporan/${report.id}`} className="group block">
          <h2 className="font-display text-xl leading-tight font-black group-hover:underline">
            {report.title}
          </h2>
        </Link>

        {report.address_text && (
          <div className="flex items-start gap-1.5 text-xs font-bold text-slate-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <span>
              {report.address_text}

              {report.wilayah?.name && `, ${report.wilayah.name}`}
            </span>
          </div>
        )}

        {report.description && (
          <p className="line-clamp-3 text-sm leading-relaxed font-medium text-slate-700">
            {report.description}
          </p>
        )}

        {report.created_at && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Clock3 className="h-3 w-3" />

            {formatDistanceToNow(new Date(report.created_at), {
              addSuffix: true,
              locale: idLocale,
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t-2 border-black pt-3">
          <div className="flex items-center gap-2">
            {canUpvote ? (
              <Button
                variant={hasUpvoted ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => upvoteMutation.mutate()}
                isLoading={upvoteMutation.isPending}
                disabled={upvoteMutation.isPending}
              >
                <Flame className="h-4 w-4" />

                {upvoteCount}
              </Button>
            ) : (
              <div className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-black text-slate-600">
                <Flame className="text-neo-pink h-4 w-4" />

                {upvoteCount}
              </div>
            )}

            <Link
              to={`/laporan/${report.id}`}
              className="hover:bg-neo-canvas flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-black text-slate-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />

              {comments.length || Number(report.comment_count) || 0}
            </Link>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="hover:bg-neo-canvas flex items-center gap-1 rounded-lg border-2 border-black bg-white px-2.5 py-1.5 text-xs font-black transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />

            <span className="hidden sm:inline">{shareSuccess ? 'Tersalin!' : 'Bagikan'}</span>
          </button>
        </div>

        {comments.length > 0 && (
          <div className="space-y-2 border-t-2 border-black pt-3">
            {comments.slice(-2).map((comment) => (
              <div key={comment.id} className="text-xs">
                <span className="font-black">{comment.user?.full_name || 'Pengguna'}</span>{' '}
                <span className="font-medium text-slate-700">{comment.text}</span>
              </div>
            ))}

            {comments.length > 2 && (
              <Link
                to={`/laporan/${report.id}`}
                className="text-neo-purple inline-block text-xs font-black hover:underline"
              >
                Lihat {comments.length} komentar →
              </Link>
            )}
          </div>
        )}

        <Link to={`/laporan/${report.id}`} className="block">
          <div className="bg-neo-canvas hover:bg-neo-yellow rounded-lg border-2 border-black px-3 py-2 text-center text-xs font-black transition-colors">
            Lihat Detail Laporan →
          </div>
        </Link>
      </div>
    </Card>
  );
}

function getInitial(name) {
  if (!name) {
    return 'U';
  }

  return name.trim().charAt(0).toUpperCase();
}
