import InfoBox from '@/components/admin-wilayah/InfoBox';
import SectionTitle from '@/components/admin-wilayah/SectionTitle';
import EmptySection from '@/components/admin-wilayah/EmptySection';
import { formatActionType } from '../shared/reportUtils';
import {
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  FileText,
  Flame,
  History,
  ImagePlus,
  Images,
  MapPin,
  MessageCircle,
  Navigation,
  RefreshCw,
  User,
} from 'lucide-react';
import { useAdminWilayahNote } from '@/hooks/useAdminWilayah';

import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
function ReportDetailPanel({
  report,
  isLoading,
  isFetching,
  statusNote,
  setStatusNote,
  internalNote,
  setInternalNote,
  afterImages,
  setAfterImages,
  onStatusUpdate,
  onAddNote,
  onUploadAfterImages,
  isStatusUpdating,
  isAddingNote,
  isUploadingAfterImages,
}) {
  const {
    data: internalNotes = [],
    isLoading: isNotesLoading,
    isFetching: isNotesFetching,
  } = useAdminWilayahNote({
    id: report?.id,
    enabled: Boolean(report?.id),
  });

  if (isLoading) {
    return (
      <div className="border-t-2 border-black pt-6">
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />

            <p className="mt-3 text-sm font-bold text-slate-500">Memuat detail laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="border-t-2 border-black pt-6">
        <div className="bg-neo-red/10 rounded-xl border-2 border-black p-5 text-center">
          <AlertTriangle className="text-neo-red mx-auto h-7 w-7" />

          <p className="font-display mt-2 font-black">Detail laporan tidak tersedia</p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Gagal mengambil detail laporan dari server.
          </p>
        </div>
      </div>
    );
  }

  const images = Array.isArray(report.images) ? report.images : [];

  const beforeImages = images.filter((image) => !image.is_after);

  const afterImagesFromServer = images.filter((image) => image.is_after);

  const timeline = Array.isArray(report.timeline) ? report.timeline : [];

  const comments = Array.isArray(report.comments) ? report.comments : [];

  const priorityScore = Number(report.priority_score) || 0;

  return (
    <div className="border-t-2 border-black pt-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge status={report.status} />

            {report.category?.name && (
              <span
                className="rounded-full border-2 border-black px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: report.category.color || '#3A86EF',
                }}
              >
                {report.category.name}
              </span>
            )}

            <span className="bg-neo-yellow flex items-center gap-1 rounded-full border-2 border-black px-2.5 py-1 text-xs font-black">
              <Flame className="text-neo-pink h-3 w-3" />

              {priorityScore.toFixed(1)}
            </span>
          </div>

          <h4 className="font-display text-2xl font-black">{report.title}</h4>

          {isFetching && (
            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Memperbarui detail...
            </p>
          )}
        </div>

        {report.created_at && (
          <div className="bg-neo-canvas rounded-lg border-2 border-black px-3 py-2">
            <p className="text-[10px] font-black tracking-wide text-slate-500 uppercase">Dibuat</p>

            <p className="mt-0.5 text-xs font-bold">
              {format(new Date(report.created_at), 'dd MMM yyyy, HH:mm', {
                locale: id,
              })}
            </p>
          </div>
        )}
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoBox
          icon={<MessageCircle className="h-4 w-4" />}
          label="Komentar"
          value={`${Number(report.comment_count) || comments.length} komentar`}
        />

        <InfoBox
          icon={<Navigation className="h-4 w-4" />}
          label="Wilayah"
          value={report.wilayah?.name || 'Wilayah tidak tersedia'}
        />
      </div>

      <section className="mb-5">
        <SectionTitle icon={<FileText className="h-4 w-4" />} title="Deskripsi Laporan" />

        <div className="bg-neo-canvas rounded-xl border-2 border-black p-4">
          <p className="text-sm leading-relaxed font-medium text-slate-800">
            {report.description || 'Tidak ada deskripsi.'}
          </p>
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle icon={<MapPin className="h-4 w-4" />} title="Lokasi" />

        <div className="rounded-xl border-2 border-black bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase">Alamat</p>

              <p className="mt-1 text-sm font-bold">
                {report.address_text || 'Alamat tidak tersedia'}
              </p>

              {report.wilayah && (
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {report.wilayah.name}

                  {report.wilayah.type && ` • ${report.wilayah.type}`}
                </p>
              )}
            </div>

            {report.lat != null && report.lng != null && (
              <div className="bg-neo-canvas rounded-lg border-2 border-black px-3 py-2">
                <p className="text-[10px] font-black text-slate-500 uppercase">Koordinat</p>

                <p className="mt-1 font-mono text-xs font-bold">
                  {report.lat}, {report.lng}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle
          icon={<Images className="h-4 w-4" />}
          title="Bukti Laporan"
          count={images.length}
        />

        {images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-video overflow-hidden rounded-xl border-2 border-black bg-slate-100"
              >
                <img
                  src={image.image_url}
                  alt="Bukti laporan"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute bottom-2 left-2">
                  <span className="shadow-neo-sm rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase">
                    {image.is_after ? 'Sesudah' : 'Sebelum'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptySection text="Belum ada foto bukti." />
        )}
      </section>

      {report.status === 'in_progress' && (
        <section className="mb-5">
          <div className="bg-neo-purple/10 rounded-xl border-2 border-black p-4">
            <SectionTitle icon={<ArrowRight className="h-4 w-4" />} title="Perbarui Progress" />

            <p className="mb-3 text-xs font-medium text-slate-600">
              Tambahkan catatan opsional sebelum laporan ditandai selesai.
            </p>

            <Input
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              placeholder="Contoh: Tim sudah di lokasi dan proses perbaikan sedang berlangsung..."
              className="mb-3 bg-white"
            />

            <Button
              variant="success"
              size="sm"
              onClick={() => onStatusUpdate(report.id, 'resolved')}
              isLoading={isStatusUpdating}
            >
              <CheckCircle className="h-4 w-4" />
              Tandai Selesai
            </Button>
          </div>
        </section>
      )}

      {report.status === 'verified' && (
        <section className="mb-5">
          <div className="bg-neo-yellow/30 rounded-xl border-2 border-black p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-sm font-black">Laporan siap dikerjakan</p>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  Status laporan sudah diverifikasi dan dapat diproses oleh tim wilayah.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onStatusUpdate(report.id, 'in_progress')}
                isLoading={isStatusUpdating}
              >
                <ArrowRight className="h-4 w-4" />
                Tandai Dikerjakan
              </Button>
            </div>
          </div>
        </section>
      )}

      {report.status === 'resolved' && (
        <section className="mb-5">
          <div className="bg-neo-mint/20 rounded-xl border-2 border-black p-4">
            <SectionTitle
              icon={<ImagePlus className="h-4 w-4" />}
              title="Bukti Setelah Perbaikan"
              count={afterImagesFromServer.length}
            />

            {afterImagesFromServer.length > 0 && (
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {afterImagesFromServer.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-video overflow-hidden rounded-xl border-2 border-black bg-white"
                  >
                    <img
                      src={image.image_url}
                      alt="Bukti setelah perbaikan"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border-2 border-black bg-white p-3">
              <label className="font-display mb-2 block text-sm font-bold">
                Unggah Foto Perbaikan
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={(event) => setAfterImages(Array.from(event.target.files || []))}
                className="block w-full text-sm font-medium"
              />

              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-slate-500">Maksimal 3 foto.</p>

                {afterImages.length > 0 && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onUploadAfterImages(afterImages)}
                    disabled={afterImages.length > 3}
                    isLoading={isUploadingAfterImages}
                  >
                    <ImagePlus className="h-4 w-4" />
                    Upload {afterImages.length} Foto
                  </Button>
                )}
              </div>

              {afterImages.length > 3 && (
                <p className="text-neo-red mt-2 text-xs font-bold">
                  Maksimal 3 foto dapat diunggah.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mb-5">
        <SectionTitle
          icon={<History className="h-4 w-4" />}
          title="Perjalanan Laporan"
          count={timeline.length}
        />

        {timeline.length > 0 ? (
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <div className="space-y-0">
              {timeline.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                  {index < timeline.length - 1 && (
                    <div className="absolute top-7 bottom-0 left-[11px] w-0.5 bg-black" />
                  )}

                  <div className="bg-neo-yellow relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black">
                    <CheckCircle className="h-3 w-3" />
                  </div>

                  <div className="min-w-0 flex-1 pb-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-display text-sm font-black">
                          {formatActionType(item.action_type)}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {item.actor_name ? `oleh ${item.actor_name}` : 'Sistem'}
                        </p>
                      </div>

                      {item.created_at && (
                        <p className="shrink-0 text-[11px] font-medium text-slate-500">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </p>
                      )}
                    </div>
                    {(item.old_value || item.new_value) && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {item.old_value && (
                          <div className="min-w-0 rounded-lg border-2 border-black bg-slate-100 p-3">
                            <p className="mb-1 text-[10px] font-black text-slate-500 uppercase">
                              Sebelumnya
                            </p>

                            <pre className="max-w-full overflow-x-auto text-xs font-medium break-words whitespace-pre-wrap">
                              {typeof item.old_value === 'object'
                                ? JSON.stringify(item.old_value, null, 2)
                                : item.old_value}
                            </pre>
                          </div>
                        )}

                        {item.new_value && (
                          <div className="bg-neo-yellow/30 min-w-0 rounded-lg border-2 border-black p-3">
                            <p className="mb-1 text-[10px] font-black text-slate-500 uppercase">
                              Menjadi
                            </p>

                            <pre className="max-w-full overflow-x-auto text-xs font-medium break-words whitespace-pre-wrap">
                              {typeof item.new_value === 'object'
                                ? JSON.stringify(item.new_value, null, 2)
                                : item.new_value}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptySection text="Belum ada aktivitas laporan." />
        )}
      </section>

      <section className="mb-5">
        <SectionTitle
          icon={<MessageCircle className="h-4 w-4" />}
          title="Komentar Warga"
          count={Number(report.comment_count) || comments.length}
        />

        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-neo-canvas rounded-xl border-2 border-black p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white">
                      <User className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {comment.user?.full_name || 'Pengguna'}
                      </p>

                      {comment.created_at && (
                        <p className="text-[11px] font-medium text-slate-500">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed font-medium text-slate-800">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptySection text="Belum ada komentar dari warga." />
        )}
      </section>

      <section>
        <SectionTitle
          icon={<MessageSquare className="h-4 w-4" />}
          title="Catatan Internal"
          count={internalNotes.length}
        />

        <div className="rounded-xl border-2 border-black bg-white p-4">
          <div className="space-y-3">
            {isNotesLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-black border-t-transparent" />

                  <p className="mt-2 text-xs font-bold text-slate-500">
                    Memuat catatan internal...
                  </p>
                </div>
              </div>
            ) : internalNotes.length > 0 ? (
              internalNotes.map((note) => (
                <div key={note.id} className="bg-neo-canvas rounded-lg border-2 border-black p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-black">
                      {note.admin_name || note.created_by || 'Admin'}
                    </p>

                    {note.created_at && (
                      <p className="text-[11px] font-medium text-slate-500">
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed font-medium">{note.note}</p>
                </div>
              ))
            ) : (
              <p className="py-2 text-center text-sm font-medium text-slate-400 italic">
                Belum ada catatan internal.
              </p>
            )}
          </div>

          {isNotesFetching && !isNotesLoading && (
            <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Memperbarui catatan...
            </div>
          )}

          <div className="mt-4 border-t-2 border-black pt-4">
            <label className="font-display mb-2 block text-sm font-bold">Tambahkan Catatan</label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Contoh: Suku cadang dipesan, ETA 3 hari..."
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddNote(report.id)}
                disabled={!internalNote.trim()}
                isLoading={isAddingNote}
              >
                <MessageSquare className="h-4 w-4" />
                Simpan
              </Button>
            </div>

            <p className="mt-2 text-[11px] font-medium text-slate-500">
              Catatan ini hanya dapat dilihat oleh admin.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
export default ReportDetailPanel;
