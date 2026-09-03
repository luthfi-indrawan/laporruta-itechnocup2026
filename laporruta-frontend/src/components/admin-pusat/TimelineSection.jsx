import { CheckCircle, History, Shield } from 'lucide-react';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { normalizeArray } from './utilsPusat';
import { formatActionType } from '../shared/reportUtils';
export function TimelineSection({ timeline = [] }) {
  const safeTimeline = normalizeArray(timeline);

  return (
    <div className="rounded-xl border-2 border-black bg-white p-5">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5" />

        <h4 className="font-display text-lg font-black">Audit Trail</h4>
      </div>

      {!safeTimeline.length ? (
        <p className="mt-4 text-sm font-medium text-slate-500">Belum ada aktivitas.</p>
      ) : (
        <div className="mt-5 space-y-0">
          {safeTimeline.map((item, index) => (
            <div key={item.id || `${item.action_type}-${index}`} className="relative flex gap-4">
              {index < safeTimeline.length - 1 && (
                <div className="absolute top-7 left-[11px] h-full w-0.5 bg-black" />
              )}

              <div
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black ${
                  item.is_override ? 'bg-neo-purple text-white' : 'bg-neo-yellow'
                }`}
              >
                {item.is_override ? (
                  <Shield className="h-3 w-3" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
              </div>

              <div className="pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-black">
                    {formatActionType(item.action_type)}
                  </p>

                  {item.is_override && (
                    <span className="bg-neo-purple rounded-full border-2 border-black px-2 py-0.5 text-[9px] font-black text-white">
                      OVERRIDE
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs font-medium text-slate-500">
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
                  <p className="mt-2 text-[10px] font-medium text-slate-500">
                    {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
