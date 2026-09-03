import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export async function fetchMyReports() {
  const res = await api.get('/reports/my');

  return res.data.result?.data || [];
}

export function useMyReports() {
  return useQuery({
    queryKey: ['my-reports'],
    queryFn: fetchMyReports,
  });
}

export async function fetchReportDetail({ id, isAuthenticated, userRole }) {
  if (!id) {
    throw new Error('Report ID tidak ditemukan');
  }

  // Guest / Admin -> public
  if (!isAuthenticated || userRole !== 'user') {
    const res = await api.get(`/reports/public/${id}`);

    return res.data.result;
  }

  // User -> coba laporan miliknya
  try {
    const res = await api.get(`/reports/my/${id}`);

    return res.data.result;
  } catch (error) {
    const status = error?.response?.status;

    // Bukan miliknya / tidak ditemukan -> coba public
    if (status === 403 || status === 404) {
      const res = await api.get(`/reports/public/${id}`);

      return res.data.result;
    }

    throw error;
  }
}

export function useReportDetail({ id, isAuthenticated, userRole }) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () =>
      fetchReportDetail({
        id,
        isAuthenticated,
        userRole,
      }),
    enabled: Boolean(id),
  });
}

export async function fetchPublicReports({ statusFilter = [], categoryFilter = [] }) {
  const params = new URLSearchParams();

  if (statusFilter.length > 0) {
    params.set('status', statusFilter.join(','));
  }

  if (categoryFilter.length > 0) {
    params.set('category_id', categoryFilter.join(','));
  }

  const queryString = params.toString();

  const res = await api.get(`/reports/public${queryString ? `?${queryString}` : ''}`);

  const result = res.data?.result;

  if (!Array.isArray(result)) {
    console.warn('[useReports] Invalid public reports response:', res.data);

    return [];
  }

  return result;
}

export function usePublicReports({ statusFilter, categoryFilter }) {
  return useQuery({
    queryKey: ['public-reports', statusFilter, categoryFilter],
    queryFn: () =>
      fetchPublicReports({
        statusFilter,
        categoryFilter,
      }),
    staleTime: 30_000,
  });
}

export async function upvoteReport(id) {
  if (!id) {
    throw new Error('Report ID tidak ditemukan');
  }

  const res = await api.post(`/reports/${id}/upvotes`);

  return res.data.result;
}

export function useUpvoteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upvoteReport,

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ['report', id],
      });

      queryClient.invalidateQueries({
        queryKey: ['public-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['my-reports'],
      });
    },
  });
}
export async function createReport(formData) {
  const res = await api.post('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.result;
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReport,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-reports'],
      });

      queryClient.invalidateQueries({
        queryKey: ['public-reports'],
      });
    },
  });
}
