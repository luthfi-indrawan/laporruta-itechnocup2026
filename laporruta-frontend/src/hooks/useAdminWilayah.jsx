import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export async function fetchAdminWilayahReports(activeTab = 'pending_verification') {
  const params = new URLSearchParams();

  params.set('status', activeTab);
  params.set('sort', 'priority');
  params.set('page', '1');
  params.set('limit', '20');

  const res = await api.get(`/admin/wilayah/reports?${params.toString()}`);

  return res.data.result?.data || [];
}

export function useAdminWilayahReports({
  activeTab = 'pending_verification',
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ['admin-wilayah-reports', activeTab],
    queryFn: () => fetchAdminWilayahReports(activeTab),
    enabled,
  });
}

export async function fetchAdminWilayahNote(reportID) {
  const res = await api.get(`/admin/wilayah/reports/${reportID}/notes`);
  return res.data?.result || [];
}

export function useAdminWilayahNote({ id, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-wilayah-note', id],
    queryFn: () => fetchAdminWilayahNote(id),
    enabled: Boolean(id) && enabled,
  });
}

export async function fetchAdminWilayahReportDetail(id) {
  const res = await api.get(`/admin/wilayah/reports/${id}`);

  return res.data.result;
}

export function useAdminWilayahReportDetail({ id, enabled = true } = {}) {
  return useQuery({
    queryKey: ['admin-wilayah-report-detail', id],
    queryFn: () => fetchAdminWilayahReportDetail(id),
    enabled: Boolean(id) && enabled,
  });
}

export async function verifyAdminWilayahReport(reportId) {
  return api.patch(`/admin/wilayah/reports/${reportId}/verify`);
}

export function useVerifyAdminWilayahReport(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyAdminWilayahReport,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-report-detail'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
}

export async function rejectAdminWilayahReport({ reportId, reason }) {
  return api.patch(`/admin/wilayah/reports/${reportId}/reject`, {
    rejection_reason: reason,
  });
}

export function useRejectAdminWilayahReport(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectAdminWilayahReport,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-report-detail'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
}

export async function updateAdminWilayahReportStatus({ reportId, status, note }) {
  return api.patch(`/admin/wilayah/reports/${reportId}/status`, {
    status,
    note,
  });
}

export function useUpdateAdminWilayahReportStatus(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminWilayahReportStatus,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-report-detail'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
}

export async function addAdminWilayahReportNote({ reportId, note }) {
  return api.post(`/admin/wilayah/reports/${reportId}/notes`, {
    note,
  });
}

export function useAddAdminWilayahReportNote(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAdminWilayahReportNote,

    onSuccess: (data, variables, context) => {
      const reportId = variables.reportId;

      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-note', reportId],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-report-detail', reportId],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-reports'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
}

export async function uploadAdminWilayahAfterImages({ reportId, images }) {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append('images', image);
  });

  return api.post(`/admin/wilayah/reports/${reportId}/after-images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function useUploadAdminWilayahAfterImages(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAdminWilayahAfterImages,

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-wilayah-report-detail'],
      });

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
}
