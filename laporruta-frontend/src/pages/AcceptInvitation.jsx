import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, LockKeyhole, UserRound, MailCheck } from 'lucide-react';

import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function AcceptInvitation() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const hasToken = Boolean(token);

  useEffect(() => {
    if (!token) {
      setErrorMessage(
        'Invitation token tidak ditemukan. Pastikan Anda membuka link invitation yang diberikan oleh administrator.'
      );
    }
  }, [token]);

  const acceptInvitationMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/auth/invitations/accept', payload);

      return response.data;
    },

    onSuccess: (response) => {
      const result = response?.result ?? response?.data ?? response;

      const accessToken = result?.access_token ?? result?.accessToken;

      const userData = result?.user;

      if (!accessToken || !userData) {
        console.error('Invalid accept invitation response:', response);
        return;
      }

      setSession(accessToken, userData);

      switch (userData.role) {
        case 'admin_wilayah':
          navigate('/admin/wilayah', { replace: true });
          break;

        case 'admin_pusat':
          navigate('/admin/pusat', { replace: true });
          break;

        default:
          navigate('/', { replace: true });
          break;
      }
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.result?.message ||
        error?.message ||
        'Gagal menerima invitation.';

      setErrorMessage(message);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    setErrorMessage('');

    if (!token) {
      setErrorMessage(
        'Invitation token tidak ditemukan. Silakan gunakan link invitation yang valid.'
      );
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }

    if (!password) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password minimal 8 karakter.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Konfirmasi password wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password dan konfirmasi password tidak sama.');
      return;
    }

    acceptInvitationMutation.mutate({
      token,
      full_name: fullName.trim(),
      password,
      confirm_password: confirmPassword,
    });
  };

  if (!hasToken) {
    return (
      <div className="bg-neo-bg flex min-h-screen items-center justify-center px-4">
        <Card className="shadow-neo w-full max-w-md border-4 border-black p-8">
          <div className="text-center">
            <div className="shadow-neo-sm mx-auto mb-5 flex h-16 w-16 items-center justify-center border-4 border-black bg-red-400">
              <MailCheck size={32} />
            </div>

            <h1 className="text-2xl font-black uppercase">Invitation Tidak Valid</h1>

            <p className="mt-3 text-sm font-medium text-gray-700">
              Link invitation tidak memiliki token yang valid. Silakan gunakan link invitation yang
              diberikan oleh administrator.
            </p>

            <Button type="button" onClick={() => navigate('/')} className="mt-6 w-full">
              Kembali ke Beranda
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-neo-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="shadow-neo border-4 border-black bg-white">
          <div className="bg-neo-yellow border-b-4 border-black p-6">
            <div className="shadow-neo-sm mb-4 flex h-14 w-14 items-center justify-center border-4 border-black bg-white">
              <MailCheck size={28} />
            </div>

            <h1 className="text-3xl leading-tight font-black uppercase">Terima Invitation</h1>

            <p className="mt-2 text-sm font-semibold">
              Lengkapi data berikut untuk mengaktifkan akun Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Invitation status */}
            <div className="border-2 border-black bg-green-100 p-4">
              <div className="flex items-start gap-3">
                <MailCheck size={20} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-black uppercase">Invitation ditemukan</p>

                  <p className="mt-1 text-xs font-medium text-gray-700">
                    Link invitation Anda valid secara format. Silakan lengkapi data akun di bawah.
                  </p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="border-2 border-black bg-red-100 p-4">
                <p className="text-sm font-bold text-red-700">{errorMessage}</p>
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="mb-2 block text-sm font-black uppercase">
                Nama Lengkap
              </label>

              <div className="relative">
                <UserRound size={20} className="absolute top-1/2 left-3 -translate-y-1/2" />

                <Input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Contoh: Ibu Rina"
                  className="pl-10"
                  autoComplete="name"
                  disabled={acceptInvitationMutation.isPending}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-black uppercase">
                Password
              </label>

              <div className="relative">
                <LockKeyhole size={20} className="absolute top-1/2 left-3 -translate-y-1/2" />

                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="pr-12 pl-10"
                  autoComplete="new-password"
                  disabled={acceptInvitationMutation.isPending}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  disabled={acceptInvitationMutation.isPending}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="mb-2 block text-sm font-black uppercase">
                Konfirmasi Password
              </label>

              <div className="relative">
                <LockKeyhole size={20} className="absolute top-1/2 left-3 -translate-y-1/2" />

                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi password"
                  className="pr-12 pl-10"
                  autoComplete="new-password"
                  disabled={acceptInvitationMutation.isPending}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  disabled={acceptInvitationMutation.isPending}
                  aria-label={
                    showConfirmPassword
                      ? 'Sembunyikan konfirmasi password'
                      : 'Tampilkan konfirmasi password'
                  }
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={acceptInvitationMutation.isPending} className="w-full">
              {acceptInvitationMutation.isPending
                ? 'Mengaktifkan Akun...'
                : 'Terima Invitation & Masuk'}
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs font-semibold text-gray-600">
          Dengan melanjutkan, akun Anda akan dibuat sesuai invitation yang diberikan administrator.
        </p>
      </div>
    </div>
  );
}
