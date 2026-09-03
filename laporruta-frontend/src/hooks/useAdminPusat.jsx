import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeArray } from '../components/admin-pusat/utilsPusat';
import { api } from '@/lib/api';

export async function fetchAdminList() {
  const res = await api.get('/admin/users/admins');

  return normalizeArray(res.data.result);
}

export function useAdminList({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-list'],
    queryFn: fetchAdminList,
    enabled,
    staleTime: 30 * 1000,
  });
}

export async function fetchAdminInvitations() {
  const res = await api.get('/admin/users/invitations');

  return normalizeArray(res.data.result);
}

export function useAdminInvitations({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-invitations'],
    queryFn: fetchAdminInvitations,
    enabled,
    staleTime: 30 * 1000,
  });
}

export async function fetchAdminPusatStats() {
  const res = await api.get('/admin/pusat/stats');

  return res.data.result;
}

export function useAdminPusatStats({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminPusatStats,
    enabled,
    staleTime: 60 * 1000,
  });
}

export async function inviteAdmin(data) {
  const res = await api.post('/admin/users/invitations', data);

  return res.data.result;
}

export function useInviteAdmin(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteAdmin,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-invitations'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error('Failed to invite admin:', error?.response?.data || error);

      options.onError?.(error, variables, context);
    },
  });
}

export async function toggleAdminStatus({ id, is_active }) {
  const res = await api.patch(`/admin/users/${id}/status`, {
    is_active,
  });

  return res.data.result;
}

export function useToggleAdminStatus(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAdminStatus,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-list'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error('Failed to toggle admin:', error?.response?.data || error);

      options.onError?.(error, variables, context);
    },
  });
}

export async function exportAdminPusatCSV() {
  const res = await api.get('/admin/pusat/exports/csv', {
    responseType: 'blob',
  });

  return res.data;
}

export function useExportAdminPusatCSV(options = {}) {
  return useMutation({
    mutationFn: exportAdminPusatCSV,

    onSuccess: (data, variables, context) => {
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error('Failed to export CSV:', error?.response?.data || error);

      options.onError?.(error, variables, context);
    },
  });
}

export async function fetchAdminPusatReports(activeReportTab = 'all') {
  if (activeReportTab === 'zoneless') {
    const res = await api.get('/admin/pusat/reports/zoneless');

    return normalizeArray(res.data.result);
  }

  const params = new URLSearchParams();

  if (activeReportTab !== 'all') {
    params.set('status', activeReportTab);
  }

  params.set('sort', 'priority');
  params.set('page', '1');
  params.set('limit', '20');

  const res = await api.get(`/admin/pusat/reports?${params.toString()}`);

  return normalizeArray(res.data.result);
}

export function useAdminPusatReports({ activeReportTab = 'all', enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-pusat-reports', activeReportTab],
    queryFn: () => fetchAdminPusatReports(activeReportTab),
    enabled,
    staleTime: 30 * 1000,
  });
}

export async function fetchAdminPusatReportDetail(id) {
  if (!id) {
    throw new Error('Report ID tidak ditemukan');
  }

  const res = await api.get(`/admin/pusat/reports/${id}`);

  return res.data.result;
}

export function useAdminPusatReportDetail({ id, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-pusat-report-detail', id],
    queryFn: () => fetchAdminPusatReportDetail(id),
    enabled: Boolean(id) && enabled,
    staleTime: 30 * 1000,
  });
}

export async function overrideReportStatus({ id, status, reason }) {
  const res = await api.patch(`/admin/pusat/reports/${id}/status`, {
    status,
    reason,
  });

  return res.data.result;
}

export function useOverrideReportStatus(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: overrideReportStatus,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-pusat-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-pusat-report-detail', variables.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-stats'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error('Failed to override report status:', error?.response?.data || error);

      options.onError?.(error, variables, context);
    },
  });
}

export async function reassignReportZone({ id, wilayah_id }) {
  const res = await api.put(`/admin/pusat/reports/${id}/zone`, {
    wilayah_id,
  });

  return res.data.result;
}

export function useReassignReportZone(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reassignReportZone,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-pusat-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-pusat-report-detail', variables.id],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error('Failed to reassign report:', error?.response?.data || error);

      options.onError?.(error, variables, context);
    },
  });
}

export async function editAdminReport({ id, data }) {
  console.log('[EDIT REPORT] ID:', id);
  console.log('[EDIT REPORT] PAYLOAD:', data);

  const res = await api.put(`/admin/pusat/reports/${id}`, data);

  return res.data.result;
}

export function useEditAdminReport(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editAdminReport,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-pusat-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-pusat-report-detail', variables.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-stats'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error('[EDIT REPORT] ERROR:', error?.response?.data || error);

      options.onError?.(error, variables, context);
    },
  });
}
