import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useCategories, useWilayah } from '@/hooks/useMasterData';
import { useCreateReport } from '@/hooks/useReports';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CategorySelect } from '@/components/ui/CategorySelect';
import { WilayahSelect } from '@/components/ui/WilayahSelect';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, Upload, X, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const reportSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(500, 'Deskripsi maksimal 500 karakter'),
  category_id: z.string().uuid('Pilih kategori'),
  address_text: z
    .string()
    .min(5, 'Alamat minimal 5 karakter')
    .max(200, 'Alamat maksimal 200 karakter'),
  wilayah_id: z.string().uuid('Pilih lokasi'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

function LocationPicker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={L.divIcon({
        html: `<div class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-neo-pink shadow-neo-sm"><div class="h-2 w-2 rounded-full bg-white"></div></div>`,
        className: 'custom-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })}
    />
  ) : null;
}

export function CreateReport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [pinLocation, setPinLocation] = useState(null);
  const [miniMapCenter, setMiniMapCenter] = useState([-6.2088, 106.8456]);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(reportSchema) });
  const createReportMutation = useCreateReport();
  const { data: categories = [] } = useCategories();
  const isSubmitting = createReportMutation.isPending;
  const { data: wilayah = [] } = useWilayah();

  const selectedWilayahId = watch('wilayah_id');
  const selectedWilayah = wilayah.find((w) => w.id === selectedWilayahId);

  useEffect(() => {
    if (selectedWilayah?.latitude && selectedWilayah?.longitude) {
      const lat = parseFloat(selectedWilayah.latitude);
      const lng = parseFloat(selectedWilayah.longitude);
      setMiniMapCenter([lat, lng]);
      setPinLocation(null);
    }
  }, [selectedWilayah]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 3) {
      alert('Maksimal 3 gambar');
      return;
    }
    const validFiles = files.filter(
      (f) => f.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png'].includes(f.type)
    );
    setImages((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setSubmitError('');

    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category_id', data.category_id);
    formData.append('wilayah_id', data.wilayah_id);
    formData.append('address_text', data.address_text);

    if (pinLocation) {
      formData.append('lat', pinLocation[0]);
      formData.append('lng', pinLocation[1]);
    }

    images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      await createReportMutation.mutateAsync(formData);

      navigate('/laporan-saya');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Gagal mengirim laporan. Silakan coba lagi.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Card padding="large" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-neo-pink shadow-neo-sm flex h-10 w-10 items-center justify-center rounded-xl border-3 border-black">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-black">Buat Laporan Baru</h2>
            <p className="text-sm font-medium text-slate-600">
              Laporkan kerusakan infrastruktur di sekitar Anda
            </p>
          </div>
        </div>

        {submitError && (
          <div className="bg-neo-red shadow-neo-sm rounded-xl border-2 border-black p-3 text-center text-sm font-bold text-white">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="font-display mb-1 block text-sm font-bold">Judul Masalah</label>
            <Input
              placeholder="Contoh: Lampu Jalan Padam"
              {...register('title')}
              error={errors.title}
            />
            {errors.title && (
              <p className="text-neo-red mt-1 text-xs font-bold">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="font-display mb-2 block text-sm font-black">Kategori Kerusakan</label>

            <CategorySelect
              name="category_id"
              categories={categories}
              value={watch('category_id')}
              onChange={(value) =>
                setValue('category_id', value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={errors.category_id}
            />

            {errors.category_id && (
              <p className="text-neo-red mt-1 text-xs font-bold">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="font-display mb-1 block text-sm font-bold">Deskripsi</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Jelaskan detail kerusakan..."
              className="neo-input resize-none"
            />
            {errors.description && (
              <p className="text-neo-red mt-1 text-xs font-bold">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="font-display mb-1 block text-sm font-bold">Lokasi Administrasi</label>

            <WilayahSelect
              name="wilayah_id"
              wilayah={wilayah}
              value={watch('wilayah_id')}
              onChange={(value) =>
                setValue('wilayah_id', value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={errors.wilayah_id}
            />
            {errors.wilayah_id && (
              <p className="text-neo-red mt-1 text-xs font-bold">{errors.wilayah_id.message}</p>
            )}
            {errors.wilayah_id && (
              <p className="text-neo-red mt-1 text-xs font-bold">{errors.wilayah_id.message}</p>
            )}
          </div>
          <div>
            <label className="font-display mb-1 block text-sm font-bold">Alamat Spesifik</label>
            <Input
              placeholder="Jl. Ahmad Yani No. 12"
              {...register('address_text')}
              error={errors.address_text}
            />
            {errors.address_text && (
              <p className="text-neo-red mt-1 text-xs font-bold">{errors.address_text.message}</p>
            )}
          </div>
          {selectedWilayahId && (
            <div>
              <label className="font-display mb-1 block text-sm font-bold">
                Pilih Lokasi Tepat di Peta (Opsional)
              </label>
              <div className="shadow-neo-md overflow-hidden rounded-xl border-3 border-black">
                <MapContainer center={miniMapCenter} zoom={15} className="h-64 w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={pinLocation} onPositionChange={setPinLocation} />
                </MapContainer>
              </div>
              {pinLocation && (
                <p className="text-neo-blue mt-1 text-xs font-bold">
                  Pin ditetapkan: {pinLocation[0].toFixed(5)}, {pinLocation[1].toFixed(5)}
                </p>
              )}
            </div>
          )}
          <div>
            <label className="font-display mb-1 block text-sm font-bold">
              Unggah Foto (1-3 file, max 5MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex flex-wrap gap-3">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-black"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="bg-neo-red shadow-neo-sm absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-neo-canvas flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-black hover:bg-white"
                >
                  <Upload className="mb-1 h-6 w-6" />
                  <span className="text-xs font-bold">Tambah</span>
                </button>
              )}
            </div>
          </div>
          <Button type="submit" variant="success" className="w-full" isLoading={isSubmitting}>
            <MapPin className="h-5 w-5" />
            Kirim Laporan Sekarang!
          </Button>
        </form>
      </Card>
    </div>
  );
}
