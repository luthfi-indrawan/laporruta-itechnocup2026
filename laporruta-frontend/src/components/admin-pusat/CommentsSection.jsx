import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

import { normalizeArray } from './utilsPusat';

export function CommentsSection({ comments = [], commentCount = 0 }) {
  const safeComments = normalizeArray(comments);

  return (
    <div className="rounded-xl border-2 border-black bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />

          <h4 className="font-display text-lg font-black">Komentar Warga</h4>
        </div>

        <span className="bg-neo-canvas rounded-full border-2 border-black px-2 py-0.5 text-xs font-black">
          {commentCount}
        </span>
      </div>

      {!safeComments.length ? (
        <div className="bg-neo-canvas mt-4 rounded-xl border-2 border-dashed border-black p-5 text-center">
          <MessageCircle className="mx-auto h-7 w-7" />

          <p className="mt-2 text-sm font-bold text-slate-500">Belum ada komentar.</p>

          {Number(commentCount) > 0 && (
            <p className="mt-1 text-xs font-medium text-slate-400">
              Terdapat {commentCount} komentar, tetapi data komentar belum tersedia pada response.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {safeComments.map((comment) => (
            <div key={comment.id} className="bg-neo-canvas rounded-xl border-2 border-black p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black">
                    {comment.user?.full_name || comment.user_name || 'Pengguna'}
                  </p>

                  {comment.created_at && (
                    <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-2 text-sm leading-relaxed font-medium text-slate-700">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
