import { useState } from 'react';
import {
  useAdminList,
  useAdminInvitations,
  useAdminPusatStats,
  useInviteAdmin,
  useToggleAdminStatus,
  useExportAdminPusatCSV,
  useAdminPusatReports,
  useAdminPusatReportDetail,
  useOverrideReportStatus,
  useReassignReportZone,
  useEditAdminReport,
} from '@/hooks/useAdminPusat';
import { useCategories, useWilayah } from '@/hooks/useMasterData';
import { normalizeId, getCategoryId } from '../../components/admin-pusat/utilsPusat';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

import { Button } from '@/components/ui/Button';

import { StatisticsSection } from '../../components/admin-pusat/StatisticsSection';

import { ReportCard } from '../../components/admin-pusat/ReportCard';
import {
  CheckCircle,
  Users,
  BarChart3,
  Download,
  AlertTriangle,
  RefreshCw,
  FileText,
  Activity,
} from 'lucide-react';

import { AdminManagement } from '../../components/admin-pusat/AdminManagement';
import {
  SummaryCard,
  LoadingState,
  EmptyReports,
} from '../../components/admin-pusat/AdminPusatShared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const REPORT_TABS = [
  {
    key: 'all',
    label: 'Semua Laporan',
  },
  {
    key: 'pending_verification',
    label: 'Menunggu Verifikasi',
  },
  {
    key: 'zoneless',
    label: 'Zona Tanpa Admin',
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

const ADMIN_TABS = [
  {
    key: 'reports',
    label: 'Laporan',
    icon: FileText,
  },
  {
    key: 'admins',
    label: 'Kelola Admin',
    icon: Users,
  },
  {
    key: 'stats',
    label: 'Statistik',
    icon: BarChart3,
  },
];

export function AdminPusat() {
  const queryClient = useQueryClient();
  const [activeMainTab, setActiveMainTab] = useState('reports');

  const [activeReportTab, setActiveReportTab] = useState('all');

  const [expandedReport, setExpandedReport] = useState(null);

  const [overrideStatus, setOverrideStatus] = useState('');

  const [overrideReason, setOverrideReason] = useState('');

  const [reassignZone, setReassignZone] = useState('');

  const [editingReport, setEditingReport] = useState(null);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category_id: '',
    address_text: '',
  });

  const [newAdminEmail, setNewAdminEmail] = useState('');

  const [newAdminRole, setNewAdminRole] = useState('admin_wilayah');

  const [newAdminWilayah, setNewAdminWilayah] = useState('');
  const [togglingAdminId, setTogglingAdminId] = useState(null);

  const {
    data: reports = [],
    isLoading: reportsLoading,
    isFetching: reportsFetching,
    isError: reportsError,
    refetch: refetchReports,
  } = useAdminPusatReports({
    activeReportTab,
    enabled: activeMainTab === 'reports',
  });

  const {
    data: reportDetail,
    isLoading: detailLoading,
    isError: detailError,
  } = useAdminPusatReportDetail({
    id: expandedReport,
  });

  const { data: adminList = [], isLoading: adminsLoading } = useAdminList({
    enabled: activeMainTab === 'admins',
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useAdminInvitations({
    enabled: activeMainTab === 'admins',
  });

  const { data: stats, isLoading: statsLoading } = useAdminPusatStats({
    enabled: activeMainTab === 'stats' || activeMainTab === 'reports',
  });

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const { data: wilayah = [], isLoading: wilayahLoading } = useWilayah();

  const overrideMutation = useOverrideReportStatus({
    onSuccess: () => {
      setOverrideStatus('');
      setOverrideReason('');
    },
  });

  const reassignMutation = useReassignReportZone({
    onSuccess: () => {
      setReassignZone('');
    },
  });

  const editMutation = useEditAdminReport({
    onSuccess: () => {
      setEditingReport(null);
    },
  });

  const [createdInvitation, setCreatedInvitation] = useState(null);

  const inviteMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/admin/users/invitations', payload);

      return response.data;
    },

    onSuccess: (response) => {
      console.log('CREATE INVITATION RESPONSE:', response);

      const result = response?.result;

      if (!result) {
        console.error('Create invitation response tidak memiliki result:', response);

        return;
      }

      setCreatedInvitation({
        invitation_id: result.invitation_id,
        token: result.token,
        invite_url: result.invite_url,
        expires_at: result.expires_at,
      });

      // Refresh riwayat invitation
      queryClient.invalidateQueries({
        queryKey: ['admin-invitations'],
      });
    },

    onError: (error) => {
      console.error('CREATE INVITATION ERROR:', error?.response?.data || error);
    },
  });

  const toggleAdminMutation = useToggleAdminStatus();

  const handleExpandReport = (id) => {
    if (expandedReport === id) {
      setExpandedReport(null);
      setOverrideStatus('');
      setOverrideReason('');
      setReassignZone('');
      setEditingReport(null);

      return;
    }

    setExpandedReport(id);
    setOverrideStatus('');
    setOverrideReason('');
    setReassignZone('');
    setEditingReport(null);
  };

  const handleOverride = (id) => {
    if (!overrideStatus) {
      return;
    }

    if (!overrideReason.trim()) {
      return;
    }

    overrideMutation.mutate({
      id,
      status: overrideStatus,
      reason: overrideReason.trim(),
    });
  };

  const handleReassign = (id) => {
    if (!reassignZone) {
      return;
    }

    reassignMutation.mutate({
      id,
      wilayah_id: reassignZone,
    });
  };

  const handleStartEdit = (report) => {
    const categoryId = getCategoryId(report);

    console.log('[EDIT REPORT] Source report:', report);

    console.log('[EDIT REPORT] Resolved category_id:', categoryId);

    setEditingReport(report.id);

    setEditForm({
      title: report.title ?? '',
      description: report.description ?? '',
      category_id: categoryId,
      address_text: report.address_text ?? '',
    });
  };

  const handleEditFormChange = (nextForm) => {
    setEditForm(nextForm);
  };

  const handleEditSubmit = (id) => {
    const title = editForm.title.trim();
    const description = editForm.description.trim();
    const categoryId = normalizeId(editForm.category_id);
    const addressText = editForm.address_text.trim();

    if (!title) {
      console.warn('[EDIT REPORT] title kosong');
      return;
    }

    if (!description) {
      console.warn('[EDIT REPORT] description kosong');
      return;
    }

    if (!categoryId) {
      console.warn('[EDIT REPORT] category_id kosong');
      return;
    }

    if (!addressText) {
      console.warn('[EDIT REPORT] address_text kosong');
      return;
    }

    const selectedCategory = categories.find((category) => normalizeId(category.id) === categoryId);

    if (!selectedCategory) {
      console.warn('[EDIT REPORT] category_id tidak ditemukan di master:', categoryId);

      return;
    }

    const payload = {
      title,
      description,
      category_id: categoryId,
      address_text: addressText,
    };

    console.log('========================================');

    console.log('[EDIT REPORT] SUBMIT');

    console.log('[EDIT REPORT] report_id:', id);

    console.log('[EDIT REPORT] payload:', payload);

    console.log('[EDIT REPORT] category_id:', payload.category_id);

    console.log('========================================');

    editMutation.mutate({
      id,
      data: payload,
    });
  };

  const handleInvite = (event) => {
    event.preventDefault();

    inviteMutation.mutate({
      email: newAdminEmail.trim(),
      role: newAdminRole,
      ...(newAdminRole === 'admin_wilayah'
        ? {
            assigned_wilayah_id: newAdminWilayah,
          }
        : {}),
    });
  };

  const exportMutation = useExportAdminPusatCSV();

  const exportCSV = async () => {
    try {
      const data = await exportMutation.mutateAsync();

      const blob = new Blob([data], {
        type: 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute('download', `laporan-${new Date().toISOString().split('T')[0]}.csv`);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };
  const handleToggleAdmin = (id, isActive) => {
    setTogglingAdminId(id);

    toggleAdminMutation.mutate(
      {
        id,
        is_active: isActive,
      },
      {
        onSettled: () => {
          setTogglingAdminId(null);
        },
      }
    );
  };

  const totalReports = Number(stats?.total_reports) || 0;

  const pendingReports = Number(stats?.status_breakdown?.pending_verification) || 0;

  const inProgressReports = Number(stats?.status_breakdown?.in_progress) || 0;

  const resolvedReports = Number(stats?.status_breakdown?.resolved) || 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="bg-neo-purple rounded-full border-2 border-black px-3 py-1 text-xs font-black text-white">
              ADMIN PUSAT
            </span>

            <span className="bg-neo-mint flex items-center gap-1 rounded-full border-2 border-black px-3 py-1 text-xs font-black">
              <Activity className="h-3 w-3" />
              Pusat Kendali
            </span>
          </div>

          <h2 className="font-display text-3xl font-black">Dashboard Pusat</h2>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Pantau dan kelola seluruh laporan dari semua wilayah.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchReports()}
            disabled={reportsFetching}
          >
            <RefreshCw className={`h-4 w-4 ${reportsFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="ghost" size="sm" onClick={exportCSV} disabled={exportMutation.isPending}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {activeMainTab === 'reports' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={FileText}
            label="Total Laporan"
            value={totalReports}
            description="Seluruh wilayah"
          />

          <SummaryCard
            icon={AlertTriangle}
            label="Perlu Perhatian"
            value={pendingReports}
            description="Menunggu verifikasi"
          />

          <SummaryCard
            icon={Activity}
            label="Sedang Dikerjakan"
            value={inProgressReports}
            description="Dalam proses"
          />

          <SummaryCard
            icon={CheckCircle}
            label="Selesai"
            value={resolvedReports}
            description={
              stats?.resolution_rate != null
                ? `${stats.resolution_rate}% resolution rate`
                : 'Laporan terselesaikan'
            }
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveMainTab(tab.key);

                if (tab.key !== 'reports') {
                  setExpandedReport(null);
                  setEditingReport(null);
                }
              }}
              className={`font-display flex items-center gap-2 rounded-xl border-2 border-black px-4 py-2 text-sm font-bold transition-all ${
                activeMainTab === tab.key
                  ? 'bg-neo-purple shadow-neo-sm text-white'
                  : 'hover:bg-neo-canvas bg-white'
              }`}
            >
              <Icon className="h-4 w-4" />

              {tab.label}
            </button>
          );
        })}
      </div>

      {activeMainTab === 'reports' && (
        <>
          <Card padding="normal" className="overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {REPORT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveReportTab(tab.key);
                    setExpandedReport(null);
                    setEditingReport(null);
                  }}
                  className={`rounded-lg border-2 border-black px-3 py-1.5 text-xs font-bold transition-all ${
                    activeReportTab === tab.key
                      ? 'bg-neo-yellow shadow-neo-sm'
                      : 'hover:bg-neo-canvas bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {reportsLoading ? (
              <LoadingState />
            ) : reportsError ? (
              <Card className="p-8 text-center">
                <AlertTriangle className="text-neo-red mx-auto h-8 w-8" />

                <p className="font-display mt-3 font-bold">Gagal mengambil laporan.</p>

                <Button variant="ghost" size="sm" className="mt-3" onClick={() => refetchReports()}>
                  Coba Lagi
                </Button>
              </Card>
            ) : (
              reports.map((report) => {
                const isExpanded = expandedReport === report.id;

                const detail = isExpanded && reportDetail?.id === report.id ? reportDetail : null;

                return (
                  <ReportCard
                    key={report.id}
                    report={report}
                    detail={detail}
                    isExpanded={isExpanded}
                    detailLoading={detailLoading}
                    detailError={detailError}
                    overrideStatus={overrideStatus}
                    overrideReason={overrideReason}
                    reassignZone={reassignZone}
                    editingReport={editingReport}
                    editForm={editForm}
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                    wilayah={wilayah}
                    wilayahLoading={wilayahLoading}
                    overrideMutation={overrideMutation}
                    reassignMutation={reassignMutation}
                    editMutation={editMutation}
                    onExpand={() => handleExpandReport(report.id)}
                    onOverrideStatusChange={setOverrideStatus}
                    onOverrideReasonChange={setOverrideReason}
                    onOverride={() => handleOverride(report.id)}
                    onReassignZoneChange={setReassignZone}
                    onReassign={() => handleReassign(report.id)}
                    onStartEdit={() => handleStartEdit(detail || report)}
                    onCancelEdit={() => setEditingReport(null)}
                    onEditFormChange={handleEditFormChange}
                    onEditSubmit={() => handleEditSubmit(report.id)}
                  />
                );
              })
            )}

            {!reportsLoading && !reportsError && !reports.length && <EmptyReports />}
          </div>
        </>
      )}

      {activeMainTab === 'admins' && (
        <AdminManagement
          adminList={adminList}
          adminsLoading={adminsLoading}
          invitations={invitations}
          invitationsLoading={invitationsLoading}
          wilayah={wilayah}
          wilayahLoading={wilayahLoading}

          newAdminEmail={newAdminEmail}
          newAdminRole={newAdminRole}
          newAdminWilayah={newAdminWilayah}

          inviteMutation={inviteMutation}
          togglingAdminId={togglingAdminId}

          createdInvitation={createdInvitation}
          onClearCreatedInvitation={() => setCreatedInvitation(null)}

          onEmailChange={setNewAdminEmail}
          onRoleChange={setNewAdminRole}
          onWilayahChange={setNewAdminWilayah}
          onInvite={handleInvite}
          onToggleAdmin={handleToggleAdmin}
        />
      )}

      {activeMainTab === 'stats' && <StatisticsSection stats={stats} isLoading={statsLoading} />}
    </div>
  );
}
