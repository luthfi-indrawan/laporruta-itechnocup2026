import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Droplets,
  Footprints,
  HelpCircle,
  LampDesk,
  LightbulbOff,
  Waves,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Mapping icon dari backend.
 *
 * Contoh response:
 * {
 *   "name": "Jalan Berlubang",
 *   "icon": "alert-triangle",
 *   "color": "#EF4444"
 * }
 */
const ICON_MAP = {
  'alert-triangle': AlertTriangle,
  'lightbulb-off': LightbulbOff,
  'lamp-off': LampDesk,
  waves: Waves,
  droplets: Droplets,
  footprints: Footprints,
};

/**
 * Fallback icon kalau backend mengirim
 * icon yang belum tersedia di mapping.
 */
function CategoryIcon({ icon, color, size = 'normal' }) {
  const Icon = ICON_MAP[icon] || HelpCircle;

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg border-2 border-black',
        size === 'small' ? 'h-9 w-9' : 'h-10 w-10'
      )}
      style={{
        backgroundColor: color || '#E5E7EB',
      }}
    >
      <Icon className={cn('stroke-[2.5]', size === 'small' ? 'h-4 w-4' : 'h-5 w-5')} />
    </span>
  );
}

export const CategorySelect = forwardRef(function CategorySelect(
  {
    categories = [],
    value = '',
    onChange,
    placeholder = 'Pilih Kategori',
    error,
    disabled = false,
    className,
    name,
  },
  ref
) {
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);

  /*
   * Cari kategori yang sedang dipilih.
   */
  const selectedCategory = categories.find((category) => String(category.id) === String(value));

  /*
   * Close ketika klik di luar.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /*
   * Escape untuk menutup dropdown.
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  /*
   * Pilih kategori.
   */
  const handleSelect = (category) => {
    if (disabled) return;

    onChange?.(category.id);

    setOpen(false);
  };

  /*
   * Keyboard navigation.
   */
  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }

    /*
     * Arrow Down
     */
    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      const currentIndex = categories.findIndex(
        (category) => String(category.id) === String(value)
      );

      const nextIndex = currentIndex < categories.length - 1 ? currentIndex + 1 : 0;

      const nextCategory = categories[nextIndex];

      if (nextCategory) {
        onChange?.(nextCategory.id);
      }
    }

    /*
     * Arrow Up
     */
    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      const currentIndex = categories.findIndex(
        (category) => String(category.id) === String(value)
      );

      const previousIndex = currentIndex > 0 ? currentIndex - 1 : categories.length - 1;

      const previousCategory = categories[previousIndex];

      if (previousCategory) {
        onChange?.(previousCategory.id);
      }
    }

    /*
     * Home
     */
    if (event.key === 'Home') {
      event.preventDefault();

      if (categories[0]) {
        onChange?.(categories[0].id);
      }
    }

    /*
     * End
     */
    if (event.key === 'End') {
      event.preventDefault();

      if (categories.length > 0) {
        onChange?.(categories[categories.length - 1].id);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/*
       * Hidden input.
       *
       * Berguna untuk native form submission
       * dan tetap menyimpan name/value.
       */}
      {name && <input ref={ref} type="hidden" name={name} value={value || ''} readOnly />}

      {/* =================================================
            TRIGGER
        ================================================== */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          /*
           * Base
           */
          'neo-input flex w-full items-center justify-between gap-3 text-left',

          /*
           * Animation
           */
          'transition-all duration-150',

          /*
           * Hover
           */
          !disabled && 'hover:shadow-neo-sm hover:-translate-y-[1px]',

          /*
           * Open
           */
          open && !disabled && 'shadow-neo-md -translate-y-[1px]',

          /*
           * Disabled
           */
          disabled && 'cursor-not-allowed opacity-60',

          /*
           * Error
           */
          error && 'neo-input-error',

          className
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selectedCategory ? (
            <>
              {/* Selected icon */}
              <CategoryIcon
                icon={selectedCategory.icon}
                color={selectedCategory.color}
                size="small"
              />

              {/* Selected category */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900">
                  {selectedCategory.name}
                </p>

                <p className="truncate text-xs font-bold text-slate-500">Kategori kerusakan</p>
              </div>
            </>
          ) : (
            <>
              {/* Placeholder icon */}
              <span className="bg-neo-canvas flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black">
                <HelpCircle className="h-4 w-4 stroke-[2.5]" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-500">{placeholder}</p>
              </div>
            </>
          )}
        </div>

        {/* Arrow */}
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 stroke-[3]',
            'transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* =================================================
            DROPDOWN
        ================================================== */}
      {open && !disabled && (
        <div
          className="shadow-neo-md absolute right-0 left-0 z-[1100] mt-2 overflow-hidden rounded-xl border-2 border-black bg-white"
          role="listbox"
        >
          {/* Header */}
          <div className="bg-neo-yellow flex items-center justify-between border-b-2 border-black px-4 py-2.5">
            <div>
              <p className="text-xs font-black tracking-wide uppercase">Kategori Kerusakan</p>

              <p className="mt-0.5 text-[10px] font-bold text-slate-700">Pilih jenis laporan</p>
            </div>

            <span className="rounded-md border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-black">
              {categories.length}
            </span>
          </div>

          {/* Options */}
          <div className="max-h-72 overflow-y-auto p-2">
            {categories.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <HelpCircle className="mx-auto mb-2 h-7 w-7 text-slate-400" />

                <p className="text-sm font-bold text-slate-500">Belum ada kategori</p>
              </div>
            ) : (
              categories.map((category) => {
                const isSelected = String(category.id) === String(value);

                return (
                  <button
                    key={category.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(category)}
                    className={cn(
                      /*
                       * Base
                       */
                      'group flex w-full items-center gap-3',
                      'rounded-lg',
                      'border-2 border-transparent',
                      'p-2',
                      'text-left',

                      /*
                       * Animation
                       */
                      'transition-all duration-100',

                      /*
                       * Hover
                       */
                      'hover:border-black',
                      'hover:bg-neo-canvas',

                      /*
                       * Selected
                       */
                      isSelected && 'bg-neo-yellow shadow-neo-sm border-black'
                    )}
                  >
                    {/* Icon */}
                    <CategoryIcon icon={category.icon} color={category.color} />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">{category.name}</p>

                      <div className="mt-1 flex items-center gap-2">
                        {/* Color indicator */}
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-black"
                          style={{
                            backgroundColor: category.color || '#E5E7EB',
                          }}
                        />

                        <span className="text-[10px] font-black tracking-wide text-slate-400 uppercase">
                          Kategori
                        </span>
                      </div>
                    </div>

                    {/* Check */}
                    {isSelected && (
                      <div className="bg-neo-green flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
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
});
