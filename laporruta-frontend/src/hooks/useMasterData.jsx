import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { normalizeArray } from '../components/admin-pusat/utilsPusat';

export async function fetchCategories() {
  const res = await api.get('/master/categories');

  return normalizeArray(res.data.result);
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export async function fetchWilayah() {
  const res = await api.get('/master/wilayah');

  return normalizeArray(res.data.result);
}

export function useWilayah() {
  return useQuery({
    queryKey: ['wilayah'],
    queryFn: fetchWilayah,
    staleTime: 5 * 60 * 1000,
  });
}
