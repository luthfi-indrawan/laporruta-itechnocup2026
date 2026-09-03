export function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.result)) {
    return value.result;
  }

  if (Array.isArray(value?.result?.data)) {
    return value.result.data;
  }

  return [];
}

export function normalizeId(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value);
}

export function getCategoryId(report) {
  if (!report) {
    return '';
  }

  const categoryId =
    report.category_id ||
    report.category?.id ||
    report.category?.category_id ||
    report.categoryId ||
    '';

  return normalizeId(categoryId);
}

export function getWilayahId(report) {
  if (!report) {
    return '';
  }

  const wilayahId =
    report.wilayah_id || report.wilayah?.id || report.wilayah?.wilayah_id || report.wilayahId || '';

  return normalizeId(wilayahId);
}

export function formatStatus(status) {
  const labels = {
    pending_verification: 'Menunggu Verifikasi',
    verified: 'Terverifikasi',
    in_progress: 'Sedang Dikerjakan',
    resolved: 'Selesai',
    rejected: 'Ditolak',
  };

  return (
    labels[status] ||
    status?.replaceAll('_', ' ')?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
    'Tidak diketahui'
  );
}
