import { CheckCircle, Edit3 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategorySelect } from '@/components/ui/CategorySelect';

import { normalizeId } from './utilsPusat';

export function EditReportForm({
  form,
  categories,
  categoriesLoading,
  onChange,
  onCancel,
  onSubmit,
  isLoading,
}) {
  const categoryValue = normalizeId(form.category_id);

  const categoryExists = categories.some((category) => normalizeId(category.id) === categoryValue);

  return (
    <div className="bg-neo-canvas rounded-xl border-2 border-black p-5">
      <div className="flex items-center gap-2">
        <Edit3 className="h-5 w-5" />

        <h4 className="font-display text-lg font-black">Edit Metadata Laporan</h4>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-black">Judul</label>

          <Input
            value={form.title}
            onChange={(event) =>
              onChange({
                ...form,
                title: event.target.value,
              })
            }
            maxLength={100}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-black">Deskripsi</label>

          <textarea
            value={form.description}
            onChange={(event) =>
              onChange({
                ...form,
                description: event.target.value,
              })
            }
            maxLength={500}
            rows={5}
            className="focus:ring-neo-purple w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-black">Kategori</label>

          <CategorySelect
            ref={null}
            categories={categories}
            value={categoryValue}
            onChange={(value) => {
              if (typeof value === 'string') {
                onChange({
                  ...form,
                  category_id: value,
                });

                return;
              }

              if (value?.target) {
                onChange({
                  ...form,
                  category_id: value.target.value,
                });
              }
            }}
            placeholder={categoriesLoading ? 'Memuat kategori...' : 'Pilih kategori'}
            disabled={categoriesLoading}
            name="category_id"
            error={
              !categoryValue
                ? 'Kategori wajib dipilih'
                : !categoryExists
                  ? 'Kategori tidak ditemukan'
                  : undefined
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-black">Alamat</label>

          <Input
            value={form.address_text}
            onChange={(event) =>
              onChange({
                ...form,
                address_text: event.target.value,
              })
            }
            maxLength={200}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onSubmit}
          isLoading={isLoading}
          disabled={
            !form.title.trim() ||
            !form.description.trim() ||
            !categoryValue ||
            !categoryExists ||
            !form.address_text.trim() ||
            categoriesLoading
          }
        >
          <CheckCircle className="h-4 w-4" />
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
