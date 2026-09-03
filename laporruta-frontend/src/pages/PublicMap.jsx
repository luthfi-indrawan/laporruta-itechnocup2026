import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { usePublicReports } from '@/hooks/useReports';
import { useCategories } from '@/hooks/useMasterData';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import {
  Filter,
  MapPin,
  Flame,
  X,
  FileText,
  CheckCircle2,
  Clock3,
  CircleCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import { MarkerCluster } from '@/components/map/MarkerCluster';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 12;

function MapBoundsHandler({ onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();

      if (onBoundsChange) {
        onBoundsChange(bounds);
      }
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
}

function formatDate(dateString) {
  if (!dateString) return '-';

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return '-';
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'verified':
      return 'Terverifikasi';

    case 'in_progress':
      return 'Dikerjakan';

    case 'resolved':
      return 'Selesai';

    case 'pending':
      return 'Menunggu';

    case 'rejected':
      return 'Ditolak';

    default:
      return status || 'Tidak diketahui';
  }
}

function StatusIcon({ status, className = 'h-4 w-4' }) {
  switch (status) {
    case 'verified':
      return <CheckCircle2 className={className} />;

    case 'in_progress':
      return <Clock3 className={className} />;

    case 'resolved':
      return <CircleCheck className={className} />;

    default:
      return <AlertTriangle className={className} />;
  }
}

function StatusBadge({ status }) {
  const config = {
    verified: {
      label: 'Terverifikasi',
      className: 'bg-blue-100 text-blue-800',
    },

    in_progress: {
      label: 'Dikerjakan',
      className: 'bg-yellow-100 text-yellow-800',
    },

    resolved: {
      label: 'Selesai',
      className: 'bg-green-100 text-green-800',
    },

    pending: {
      label: 'Menunggu',
      className: 'bg-slate-100 text-slate-800',
    },

    rejected: {
      label: 'Ditolak',
      className: 'bg-red-100 text-red-800',
    },
  };

  const current = config[status] || {
    label: getStatusLabel(status),
    className: 'bg-slate-100 text-slate-800',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-black px-2.5 py-1 text-xs font-black ${current.className}`}
    >
      <StatusIcon status={status} className="h-3 w-3" />

      {current.label}
    </span>
  );
}

function RecentReportCard({ report, onClick }) {
  return (
    <button type="button" onClick={() => onClick?.(report)} className="group w-full text-left">
      <Card className="overflow-hidden transition-transform duration-200 hover:-translate-y-1">
        {report.thumbnail_url ? (
          <div className="relative h-40 overflow-hidden border-b-3 border-black">
            <img
              src={report.thumbnail_url}
              alt={report.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            <div className="absolute top-3 left-3">
              <span
                className="shadow-neo-sm rounded-full border-2 border-black px-2.5 py-1 text-xs font-black"
                style={{
                  backgroundColor: report.category_color || '#3B82F6',
                }}
              >
                {report.category_name || 'Lainnya'}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex h-40 items-center justify-center border-b-3 border-black"
            style={{
              backgroundColor: report.category_color ? `${report.category_color}25` : '#E5E7EB',
            }}
          >
            <MapPin className="h-12 w-12 text-slate-400" />
          </div>
        )}

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <StatusBadge status={report.status} />

            <span className="text-xs font-bold text-slate-500">
              {formatDate(report.created_at)}
            </span>
          </div>

          <h3 className="font-display line-clamp-1 text-base font-black">{report.title}</h3>

          <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-600">
            {report.address_text || 'Lokasi tersedia di peta'}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-black">
              <Flame className="text-neo-pink h-4 w-4" />
              {Number(report.upvote_count || 0)} dukungan
            </div>

            <span className="flex items-center gap-1 text-xs font-black">
              Detail
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Card>
    </button>
  );
}

export function PublicMap() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { isAuthenticated, user } = useAuth();

  const [selectedReport, setSelectedReport] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const statusFilter = searchParams.get('status')
    ? searchParams.get('status').split(',').filter(Boolean)
    : [];

  const categoryFilter = searchParams.get('category_id')
    ? searchParams.get('category_id').split(',').filter(Boolean)
    : [];

  const {
    data: reports = [],
    isLoading: reportsLoading,
    isError: reportsError,
  } = usePublicReports({
    statusFilter,
    categoryFilter,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const stats = useMemo(() => {
    const total = reports.length;

    const verified = reports.filter((report) => report.status === 'verified').length;

    const inProgress = reports.filter((report) => report.status === 'in_progress').length;

    const resolved = reports.filter((report) => report.status === 'resolved').length;

    const totalUpvotes = reports.reduce((sum, report) => sum + Number(report.upvote_count || 0), 0);

    return {
      total,
      verified,
      inProgress,
      resolved,
      totalUpvotes,
    };
  }, [reports]);

  const categorySummary = useMemo(() => {
    const map = new Map();

    reports.forEach((report) => {
      const categoryId = report.category_id;

      if (!categoryId) return;

      if (map.has(categoryId)) {
        map.get(categoryId).count += 1;
      } else {
        map.set(categoryId, {
          id: categoryId,
          name: report.category_name || 'Lainnya',
          color: report.category_color || '#3B82F6',
          icon: report.category_icon,
          count: 1,
        });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reports]);

  const recentReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  }, [reports]);

  const toggleFilter = (type, value) => {
    const current = searchParams.get(type)?.split(',').filter(Boolean) || [];

    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    const newParams = new URLSearchParams(searchParams);

    if (updated.length > 0) {
      newParams.set(type, updated.join(','));
    } else {
      newParams.delete(type);
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    newParams.delete('status');
    newParams.delete('category_id');

    setSearchParams(newParams);
  };

  const handleMarkerClick = useCallback((report) => {
    setSelectedReport(report);
  }, []);

  const handleBoundsChange = useCallback(() => {}, []);

  if (reportsLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] space-y-6">
        <div className="h-64 animate-pulse rounded-3xl border-3 border-black bg-slate-200" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border-3 border-black bg-slate-200"
            />
          ))}
        </div>

        <div className="h-[650px] animate-pulse rounded-2xl border-3 border-black bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="bg-neo-yellow shadow-neo-lg relative overflow-hidden rounded-3xl border-3 border-black p-6 md:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="shadow-neo-sm mb-3 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1.5 text-xs font-black">
            <MapPin className="h-4 w-4" />
            LaporRuta
          </div>

          <h1 className="font-display text-3xl leading-tight font-black md:text-5xl">
            Lihat masalah di sekitar,
            <br />
            <span className="text-neo-purple">laporkan & ikut selesaikan.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed font-bold text-slate-800 md:text-base">
            Pantau laporan masyarakat secara langsung, temukan masalah di lingkunganmu, dan bantu
            mendorong penyelesaiannya.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isAuthenticated && user?.role === 'user' ? (
              <Link to="/laporkan">
                <Button variant="secondary">
                  <Plus className="h-4 w-4" />
                  Buat Laporan
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="secondary">
                  Mulai Melapor
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <a href="#peta">
              <Button variant="ghost">Lihat Peta</Button>
            </a>
          </div>
        </div>

        <div className="bg-neo-pink absolute -top-10 -right-10 h-40 w-40 rounded-full border-3 border-black md:h-56 md:w-56" />

        <div className="bg-neo-purple absolute right-24 -bottom-16 h-32 w-32 rotate-12 border-3 border-black md:h-40 md:w-40" />

        <div className="absolute top-1/2 right-8 hidden -translate-y-1/2 md:block">
          <MapPin className="h-32 w-32 rotate-[-12deg] stroke-[1.5] text-black" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black tracking-wide text-slate-500 uppercase">
                Total Laporan
              </p>

              <p className="font-display mt-2 text-4xl font-black">{stats.total}</p>
            </div>

            <div className="bg-neo-yellow shadow-neo-sm rounded-xl border-2 border-black p-2">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs font-bold text-slate-500">Seluruh laporan masyarakat</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black tracking-wide text-slate-500 uppercase">
                Terverifikasi
              </p>

              <p className="font-display mt-2 text-4xl font-black">{stats.verified}</p>
            </div>

            <div className="shadow-neo-sm rounded-xl border-2 border-black bg-blue-100 p-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs font-bold text-slate-500">Laporan yang telah diverifikasi</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black tracking-wide text-slate-500 uppercase">
                Sedang Dikerjakan
              </p>

              <p className="font-display mt-2 text-4xl font-black">{stats.inProgress}</p>
            </div>

            <div className="bg-neo-yellow shadow-neo-sm rounded-xl border-2 border-black p-2">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs font-bold text-slate-500">Sedang ditindaklanjuti</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black tracking-wide text-slate-500 uppercase">Selesai</p>

              <p className="font-display mt-2 text-4xl font-black">{stats.resolved}</p>
            </div>

            <div className="shadow-neo-sm rounded-xl border-2 border-black bg-green-100 p-2">
              <CircleCheck className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs font-bold text-slate-500">Masalah yang sudah diselesaikan</p>
        </Card>
      </section>

      {categorySummary.length > 0 && (
        <section>
          <div className="mb-3">
            <p className="text-xs font-black tracking-wider text-slate-500 uppercase">
              Permasalahan
            </p>

            <h2 className="font-display text-2xl font-black">Laporan berdasarkan kategori</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categorySummary.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleFilter('category_id', category.id)}
                className={`shadow-neo-sm rounded-2xl border-3 border-black p-4 text-left transition-transform hover:-translate-y-1 ${
                  categoryFilter.includes(category.id) ? 'bg-neo-purple text-white' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-black"
                    style={{
                      backgroundColor: category.color,
                    }}
                  />

                  <span className="font-display text-2xl font-black">{category.count}</span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm font-black">{category.name}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section id="peta">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black tracking-wider text-slate-500 uppercase">
              Peta Laporan
            </p>

            <h2 className="font-display text-2xl font-black">Masalah di sekitar kita</h2>
          </div>

          <div className="flex items-center gap-2">
            {(statusFilter.length > 0 || categoryFilter.length > 0) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'shadow-neo-md bg-white' : ''}
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="shadow-neo-lg relative h-[650px] overflow-hidden rounded-2xl border-3 border-black">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBoundsHandler onBoundsChange={handleBoundsChange} />

            <MarkerCluster reports={reports} onMarkerClick={handleMarkerClick} />
          </MapContainer>

          {showFilters && (
            <div className="absolute top-4 left-4 z-[1000]">
              <Card className="w-72 space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase">Filter</p>

                    <h3 className="font-display text-lg font-black">Filter Peta</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="hover:bg-neo-canvas rounded-full border-2 border-transparent p-1.5 hover:border-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <p className="mb-2 text-xs font-black text-slate-500 uppercase">Status</p>

                  <div className="flex flex-wrap gap-2">
                    {['verified', 'in_progress', 'resolved'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleFilter('status', status)}
                        className={`rounded-lg border-2 border-black px-2.5 py-1.5 text-xs font-black transition-colors ${
                          statusFilter.includes(status)
                            ? 'bg-neo-yellow'
                            : 'hover:bg-neo-canvas bg-white'
                        }`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-black text-slate-500 uppercase">Kategori</p>

                  {categoriesLoading ? (
                    <p className="text-xs font-bold text-slate-500">Memuat kategori...</p>
                  ) : categories.length === 0 ? (
                    <p className="text-xs font-bold text-slate-500">Tidak ada kategori.</p>
                  ) : (
                    <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleFilter('category_id', category.id)}
                          className={`rounded-lg border-2 border-black px-2 py-1.5 text-xs font-black transition-colors ${
                            categoryFilter.includes(category.id)
                              ? 'bg-neo-purple text-white'
                              : 'hover:bg-neo-canvas bg-white'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {(statusFilter.length > 0 || categoryFilter.length > 0) && (
                  <div className="border-t-2 border-black pt-3">
                    <p className="mb-2 text-xs font-black text-slate-500 uppercase">Filter aktif</p>

                    <p className="text-sm font-bold">
                      {statusFilter.length + categoryFilter.length} filter dipilih
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {selectedReport && (
            <div className="absolute right-4 bottom-4 left-4 z-[1000] md:right-4 md:left-auto md:w-96">
              <Card className="relative overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-3 right-3 z-10 rounded-full border-2 border-transparent bg-white p-1.5 hover:border-black"
                >
                  <X className="h-4 w-4" />
                </button>

                {selectedReport.thumbnail_url && (
                  <div className="h-32 overflow-hidden border-b-3 border-black">
                    <img
                      src={selectedReport.thumbnail_url}
                      alt={selectedReport.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full border-2 border-black px-2.5 py-1 text-xs font-black"
                      style={{
                        backgroundColor: selectedReport.category_color || '#3B86EF',
                      }}
                    >
                      {selectedReport.category_name || 'Lainnya'}
                    </span>

                    <StatusBadge status={selectedReport.status} />
                  </div>

                  <h3 className="font-display mb-1 pr-8 text-lg font-black">
                    {selectedReport.title}
                  </h3>

                  <p className="mb-3 line-clamp-2 text-sm font-medium text-slate-700">
                    {selectedReport.description || 'Tidak ada deskripsi.'}
                  </p>

                  <div className="mb-3 flex items-start gap-2 text-xs font-bold text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>{selectedReport.address_text || 'Lokasi tersedia di peta'}</span>
                  </div>

                  <div className="mb-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-black">
                      <Flame className="text-neo-pink h-4 w-4" />
                      {Number(selectedReport.upvote_count || 0)} dukungan
                    </div>

                    <span className="font-bold text-slate-500">
                      {formatDate(selectedReport.created_at)}
                    </span>
                  </div>

                  <Link to={`/laporan/${selectedReport.id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Lihat Detail
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {!reportsLoading && reports.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
              <Card className="pointer-events-auto mx-4 max-w-sm text-center">
                <MapPin className="mx-auto mb-3 h-10 w-10 text-slate-400" />

                <h3 className="font-display text-lg font-black">Belum ada laporan</h3>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  Belum ada laporan yang sesuai dengan filter yang kamu pilih.
                </p>

                {(statusFilter.length > 0 || categoryFilter.length > 0) && (
                  <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
                    Reset Filter
                  </Button>
                )}
              </Card>
            </div>
          )}

          {isAuthenticated && user?.role === 'user' && (
            <div className="absolute right-4 bottom-4 z-[1000] md:hidden">
              <Link to="/laporkan">
                <Button variant="secondary" className="shadow-neo-lg h-14 w-14 rounded-full p-0">
                  <MapPin className="h-6 w-6" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {reportsError && (
          <p className="mt-2 text-sm font-bold text-red-600">Gagal memuat data laporan.</p>
        )}
      </section>

      {recentReports.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-wider text-slate-500 uppercase">
                Aktivitas Terbaru
              </p>

              <h2 className="font-display text-2xl font-black">Laporan terbaru</h2>
            </div>

            <a
              href="#peta"
              className="hidden items-center gap-1 text-sm font-black hover:underline sm:flex"
            >
              Lihat di peta
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentReports.map((report) => (
              <RecentReportCard key={report.id} report={report} onClick={handleMarkerClick} />
            ))}
          </div>
        </section>
      )}

      {isAuthenticated && user?.role === 'user' && (
        <section className="bg-neo-purple shadow-neo-lg overflow-hidden rounded-3xl border-3 border-black p-6 text-white md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />

                <span className="text-xs font-black tracking-wider uppercase">
                  Jadilah bagian dari perubahan
                </span>
              </div>

              <h2 className="font-display text-2xl font-black md:text-3xl">
                Ada masalah di sekitar kamu?
              </h2>

              <p className="mt-2 text-sm font-bold text-white/80">
                Laporkan sekarang agar masalah tersebut bisa dilihat dan ditindaklanjuti.
              </p>
            </div>

            <Link to="/laporkan">
              <Button variant="secondary" className="w-full md:w-auto">
                <Plus className="h-4 w-4" />
                Buat Laporan
              </Button>
            </Link>
          </div>
        </section>
      )}

      {!isAuthenticated && (
        <section className="shadow-neo-lg rounded-3xl border-3 border-black bg-white p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black tracking-wider text-slate-500 uppercase">
                Peduli lingkungan?
              </p>

              <h2 className="font-display mt-1 text-2xl font-black">
                Punya masalah yang perlu dilaporkan?
              </h2>

              <p className="mt-2 max-w-xl text-sm font-medium text-slate-600">
                Login untuk membuat laporan dan ikut berkontribusi terhadap lingkungan sekitar.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>

              <Link to="/register">
                <Button variant="ghost">Daftar</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
