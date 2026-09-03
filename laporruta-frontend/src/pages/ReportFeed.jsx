import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryButton } from '@/components/feed/CategoryButton';
import { StatCard } from '@/components/feed/StatCard';
import {
  Flame,
  Filter,
  MapPin,
  Plus,
  Search,
  TrendingUp,
  Clock3,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { usePublicReports } from '@/hooks/useReports';
import { useCategories } from '@/hooks/useMasterData';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ReportCard } from '@/components/report/ReportCard';

const SORT_OPTIONS = [
  {
    id: 'latest',
    label: 'Terbaru',
    icon: Clock3,
  },
  {
    id: 'popular',
    label: 'Populer',
    icon: Flame,
  },
  {
    id: 'progress',
    label: 'Sedang Dikerjakan',
    icon: Loader2,
  },
  {
    id: 'resolved',
    label: 'Selesai',
    icon: CheckCircle2,
  },
];

export function ReportFeed() {
  const { isAuthenticated, user } = useAuth();

  const [sortBy, setSortBy] = useState('latest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const {
    data: reports = [],
    isLoading: reportsLoading,
    isError: reportsError,
    refetch,
  } = usePublicReports({
    statusFilter: [],
    categoryFilter: [],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const filteredReports = useMemo(() => {
    let result = Array.isArray(reports) ? [...reports] : [];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (report) =>
          report.category?.id === selectedCategory || report.category_id === selectedCategory
      );
    }

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((report) => {
        const title = report.title?.toLowerCase() || '';

        const description = report.description?.toLowerCase() || '';

        const address = report.address_text?.toLowerCase() || '';

        const category = report.category?.name?.toLowerCase() || '';

        const wilayah = report.wilayah?.name?.toLowerCase() || '';

        return (
          title.includes(keyword) ||
          description.includes(keyword) ||
          address.includes(keyword) ||
          category.includes(keyword) ||
          wilayah.includes(keyword)
        );
      });
    }

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => Number(b.upvote_count || 0) - Number(a.upvote_count || 0));
        break;

      case 'progress':
        result = result.filter((report) => report.status === 'in_progress');

        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;

      case 'resolved':
        result = result.filter((report) => report.status === 'resolved');

        result.sort(
          (a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
        );
        break;

      case 'latest':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return result;
  }, [reports, selectedCategory, search, sortBy]);

  const statistics = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];

    return {
      total: list.length,

      verified: list.filter((report) => report.status === 'verified').length,

      progress: list.filter((report) => report.status === 'in_progress').length,

      resolved: list.filter((report) => report.status === 'resolved').length,
    };
  }, [reports]);

  if (reportsLoading || categoriesLoading) {
    return (
      <div className="mx-auto max-w-6xl py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />

            <p className="text-sm font-bold text-slate-600">Memuat laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (reportsError) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Card className="p-8 text-center">
          <div className="bg-neo-red mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-white">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h2 className="font-display text-xl font-black">Gagal Memuat Laporan</h2>

          <p className="mt-2 text-sm font-medium text-slate-600">
            Terjadi masalah saat mengambil data laporan.
          </p>

          <Button variant="primary" className="mt-5" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6 md:py-8">
      <section className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="bg-neo-yellow shadow-neo-lg rounded-2xl border-3 border-black p-6 md:p-8">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase">
              <TrendingUp className="h-3.5 w-3.5" />
              Community Feed
            </div>

            <h1 className="font-display text-3xl leading-tight font-black md:text-5xl">
              Apa yang sedang terjadi di kotamu?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed font-medium text-slate-800 md:text-base">
              Pantau laporan warga, temukan masalah di sekitar, dan ikut memberikan dukungan agar
              masalah publik tidak terabaikan.
            </p>

            {isAuthenticated && user?.role === 'user' && (
              <Link to="/laporkan" className="mt-6 inline-block">
                <Button variant="secondary" size="lg">
                  <Plus className="h-5 w-5" />
                  Buat Laporan
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <StatCard value={statistics.total} label="Total Laporan" icon={MapPin} />

          <StatCard value={statistics.progress} label="Sedang Dikerjakan" icon={Loader2} />

          <StatCard value={statistics.resolved} label="Sudah Selesai" icon={CheckCircle2} />
        </div>
      </section>

      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500" />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari laporan, lokasi, atau kategori..."
          className="neo-input w-full pl-12"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = sortBy === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSortBy(option.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border-2 border-black px-4 py-2.5 text-xs font-black uppercase transition-all ${
                active
                  ? 'bg-neo-purple shadow-neo-sm translate-x-[-2px] translate-y-[-2px] text-white'
                  : 'hover:bg-neo-canvas bg-white'
              } `}
            >
              <Icon className="h-4 w-4" />

              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase">
          <Filter className="h-4 w-4" />
          Kategori
        </div>

        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
          <CategoryButton
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          >
            Semua
          </CategoryButton>

          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              active={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </CategoryButton>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,680px)_280px] lg:items-start lg:justify-center">
        <main className="space-y-5">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => <ReportCard key={report.id} report={report} />)
          ) : (
            <Card className="p-10 text-center">
              <div className="bg-neo-yellow mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black">
                <Search className="h-6 w-6" />
              </div>

              <h2 className="font-display text-xl font-black">Tidak ada laporan</h2>

              <p className="mt-2 text-sm font-medium text-slate-600">
                Coba ubah pencarian atau filter yang digunakan.
              </p>

              {(search || selectedCategory !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </Card>
          )}
        </main>

        <aside className="hidden space-y-4 lg:block">
          <Card className="space-y-4 p-5">
            <h2 className="font-display text-lg font-black">Tentang Feed</h2>

            <p className="text-sm leading-relaxed font-medium text-slate-600">
              Feed LaporRuta membantu kamu melihat laporan warga secara lebih mudah dan ikut
              mendukung masalah yang dianggap penting.
            </p>

            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full">
                <MapPin className="h-4 w-4" />
                Lihat di Peta
              </Button>
            </Link>
          </Card>

          {categories.length > 0 && (
            <Card className="space-y-4 p-5">
              <h2 className="font-display text-lg font-black">Kategori</h2>

              <div className="space-y-2">
                {categories.slice(0, 5).map((category) => {
                  const count = reports.filter(
                    (report) =>
                      report.category?.id === category.id || report.category_id === category.id
                  ).length;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className="hover:bg-neo-canvas flex w-full items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-left text-xs font-bold transition-colors"
                    >
                      <span>{category.name}</span>

                      <span className="rounded-full border-2 border-black px-2 py-0.5 text-[10px]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
