export function formatActionType(actionType) {
  const labels = {
    report_created: 'Laporan dibuat',
    pending_verification: 'Menunggu verifikasi',
    verified: 'Laporan diverifikasi',
    rejected: 'Laporan ditolak',
    in_progress: 'Laporan sedang dikerjakan',
    resolved: 'Laporan diselesaikan',
    reopened: 'Laporan dibuka kembali',
    updated: 'Laporan diperbarui',
    assigned: 'Laporan ditugaskan',
    comment_added: 'Komentar ditambahkan',

    zone_changed: 'Zona laporan dipindahkan',
    zone_reassigned: 'Zona laporan dipindahkan',
    status_override: 'Status di-override',
    edited: 'Informasi laporan diperbarui',
  };

  return (
    labels[actionType] ||
    actionType?.replaceAll('_', ' ')?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
    'Aktivitas laporan'
  );
}
