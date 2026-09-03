import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MapPin } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      const user = await login(data.email, data.password);
      const redirectTo = searchParams.get("from") || "/";
      if (user.role === "admin_wilayah") navigate("/admin/wilayah");
      else if (user.role === "admin_pusat") navigate("/admin/pusat");
      else navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || "Kredensial tidak valid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <Card padding="large" className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-black bg-neo-yellow shadow-neo-md">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="font-display text-3xl font-black">Masuk</h2>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Lanjutkan memantau infrastruktur publik
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
              placeholder="••••••••"
              error={errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs font-bold text-neo-red">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            Masuk Sekarang
          </Button>
        </form>

        <p className="text-center text-sm font-medium">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-bold underline decoration-2 underline-offset-4 hover:text-neo-purple"
          >
            Daftar di sini
          </Link>
        </p>
      </Card>
    </div>
  );
}
