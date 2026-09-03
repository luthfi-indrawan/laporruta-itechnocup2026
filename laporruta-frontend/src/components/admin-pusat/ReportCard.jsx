import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  Flame,
  Map,
  MapPin,
  MessageCircle,
  Shield,
} from 'lucide-react';

import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WilayahSelect } from '@/components/ui/WilayahSelect';

import { EditReportForm } from './EditReportForm';
import { CommentsSection } from './CommentsSection';
import { TimelineSection } from './TimelineSection';

import { DetailMetric, InfoItem, LoadingState } from './AdminPusatShared';

import {
  getCategoryId,
  getWilayahId,
  normalizeArray,
  normalizeId,
  formatStatus,
} from './utilsPusat';

const STATUS_OPTIONS = [
  {
    key: 'pending_verification',
    label: 'Menunggu Verifikasi',
  },
  {
    key: 'verified',
    label: 'Terverifikasi',
  },
  {
    key: 'in_progress',
    label: 'Sedang Dikerjakan',
  },
  {
    key: 'resolved',
    label: 'Selesai',
  },
  {
    key: 'rejected',
    label: 'Ditolak',
  },
];
export function ReportCard({
  report,
  detail,
  isExpanded,
  detailLoading,
  detailError,
  overrideStatus,
  overrideReason,
  reassignZone,
  editingReport,
  editForm,
  categories,
  categoriesLoading,
  wilayah,
  wilayahLoading,
  overrideMutation,
  reassignMutation,
  editMutation,
  onExpand,
  onOverrideStatusChange,
  onOverrideReasonChange,
  onOverride,
  onReassignZoneChange,
  onReassign,
  onStartEdit,
  onCancelEdit,
  onEditFormChange,
  onEditSubmit,
}) {
  const displayReport = detail || report;

  const priorityScore = Number(report.priority_score ?? detail?.priority_score) || 0;

  const upvoteCount = Number(detail?.upvote_count ?? report.upvote_count) || 0;

  const commentCount = Number(detail?.comment_count ?? report.comment_count) || 0;

  const hasCoordinate = displayReport.lat != null && displayReport.lng != null;

  const isEditing = editingReport === report.id;

  const categoryId = getCategoryId(displayReport);

  const resolvedCategory =
    displayReport.category ||
    report.category ||
    categories.find((category) => normalizeId(category.id) === normalizeId(categoryId));

  const wilayahId = getWilayahId(displayReport);

  const resolvedWilayah =
    displayReport.wilayah ||
    report.wilayah ||
    wilayah.find((wilayah) => normalizeId(wilayah.id) === normalizeId(wilayahId));

  const comments = normalizeArray(detail?.comments);

  return (
    <Card
      padding={isExpanded ? 'large' : 'normal'}
      className={`overflow-visible transition-all ${isExpanded ? 'ring-neo-purple ring-2' : ''}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge status={report.status} />

            {resolvedCategory?.name && (
              <span
                className="rounded-full border-2 border-black px-2 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: resolvedCategory.color || '#3A86EF',
                }}
              >
                {resolvedCategory.name}
              </span>
            )}

            <span className="bg-neo-canvas flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-xs font-bold">
              <MapPin className="h-3 w-3" />

              {resolvedWilayah?.name || 'Zona Tidak Dikenal'}
            </span>

            <span className="flex items-center gap-1 rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs font-bold">
              <Flame className="text-neo-pink h-3 w-3" />

              {priorityScore.toFixed(1)}
            </span>
          </div>

          <h3 className="font-display text-xl leading-tight font-black">{report.title}</h3>

          <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-700">
            {report.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
            {report.address_text && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />

                <span className="max-w-[320px] truncate">{report.address_text}</span>
              </span>
            )}

            {report.created_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />

                {formatDistanceToNow(new Date(report.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </span>
            )}

            {report.reporter?.full_name && <span>oleh {report.reporter.full_name}</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="bg-neo-canvas flex items-center gap-1 rounded-lg border-2 border-black px-2 py-1 text-xs font-bold">
              <Flame className="h-3 w-3" />
              {upvoteCount} dukungan
            </span>

            <span className="bg-neo-canvas flex items-center gap-1 rounded-lg border-2 border-black px-2 py-1 text-xs font-bold">
              <MessageCircle className="h-3 w-3" />
              {commentCount} komentar
            </span>

            {hasCoordinate && (
              <span className="bg-neo-mint flex items-center gap-1 rounded-lg border-2 border-black px-2 py-1 text-xs font-bold">
                <MapPin className="h-3 w-3" />
                Ada koordinat
              </span>
            )}

            {report.is_unread && (
              <span className="bg-neo-yellow rounded-lg border-2 border-black px-2 py-1 text-[10px] font-black">
                BARU
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onExpand}>
            <Eye className="h-4 w-4" />

            {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}

            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-5 border-t-2 border-black pt-5">
          {detailLoading && <LoadingState />}

          {detailError && (
            <div className="bg-neo-red/10 rounded-xl border-2 border-black p-5">
              <div className="font-display text-neo-red flex items-center gap-2 font-black">
                <AlertTriangle className="h-5 w-5" />
                Gagal mengambil detail laporan.
              </div>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Data ringkasan tetap tersedia, tetapi detail lengkap tidak dapat dimuat.
              </p>
            </div>
          )}

          {detail && !detailLoading && (
            <>
              <div className="grid gap-3 md:grid-cols-4">
                <DetailMetric
                  label="Priority Score"
                  value={Number(detail.priority_score ?? priorityScore).toFixed(1)}
                  icon={Flame}
                />

                <DetailMetric label="Dukungan" value={upvoteCount} icon={Flame} />

                <DetailMetric label="Komentar" value={commentCount} icon={MessageCircle} />

                <DetailMetric label="Status" value={formatStatus(detail.status)} icon={Activity} />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {isEditing ? (
                    <EditReportForm
                      form={editForm}
                      categories={categories}
                      categoriesLoading={categoriesLoading}
                      onChange={onEditFormChange}
                      onCancel={onCancelEdit}
                      onSubmit={onEditSubmit}
                      isLoading={editMutation.isPending}
                    />
                  ) : (
                    <div className="rounded-xl border-2 border-black bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                            Informasi Laporan
                          </p>

                          <h4 className="font-display mt-1 text-2xl font-black">{detail.title}</h4>
                        </div>

                        <Button variant="ghost" size="sm" onClick={onStartEdit}>
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-xs font-black text-slate-500 uppercase">Deskripsi</p>

                          <p className="mt-1 text-sm leading-relaxed font-medium text-slate-700">
                            {detail.description || '-'}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <InfoItem
                            label="Pelapor"
                            value={detail.reporter?.full_name || report.reporter?.full_name || '-'}
                          />

                          <InfoItem
                            label="Kategori"
                            value={resolvedCategory?.name || 'Kategori tidak tersedia'}
                          />

                          <InfoItem
                            label="Wilayah"
                            value={resolvedWilayah?.name || 'Wilayah tidak tersedia'}
                          />

                          <InfoItem label="Tipe Wilayah" value={resolvedWilayah?.type || '-'} />

                          <InfoItem
                            label="Dibuat"
                            value={
                              detail.created_at
                                ? format(new Date(detail.created_at), 'dd MMM yyyy, HH:mm', {
                                    locale: id,
                                  })
                                : '-'
                            }
                          />

                          <InfoItem
                            label="Diperbarui"
                            value={
                              detail.updated_at
                                ? format(new Date(detail.updated_at), 'dd MMM yyyy, HH:mm', {
                                    locale: id,
                                  })
                                : '-'
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-neo-canvas rounded-xl border-2 border-black p-5">
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5" />

                    <h4 className="font-display font-black">Lokasi</h4>
                  </div>

                  <p className="mt-3 text-sm font-bold">
                    {detail.address_text || 'Alamat tidak tersedia'}
                  </p>

                  {detail.lat != null && detail.lng != null && (
                    <div className="mt-3 rounded-lg border-2 border-black bg-white p-3">
                      <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                        Koordinat
                      </p>

                      <p className="mt-1 text-xs font-bold">
                        {detail.lat}, {detail.lng}
                      </p>
                    </div>
                  )}

                  {resolvedWilayah?.name && (
                    <div className="mt-3 rounded-lg border-2 border-black bg-white p-3">
                      <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                        Zona
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />

                        <p className="text-xs font-bold">{resolvedWilayah.name}</p>
                      </div>

                      {resolvedWilayah.type && (
                        <p className="mt-1 text-[11px] font-medium text-slate-500">
                          {resolvedWilayah.type}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {detail.images?.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                        Dokumentasi
                      </p>

                      <h4 className="font-display text-lg font-black">Foto Laporan</h4>
                    </div>

                    <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs font-black">
                      {detail.images.length}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {detail.images.map((image) => (
                      <div
                        key={image.id}
                        className="group relative aspect-video overflow-hidden rounded-xl border-2 border-black bg-slate-100"
                      >
                        <img
                          src={image.image_url}
                          alt="Bukti laporan"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        <span className="absolute bottom-2 left-2 rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase shadow-sm">
                          {image.is_after ? 'Sesudah' : 'Sebelum'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <CommentsSection
                comments={comments}
                commentCount={detail.comment_count ?? commentCount}
              />

              <TimelineSection timeline={detail.timeline} />

              <div className="bg-neo-yellow/10 rounded-xl border-2 border-black p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-neo-yellow rounded-lg border-2 border-black p-2">
                    <Shield className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-black">Override Status</h4>

                    <p className="mt-1 text-xs font-medium text-slate-600">
                      Admin Pusat dapat mengubah status laporan ke arah mana pun.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.key}
                      type="button"
                      onClick={() => onOverrideStatusChange(status.key)}
                      className={`rounded-lg border-2 border-black px-3 py-2 text-xs font-bold transition-all ${
                        overrideStatus === status.key
                          ? 'bg-neo-purple shadow-neo-sm text-white'
                          : 'hover:bg-neo-canvas bg-white'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <Input
                    value={overrideReason}
                    onChange={(event) => onOverrideReasonChange(event.target.value)}
                    placeholder="Alasan override wajib diisi..."
                    className="bg-white"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onOverride}
                    disabled={!overrideStatus || !overrideReason.trim()}
                    isLoading={overrideMutation.isPending}
                  >
                    <Shield className="h-4 w-4" />
                    Terapkan Override
                  </Button>
                </div>
              </div>

              <div className="bg-neo-blue/10 relative overflow-visible rounded-xl border-2 border-black p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border-2 border-black bg-white p-2">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-black">Pindah Zona</h4>

                    <p className="mt-1 text-xs font-medium text-slate-600">
                      Pindahkan tanggung jawab laporan ke kecamatan lain.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <WilayahSelect
                      wilayah={wilayah}
                      value={reassignZone}
                      onChange={onReassignZoneChange}
                      placeholder={wilayahLoading ? 'Memuat kecamatan...' : 'Pilih Kecamatan Baru'}
                      disabled={wilayahLoading}
                      className="w-full"
                    />
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onReassign}
                    disabled={!reassignZone || wilayahLoading}
                    isLoading={reassignMutation.isPending}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Pindahkan
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
