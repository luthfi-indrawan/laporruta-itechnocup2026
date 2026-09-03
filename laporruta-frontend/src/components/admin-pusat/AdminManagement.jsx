import { useState } from 'react';
import { Check, Copy, Mail, MapPin, UserCheck, Users, UserX } from 'lucide-react';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WilayahSelect } from '@/components/ui/WilayahSelect';

import { EmptyState, LoadingState } from './AdminPusatShared';

const ADMIN_ROLE_OPTIONS = [
  {
    value: 'admin_wilayah',
    label: 'Admin Wilayah',
  },
  {
    value: 'admin_pusat',
    label: 'Admin Pusat',
  },
];

export function AdminManagement({
  adminList,
  adminsLoading,
  invitations,
  invitationsLoading,
  wilayah,
  wilayahLoading,
  newAdminEmail,
  newAdminRole,
  newAdminWilayah,
  inviteMutation,
  togglingAdminId,

  createdInvitation,
  onClearCreatedInvitation,

  onEmailChange,
  onRoleChange,
  onWilayahChange,
  onInvite,
  onToggleAdmin,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!createdInvitation?.invite_url) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(createdInvitation.invite_url);
      } else {
        const textarea = document.createElement('textarea');

        textarea.value = createdInvitation.invite_url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const successful = document.execCommand('copy');

        document.body.removeChild(textarea);

        if (!successful) {
          throw new Error('Gagal menyalin invitation link');
        }
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('COPY INVITATION LINK ERROR:', error);
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="large" className="overflow-visible transition-all">
        <div className="mb-5 flex items-start gap-3">
          <div className="bg-neo-yellow rounded-xl border-2 border-black p-2">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-display text-xl font-black">Undang Admin Baru</h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Buat undangan untuk admin wilayah atau admin pusat.
            </p>
          </div>
        </div>

        <form onSubmit={onInvite} className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="mb-1 block text-xs font-black">Email</label>

            <Input
              type="email"
              value={newAdminEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="admin@demo.id"
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-xs font-black">Peran</label>

            <Select
              options={ADMIN_ROLE_OPTIONS}
              value={newAdminRole}
              onChange={(value) => onRoleChange(value)}
              placeholder="Pilih Role Admin"
              className="w-full bg-white"
            />
          </div>

          {newAdminRole === 'admin_wilayah' && (
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-black">Wilayah / Kecamatan</label>

              <WilayahSelect
                name="assigned_wilayah_id"
                wilayah={wilayah}
                value={newAdminWilayah}
                onChange={(value) => onWilayahChange(value)}
                placeholder={wilayahLoading ? 'Memuat kecamatan...' : 'Pilih Kecamatan Baru'}
                disabled={wilayahLoading}
                className="w-full"
              />
            </div>
          )}

          <div
            className={`flex justify-end ${
              newAdminRole === 'admin_pusat' ? 'md:col-span-4' : 'md:col-span-12'
            }`}
          >
            <Button
              type="submit"
              variant="primary"
              isLoading={inviteMutation.isPending}
              disabled={newAdminRole === 'admin_wilayah' && !newAdminWilayah}
            >
              <Mail className="h-4 w-4" />
              Kirim Undangan
            </Button>
          </div>
        </form>
      </Card>

      {createdInvitation?.invite_url && (
        <Card
          padding="none"
          className="shadow-neo-md overflow-hidden border-3 border-black bg-white"
        >
          {/* SUCCESS HEADER */}
          <div className="bg-neo-mint flex items-center justify-between border-b-3 border-black px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border-3 border-black bg-white">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>

              <div>
                <h3 className="font-display text-lg font-black tracking-tight uppercase">
                  Undangan Berhasil Dibuat
                </h3>

                <p className="text-xs font-bold text-slate-800">
                  Invitation siap dibagikan kepada calon administrator.
                </p>
              </div>
            </div>

            {onClearCreatedInvitation && (
              <button
                type="button"
                onClick={onClearCreatedInvitation}
                className="hover:shadow-neo-sm border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                Tutup
              </button>
            )}
          </div>

          <div className="p-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-black tracking-wide uppercase">
                  Invitation Link
                </label>

                {createdInvitation.expires_at && (
                  <span className="font-mono text-[11px] font-bold text-slate-600">
                    EXPIRES{' '}
                    {format(new Date(createdInvitation.expires_at), 'dd MMM yyyy HH:mm', {
                      locale: id,
                    })}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="bg-neo-canvas flex min-h-12 flex-1 items-center border-3 border-black px-3">
                  <code className="font-mono text-xs font-bold break-all text-black">
                    {createdInvitation.invite_url}
                  </code>
                </div>

                <Button
                  type="button"
                  onClick={handleCopyLink}
                  variant="secondary"
                  className="bg-neo-pink shadow-neo-sm min-h-12 shrink-0 border-3 border-black font-black uppercase"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 stroke-[3]" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {createdInvitation.token && (
              <div className="mt-5 border-t-3 border-black pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase">Invitation Token</p>

                    <p className="mt-0.5 text-xs font-medium text-slate-600">
                      Digunakan untuk validasi invitation.
                    </p>
                  </div>

                  <code className="border-2 border-black bg-slate-50 px-3 py-2 font-mono text-[11px] font-bold break-all">
                    {createdInvitation.token}
                  </code>
                </div>
              </div>
            )}

            <div className="bg-neo-yellow mt-5 flex items-start gap-3 border-3 border-black p-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 stroke-[3]" />

              <p className="text-xs leading-relaxed font-bold">
                Bagikan link ini kepada calon admin. Mereka cukup membuka link, mengisi nama lengkap
                dan password, lalu akun akan otomatis diaktifkan.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card padding="large">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-black">Administrator</h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Kelola akses administrator sistem.
            </p>
          </div>

          <span className="bg-neo-canvas rounded-full border-2 border-black px-3 py-1 text-xs font-black">
            {adminList.length} admin
          </span>
        </div>

        {adminsLoading ? (
          <LoadingState />
        ) : !adminList.length ? (
          <EmptyState icon={Users} text="Belum ada administrator." />
        ) : (
          <div className="space-y-3">
            {adminList.map((admin) => {
              const assignedWilayah = wilayah.find(
                (wilayah) => wilayah.id === admin.assigned_wilayah_id
              );

              const wilayahName =
                admin.assigned_wilayah?.name ||
                admin.assigned_wilayah_name ||
                assignedWilayah?.name;

              const wilayahType = admin.assigned_wilayah?.type || assignedWilayah?.type;

              return (
                <div
                  key={admin.id}
                  className="bg-neo-canvas flex flex-col gap-4 rounded-xl border-2 border-black p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black ${
                        admin.is_active ? 'bg-neo-mint' : 'bg-slate-200'
                      }`}
                    >
                      {admin.is_active ? (
                        <UserCheck className="h-5 w-5" />
                      ) : (
                        <UserX className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-display font-black">
                        {admin.full_name || 'Administrator'}
                      </h4>

                      <p className="truncate text-sm font-medium text-slate-600">{admin.email}</p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black">
                          {admin.role === 'admin_pusat' ? 'ADMIN PUSAT' : 'ADMIN WILAYAH'}
                        </span>

                        {admin.role === 'admin_wilayah' && (
                          <span className="bg-neo-blue/20 flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-bold">
                            <MapPin className="h-3 w-3" />

                            {wilayahName || 'Zona belum ditentukan'}

                            {wilayahType && <span className="text-slate-500">• {wilayahType}</span>}
                          </span>
                        )}

                        <span
                          className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black ${
                            admin.is_active ? 'bg-neo-mint' : 'bg-slate-200'
                          }`}
                        >
                          {admin.is_active ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={admin.is_active ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => onToggleAdmin(admin.id, !admin.is_active)}
                    isLoading={togglingAdminId === admin.id}
                  >
                    {admin.is_active ? (
                      <>
                        <UserX className="h-4 w-4" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Aktifkan
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card padding="large">
        <div className="mb-5">
          <h3 className="font-display text-xl font-black">Riwayat Undangan</h3>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Pantau undangan admin yang pernah dibuat.
          </p>
        </div>

        {invitationsLoading ? (
          <LoadingState />
        ) : !invitations.length ? (
          <EmptyState icon={Mail} text="Belum ada undangan." />
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => {
              const assignedWilayah = wilayah.find(
                (wilayah) => wilayah.id === invitation.assigned_wilayah_id
              );

              return (
                <div
                  key={invitation.id || invitation.invitation_id}
                  className="bg-neo-canvas rounded-xl border-2 border-black p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {invitation.email || 'Email tidak tersedia'}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black">
                          {invitation.role === 'admin_pusat' ? 'ADMIN PUSAT' : 'ADMIN WILAYAH'}
                        </span>

                        {invitation.role === 'admin_wilayah' && (
                          <span className="bg-neo-blue/20 flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-bold">
                            <MapPin className="h-3 w-3" />

                            {invitation.assigned_wilayah?.name ||
                              invitation.assigned_wilayah_name ||
                              assignedWilayah?.name ||
                              'Zona tidak tersedia'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase">
                        {invitation.status || 'aktif'}
                      </span>

                      {invitation.expires_at && (
                        <span className="text-[10px] font-bold text-slate-500">
                          Exp:{' '}
                          {format(new Date(invitation.expires_at), 'dd MMM yyyy HH:mm', {
                            locale: id,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
