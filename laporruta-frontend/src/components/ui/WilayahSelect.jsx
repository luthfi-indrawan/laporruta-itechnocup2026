import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, ChevronDown, MapPin, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_LABELS = {
  provinsi: 'Provinsi',
  kabupaten: 'Kabupaten',
  kota: 'Kota',
  kecamatan: 'Kecamatan',
  kelurahan: 'Kelurahan',
  desa: 'Desa',
};

const TYPE_ORDER = ['provinsi', 'kabupaten', 'kota', 'kecamatan', 'kelurahan', 'desa'];

function getTypeLabel(type) {
  return TYPE_LABELS[type?.toLowerCase()] || type || 'Wilayah';
}

function getChildren(items, parentId) {
  return items.filter((item) => String(item.parent_id) === String(parentId));
}

function getProvinceItems(items) {
  return items.filter((item) => item.type?.toLowerCase() === 'provinsi');
}

function sortWilayah(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'id'));
}

export function WilayahSelect({
  wilayah = [],
  value = '',
  onChange,
  placeholder = 'Pilih lokasi administrasi',
  error,
  disabled = false,
  className,
  name,
}) {
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [path, setPath] = useState([]);

  const normalizedWilayah = useMemo(() => {
    return wilayah.map((item) => ({
      ...item,
      type: item.type?.toLowerCase(),
    }));
  }, [wilayah]);

  const selectedWilayah = useMemo(() => {
    return normalizedWilayah.find((item) => String(item.id) === String(value));
  }, [normalizedWilayah, value]);

  const selectedPath = useMemo(() => {
    if (!selectedWilayah) return [];

    const result = [];
    let current = selectedWilayah;

    const visited = new Set();

    while (current && !visited.has(current.id)) {
      visited.add(current.id);

      result.unshift(current);

      if (!current.parent_id) {
        break;
      }

      current = normalizedWilayah.find((item) => String(item.id) === String(current.parent_id));
    }

    return result;
  }, [selectedWilayah, normalizedWilayah]);

  const currentItems = useMemo(() => {
    let items;

    if (path.length === 0) {
      items = getProvinceItems(normalizedWilayah);
    } else {
      const current = path[path.length - 1];

      items = getChildren(normalizedWilayah, current.id);
    }

    if (!search.trim()) {
      return sortWilayah(items);
    }

    const keyword = search.toLowerCase().trim();

    return sortWilayah(items.filter((item) => item.name?.toLowerCase().includes(keyword)));
  }, [normalizedWilayah, path, search]);

  const currentLevelLabel = useMemo(() => {
    if (path.length === 0) {
      return 'Provinsi';
    }

    const current = path[path.length - 1];

    const children = getChildren(normalizedWilayah, current.id);

    if (children.length === 0) {
      return 'Lokasi';
    }

    const childTypes = children
      .map((item) => item.type)
      .sort((a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b));

    return getTypeLabel(childTypes[0]);
  }, [normalizedWilayah, path]);

  const isFinalSelection = (item) => {
    const children = getChildren(normalizedWilayah, item.id);

    return children.length === 0;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setSearch('');
        setPath([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setSearch('');
        setPath([]);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleOpen = () => {
    if (disabled) return;

    setOpen((prev) => !prev);
    setSearch('');
    setPath([]);
  };

  const handleSelect = (item) => {
    if (disabled) return;

    const children = getChildren(normalizedWilayah, item.id);

    if (children.length > 0) {
      setPath((prev) => [...prev, item]);

      setSearch('');

      return;
    }
    onChange?.(item.id);

    setOpen(false);
    setSearch('');
    setPath([]);
  };

  const handleBack = () => {
    if (path.length === 0) return;

    setPath((prev) => prev.slice(0, -1));
    setSearch('');
  };

  const handleBreadcrumbClick = (index) => {
    if (index === path.length - 1) {
      return;
    }

    setPath((prev) => prev.slice(0, index + 1));
    setSearch('');
  };

  const handleClear = (event) => {
    event.stopPropagation();

    onChange?.('');

    setPath([]);
    setSearch('');
  };

  const triggerTitle = selectedPath.length
    ? selectedPath[selectedPath.length - 1].name
    : placeholder;

  const triggerSubtitle =
    selectedPath.length > 1
      ? selectedPath
          .slice(0, -1)
          .map((item) => item.name)
          .join(' / ')
      : selectedPath.length === 1
        ? getTypeLabel(selectedPath[0].type)
        : 'Lokasi laporan';

  return (
    <div ref={containerRef} className="relative w-full">
      {name && <input type="hidden" name={name} value={value || ''} readOnly />}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleOpen}
        className={cn(
          'neo-input flex w-full items-center gap-3 text-left',
          'transition-all duration-150',

          !disabled && 'hover:shadow-neo-sm hover:-translate-y-[1px]',

          open && !disabled && 'shadow-neo-md -translate-y-[1px]',

          disabled && 'cursor-not-allowed opacity-60',

          error && 'neo-input-error',

          className
        )}
      >
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center',
            'rounded-lg border-2 border-black',
            selectedWilayah ? 'bg-neo-yellow' : 'bg-neo-canvas'
          )}
        >
          <MapPin className="h-5 w-5 stroke-[2.5]" />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-sm',
              selectedWilayah ? 'font-black text-slate-900' : 'font-bold text-slate-500'
            )}
          >
            {triggerTitle}
          </p>

          <p className="truncate text-xs font-bold text-slate-500">{triggerSubtitle}</p>
        </div>

        {selectedWilayah && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClear(event);
              }
            }}
            className="hover:bg-neo-red flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white hover:text-white"
          >
            <X className="h-3.5 w-3.5 stroke-[3]" />
          </span>
        )}

        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 stroke-[3]',
            'transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && !disabled && (
        <div className="shadow-neo-md absolute right-0 left-0 z-[1100] mt-2 overflow-hidden rounded-xl border-2 border-black bg-white">
          <div className="bg-neo-yellow border-b-2 border-black px-4 py-3">
            <div className="flex items-center gap-3">
              {path.length > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="hover:bg-neo-canvas flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white"
                  aria-label="Kembali"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[3]" />
                </button>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black tracking-wide uppercase">Lokasi Administrasi</p>

                <p className="mt-0.5 truncate text-[10px] font-bold text-slate-700">
                  {path.length > 0
                    ? path.map((item) => item.name).join(' / ')
                    : 'Pilih lokasi laporan'}
                </p>
              </div>

              <span className="rounded-md border-2 border-black bg-white px-2 py-1 text-[10px] font-black">
                {currentLevelLabel}
              </span>
            </div>
          </div>

          {path.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto border-b border-black px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  setPath([]);
                  setSearch('');
                }}
                className="shrink-0 text-[10px] font-black text-slate-500 hover:text-black"
              >
                Provinsi
              </button>

              {path.map((item, index) => (
                <div key={item.id} className="flex shrink-0 items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-slate-400" />

                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(index)}
                    className={cn(
                      'max-w-32 truncate text-[10px] font-black',
                      index === path.length - 1 ? 'text-black' : 'text-slate-500 hover:text-black'
                    )}
                  >
                    {item.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-b-2 border-black p-3">
            <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Cari ${currentLevelLabel.toLowerCase()}...`}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-500 hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {currentItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <MapPin className="mx-auto mb-2 h-7 w-7 text-slate-400" />

                <p className="text-sm font-black text-slate-500">Wilayah tidak ditemukan</p>

                {search && (
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Coba gunakan kata kunci lain
                  </p>
                )}
              </div>
            ) : (
              currentItems.map((item) => {
                const children = getChildren(normalizedWilayah, item.id);

                const hasChildren = children.length > 0;

                const isSelected = String(item.id) === String(value);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'group flex w-full items-center gap-3',
                      'rounded-lg',
                      'border-2 border-transparent',
                      'p-2',
                      'text-left',
                      'transition-all duration-100',
                      'hover:border-black',
                      'hover:bg-neo-canvas',

                      isSelected && 'bg-neo-yellow shadow-neo-sm border-black'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center',
                        'rounded-lg border-2 border-black',
                        isSelected ? 'bg-neo-green' : 'bg-white'
                      )}
                    >
                      <MapPin className="h-5 w-5 stroke-[2.5]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">{item.name}</p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-wide text-slate-400 uppercase">
                          {getTypeLabel(item.type)}
                        </span>

                        {item.code && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-400" />

                            <span className="text-[10px] font-bold text-slate-400">
                              {item.code}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="bg-neo-green flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </span>
                    ) : hasChildren ? (
                      <ChevronRight className="h-5 w-5 shrink-0 stroke-[3] text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-black" />
                    ) : (
                      <span className="rounded-md border border-slate-300 px-1.5 py-0.5 text-[9px] font-black text-slate-400 uppercase">
                        Pilih
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
