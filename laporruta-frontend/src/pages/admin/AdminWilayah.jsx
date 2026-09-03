import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SummaryCard } from '@/components/admin-wilayah/SummaryCard';
import ReportDetailPanel from '@/components/admin-wilayah/ReportDetailPanel';
import {
  useAdminWilayahReports,
  useAdminWilayahReportDetail,
  useVerifyAdminWilayahReport,
  useRejectAdminWilayahReport,
  useUpdateAdminWilayahReportStatus,
  useAddAdminWilayahReportNote,
  useUploadAdminWilayahAfterImages,
} from '@/hooks/useAdminWilayah';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Flame,
  MapPin,
  MessageSquare,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const TABS = [
  {
    key: 'pending_verification',
    label: 'Menunggu Verifikasi',
    shortLabel: 'Menunggu',
  },
  {
    key: 'verified',
    label: 'Terverifikasi',
    shortLabel: 'Terverifikasi',
  },
  {
    key: 'in_progress',
    label: 'Sedang Dikerjakan',
    shortLabel: 'Dikerjakan',
  },
  {
    key: 'resolved',
    label: 'Selesai',
    shortLabel: 'Selesai',
  },
  {
    key: 'rejected',
    label: 'Ditolak',
    shortLabel: 'Ditolak',
  },
];

export function AdminWilayah() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending_verification');

  const [expandedReport, setExpandedReport] = useState(null);

  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  const [statusNote, setStatusNote] = useState('');

  const [internalNote, setInternalNote] = useState('');

  const [afterImages, setAfterImages] = useState([]);

  const {
    data: reports = [],
    isLoading,
    isFetching,
  } = useAdminWilayahReports({
    activeTab,
  });

  const {
    data: reportDetail,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useAdminWilayahReportDetail({
    id: expandedReport,
  });
  const verifyMutation = useVerifyAdminWilayahReport();

  const rejectMutation = useRejectAdminWilayahReport({
    onSuccess: () => {
      setRejectingId(null);
      setRejectionReason('');
    },
  });

  const statusMutation = useUpdateAdminWilayahReportStatus({
    onSuccess: () => {
      setStatusNote('');
    },
  });

  const noteMutation = useAddAdminWilayahReportNote({
    onSuccess: () => {
      setInternalNote('');
    },
  });

  const afterImageMutation = useUploadAdminWilayahAfterImages({
    onSuccess: () => {
      setAfterImages([]);
    },
  });

  const handleVerify = (reportId) => {
    verifyMutation.mutate(reportId);
  };

  const handleReject = (reportId) => {
    const reason = rejectionReason.trim();

    if (reason.length < 10) {
      return;
    }

    rejectMutation.mutate({
      reportId,
      reason,
    });
  };

  const handleStatusUpdate = (reportId, newStatus) => {
    statusMutation.mutate({
      reportId,
      status: newStatus,
      note: statusNote.trim(),
    });
  };

  const handleAddNote = (reportId) => {
    const note = internalNote.trim();

    if (!note) {
      return;
    }

    noteMutation.mutate({
      reportId,
      note,
    });
  };

  const handleToggleDetail = (reportId) => {
    if (expandedReport === reportId) {
      setExpandedReport(null);
      setStatusNote('');
      setInternalNote('');
      setAfterImages([]);
      return;
    }

    setExpandedReport(reportId);
    setStatusNote('');
    setInternalNote('');
    setAfterImages([]);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  const totalReports = reports.length;

  const highPriorityCount = reports.filter((report) => Number(report.priority_score) >= 30).length;

  const unreadCount = reports.filter((report) => report.is_unread).length;

  const totalUpvotes = reports.reduce(
    (total, report) => total + (Number(report.upvote_count) || 0),
    0
  );

  const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label || 'Laporan';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-neo-yellow rounded-full border-2 border-black px-3 py-1 text-xs font-black uppercase">
              Admin Wilayah
            </span>

            {isFetching && (
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Memperbarui...
              </span>
            )}
          </div>

          <h2 className="font-display text-3xl font-black">Dashboard Wilayah</h2>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Kelola dan pantau laporan di zona tugasmu.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <MapPin className="h-3.5 w-3.5" />

            <span>
              Zona:{' '}
              <span className="text-black">
                {user?.assigned_wilayah_name || user?.assigned_wilayah_id}
              </span>
            </span>
          </div>
        </div>

        <div className="shadow-neo-sm rounded-xl border-2 border-black bg-white px-4 py-3">
          <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
            Antrian Aktif
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="font-display bg-neo-yellow flex h-10 min-w-10 items-center justify-center rounded-full border-2 border-black px-2 text-xl font-black">
              {totalReports}
            </span>

            <span className="text-sm font-bold text-slate-500">laporan</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<FileText className="h-5 w-5" />}
          label={`Total ${activeTabLabel}`}
          value={totalReports}
          description="Dalam antrian ini"
        />

        <SummaryCard
          icon={<Flame className="h-5 w-5" />}
          label="Prioritas Tinggi"
          value={highPriorityCount}
          description="Skor ≥ 30"
          accent="yellow"
        />

        <SummaryCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Belum Dibaca"
          value={unreadCount}
          description="Perlu perhatian"
          accent="purple"
        />

        <SummaryCard
          icon={<Flame className="h-5 w-5" />}
          label="Total Dukungan"
          value={totalUpvotes}
          description="Dari laporan"
          accent="pink"
        />
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setExpandedReport(null);
                }}
                className={`font-display rounded-xl border-2 border-black px-4 py-2.5 text-sm font-bold transition-all ${
                  isActive ? 'bg-neo-yellow shadow-neo-sm' : 'hover:bg-neo-canvas bg-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report) => {
          const isExpanded = expandedReport === report.id;
          const isRejecting = rejectingId === report.id;

          const priorityScore = Number(report.priority_score) || 0;

          return (
            <Card
              key={report.id}
              padding={isExpanded ? 'large' : 'normal'}
              className={`overflow-hidden transition-all ${
                isExpanded ? 'ring-neo-purple shadow-neo ring-2' : ''
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge status={report.status} />

                      {report.category?.name && (
                        <span
                          className="rounded-full border-2 border-black px-2.5 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: report.category?.color || '#3A86EF',
                          }}
                        >
                          {report.category.name}
                        </span>
                      )}

                      <span
                        className={`flex items-center gap-1 rounded-full border-2 border-black px-2.5 py-1 text-xs font-bold ${
                          priorityScore >= 30 ? 'bg-neo-yellow' : 'bg-neo-canvas'
                        }`}
                      >
                        <Flame className="text-neo-pink h-3 w-3" />

                        {priorityScore.toFixed(1)}
                      </span>

                      {report.is_unread && (
                        <span className="bg-neo-purple rounded-full border-2 border-black px-2.5 py-1 text-xs font-black text-white">
                          BARU
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl leading-tight font-black">
                      {report.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed font-medium text-slate-700">
                      {report.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                      {report.address_text && (
                        <span className="flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                          <span className="line-clamp-1">{report.address_text}</span>
                        </span>
                      )}

                      {report.created_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />

                          {formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      )}

                      {report.reporter?.full_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />

                          {report.reporter.full_name}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" />
                        {Number(report.upvote_count) || 0} dukungan
                      </span>

                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {Number(report.comment_count) || 0} komentar
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                    {report.status === 'pending_verification' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleVerify(report.id)}
                          isLoading={
                            verifyMutation.isPending && verifyMutation.variables === report.id
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                          Verifikasi
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setRejectingId(isRejecting ? null : report.id);
                            setRejectionReason('');
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                          Tolak
                        </Button>
                      </>
                    )}

                    {report.status === 'verified' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusUpdate(report.id, 'in_progress')}
                        isLoading={
                          statusMutation.isPending &&
                          statusMutation.variables?.reportId === report.id
                        }
                      >
                        <ArrowRight className="h-4 w-4" />
                        Kerjakan
                      </Button>
                    )}

                    {report.status === 'in_progress' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        isLoading={
                          statusMutation.isPending &&
                          statusMutation.variables?.reportId === report.id
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                        Selesaikan
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => handleToggleDetail(report.id)}>
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Tutup
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Detail
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isRejecting && (
                  <div className="bg-neo-red/10 rounded-xl border-2 border-black p-4">
                    <div className="mb-3 flex items-start gap-2">
                      <AlertTriangle className="text-neo-red mt-0.5 h-5 w-5 shrink-0" />

                      <div>
                        <p className="font-display text-neo-red text-sm font-black">
                          Tolak laporan
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-600">
                          Jelaskan alasan penolakan agar warga memahami keputusan admin.
                        </p>
                      </div>
                    </div>

                    <Input
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Contoh: Foto tidak cukup jelas untuk memverifikasi laporan..."
                      className="mb-2 bg-white"
                    />

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-500">
                        {rejectionReason.length} karakter
                        {rejectionReason.length < 10 && ' • minimal 10'}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason('');
                          }}
                        >
                          Batal
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(report.id)}
                          disabled={rejectionReason.trim().length < 10}
                          isLoading={
                            rejectMutation.isPending &&
                            rejectMutation.variables?.reportId === report.id
                          }
                        >
                          <XCircle className="h-4 w-4" />
                          Konfirmasi Tolak
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <ReportDetailPanel
                    report={reportDetail}
                    isLoading={isDetailLoading}
                    isFetching={isDetailFetching}
                    statusNote={statusNote}
                    setStatusNote={setStatusNote}
                    internalNote={internalNote}
                    setInternalNote={setInternalNote}
                    afterImages={afterImages}
                    setAfterImages={setAfterImages}
                    onStatusUpdate={handleStatusUpdate}
                    onAddNote={handleAddNote}
                    onUploadAfterImages={(images) =>
                      afterImageMutation.mutate({
                        reportId: report.id,
                        images,
                      })
                    }
                    isStatusUpdating={
                      statusMutation.isPending && statusMutation.variables?.reportId === report.id
                    }
                    isAddingNote={
                      noteMutation.isPending && noteMutation.variables?.reportId === report.id
                    }
                    isUploadingAfterImages={afterImageMutation.isPending}
                  />
                )}
              </div>
            </Card>
          );
        })}

        {!reports.length && (
          <Card className="p-10 text-center">
            <div className="bg-neo-canvas mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-black">
              <CheckCircle className="h-7 w-7" />
            </div>

            <h3 className="font-display mt-4 text-lg font-black">Tidak ada laporan</h3>

            <p className="mx-auto mt-1 max-w-md text-sm font-medium text-slate-500">
              Tidak ada laporan dengan status <span className="font-bold">{activeTabLabel}</span> di
              wilayah tugasmu saat ini.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
