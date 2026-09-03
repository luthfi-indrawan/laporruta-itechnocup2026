import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { UserPlus } from "lucide-react";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(255, "Nama terlalu panjang"),
    email: z.string().email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password terlalu panjang"),
    confirm_password: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      await registerUser(
        data.full_name,
        data.email,
        data.password,
        data.confirm_password,
      );
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <Card padding="large" className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-black bg-neo-pink shadow-neo-md">
            <UserPlus className="h-8 w-8" />
          </div>
          <h2 className="font-display text-3xl font-black">Daftar Akun</h2>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Bergabung untuk melaporkan masalah infrastruktur
          </p>
        </div>

        {error && (
          <div className="rounded-xl border-2 border-black bg-neo-red p-3 text-center text-sm font-bold text-white shadow-neo-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block font-display text-sm font-bold">
              Nama Lengkap
            </label>
            <Input
              placeholder="Budi Santoso"
              error={errors.full_name}
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs font-bold text-neo-red">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-display text-sm font-bold">
              Email
            </label>
            <Input
              type="email"
              placeholder="nama@email.com"
              error={errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs font-bold text-neo-red">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-display text-sm font-bold">
              Password
            </label>
            <Input
              type="password"
              placeholder="Minimal 8 karakter"
              error={errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs font-bold text-neo-red">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-display text-sm font-bold">
              Konfirmasi Password
            </label>
            <Input
              type="password"
              placeholder="Ulangi password"
              error={errors.confirm_password}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs font-bold text-neo-red">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            Daftar Sekarang
          </Button>
        </form>

        <p className="text-center text-sm font-medium">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-bold underline decoration-2 underline-offset-4 hover:text-neo-purple"
          >
            Masuk di sini
          </Link>
        </p>
      </Card>
    </div>
  );
}
