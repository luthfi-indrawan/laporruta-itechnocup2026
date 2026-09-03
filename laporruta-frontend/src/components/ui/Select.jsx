import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleAlert,
  Droplets,
  Footprints,
  HelpCircle,
  LampDesk,
  LightbulbOff,
  MapPin,
  Construction,
  Waves,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  'alert-triangle': AlertTriangle,
  'circle-alert': CircleAlert,

  'lamp-off': LampDesk,
  'lightbulb-off': LightbulbOff,

  waves: Waves,
  droplets: Droplets,

  footprints: Footprints,
  'map-pin': MapPin,

  construction: Construction,
};

function OptionIcon({ icon, color, selected = false, size = 'normal' }) {
  const Icon = typeof icon === 'string' ? ICON_MAP[icon] || HelpCircle : null;

  if (!Icon) {
    return null;
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg border-2 border-black',
        size === 'small' ? 'h-9 w-9' : 'h-10 w-10',
        selected ? 'bg-white' : 'bg-neo-canvas'
      )}
      style={{
        backgroundColor: color || undefined,
      }}
    >
      <Icon className={cn('stroke-[2.5]', size === 'small' ? 'h-4 w-4' : 'h-5 w-5')} />
    </span>
  );
}

export const Select = forwardRef(function Select(
  {
    options = [],
    value = '',
    onChange,
    placeholder = 'Pilih opsi',
    error,
    disabled = false,
    className,
    name,
    id,
    'aria-label': ariaLabel,
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;

  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => String(option.value) === String(value));

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

  const handleSelect = (option) => {
    if (disabled) return;

    onChange?.(option.value);

    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      setOpen((prev) => !prev);

      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      const currentIndex = options.findIndex((option) => String(option.value) === String(value));

      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;

      const nextOption = options[nextIndex];

      if (nextOption) {
        onChange?.(nextOption.value);
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      const currentIndex = options.findIndex((option) => String(option.value) === String(value));

      const previousIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;

      const previousOption = options[previousIndex];

      if (previousOption) {
        onChange?.(previousOption.value);
      }
    }

    if (event.key === 'Home') {
      event.preventDefault();

      if (options[0]) {
        onChange?.(options[0].value);
      }
    }

    if (event.key === 'End') {
      event.preventDefault();

      if (options.length > 0) {
        onChange?.(options[options.length - 1].value);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {name && <input ref={ref} type="hidden" name={name} value={value || ''} readOnly />}

      <button
        id={selectId}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'neo-input flex w-full items-center justify-between gap-3 text-left',

          'transition-all duration-150',

          !disabled && 'hover:shadow-neo-sm hover:-translate-y-[1px]',

          open && !disabled && 'shadow-neo-md -translate-y-[1px]',

          disabled && 'cursor-not-allowed opacity-60',

          error && 'neo-input-error',

          className
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <OptionIcon
                  icon={selectedOption.icon}
                  color={selectedOption.color}
                  selected
                  size="small"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900">{selectedOption.label}</p>

                {selectedOption.description && (
                  <p className="truncate text-xs font-bold text-slate-500">
                    {selectedOption.description}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="bg-neo-canvas flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black">
                <MapPin className="h-4 w-4 stroke-[2.5]" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-500">{placeholder}</p>
              </div>
            </>
          )}
        </div>

        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 stroke-[3]',
            'transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && !disabled && (
        <div
          className="shadow-neo-md absolute right-0 left-0 z-[1100] mt-2 overflow-hidden rounded-xl border-2 border-black bg-white"
          role="listbox"
          aria-labelledby={selectId}
        >
          <div className="bg-neo-yellow flex items-center justify-between border-b-2 border-black px-4 py-2.5">
            <p className="text-xs font-black tracking-wide uppercase">{placeholder}</p>

            <span className="rounded-md border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-black">
              {options.length}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {options.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <HelpCircle className="mx-auto mb-2 h-6 w-6 text-slate-400" />

                <p className="text-sm font-bold text-slate-500">Tidak ada pilihan</p>
              </div>
            ) : (
              options.map((option) => {
                const isSelected = String(option.value) === String(value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'flex w-full items-center gap-3',
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
                    {option.icon && (
                      <OptionIcon icon={option.icon} color={option.color} selected={isSelected} />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">{option.label}</p>

                      {option.description && (
                        <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                          {option.description}
                        </p>
                      )}

                      {option.color && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full border border-black"
                            style={{
                              backgroundColor: option.color,
                            }}
                          />

                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {option.type || 'Kategori'}
                          </span>
                        </div>
                      )}
                    </div>

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
