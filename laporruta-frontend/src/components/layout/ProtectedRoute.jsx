import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';

export function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          <p className="font-display font-bold">Memuat sesi...</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
