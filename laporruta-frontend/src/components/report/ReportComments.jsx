import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export function ReportComments({ reportId, comments = [], commentCount = 0 }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [text, setText] = useState('');

  const safeComments = Array.isArray(comments) ? comments : [];

  const createCommentMutation = useMutation({
    mutationFn: async (commentText) => {
      const res = await api.post(`/reports/${reportId}/comments`, {
        text: commentText,
      });

      return res.data.result;
    },

    onSuccess: () => {
      setText('');

      queryClient.invalidateQueries({
        queryKey: ['report', reportId],
      });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    if (trimmedText.length > 500) {
      return;
    }

    createCommentMutation.mutate(trimmedText);
  };

  const handleChange = (event) => {
    const value = event.target.value;

    if (value.length <= 500) {
      setText(value);
    }
  };

  const remainingCharacters = 500 - text.length;

  return (
    <Card padding="large" className="space-y-5">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />

        <h2 className="font-display text-xl font-black">Komentar</h2>

        <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs font-bold">
          {commentCount}
        </span>
      </div>

      {isAuthenticated && user?.role === 'user' && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={text}
              onChange={handleChange}
              placeholder="Tulis komentar kamu..."
              rows={3}
              maxLength={500}
              disabled={createCommentMutation.isPending}
              className="neo-input min-h-[100px] w-full resize-none pr-16"
            />

            <span
              className={`absolute right-3 bottom-3 text-[10px] font-bold ${
                remainingCharacters <= 50 ? 'text-neo-red' : 'text-slate-400'
              }`}
            >
              {text.length}/500
            </span>
          </div>

          {createCommentMutation.isError && (
            <p className="text-neo-red text-xs font-bold">
              {createCommentMutation.error?.response?.data?.message ||
                'Gagal menambahkan komentar. Silakan coba lagi.'}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!text.trim() || createCommentMutation.isPending}
              isLoading={createCommentMutation.isPending}
            >
              {!createCommentMutation.isPending && <Send className="h-4 w-4" />}
              Kirim Komentar
            </Button>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <div className="bg-neo-canvas rounded-xl border-2 border-dashed border-black p-4 text-center">
          <MessageCircle className="mx-auto h-7 w-7" />

          <p className="font-display mt-2 text-sm font-black">Ingin ikut berdiskusi?</p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Login untuk memberikan komentar pada laporan ini.
          </p>
        </div>
      )}

      {safeComments.length === 0 ? (
        <div className="bg-neo-canvas rounded-xl border-2 border-dashed border-black p-6 text-center">
          <MessageCircle className="mx-auto h-8 w-8" />

          <p className="font-display mt-2 text-sm font-black">Belum ada komentar</p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Jadilah orang pertama yang memberikan komentar pada laporan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeComments.map((comment) => (
            <div key={comment.id} className="bg-neo-canvas rounded-xl border-2 border-black p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">
                    {comment.user?.full_name || 'Pengguna'}
                  </p>

                  {comment.created_at && (
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed font-medium text-slate-800">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
