import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicMap } from '@/pages/PublicMap';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { CreateReport } from '@/pages/CreateReport';
import { MyReports } from '@/pages/MyReports';
import { ReportDetail } from '@/pages/ReportDetail';
import { AdminWilayah } from '@/pages/admin/AdminWilayah';
import { AdminPusat } from '@/pages/admin/AdminPusat';
import { ReportFeed } from '@/pages/ReportFeed';
import { AcceptInvitation } from '@/pages/AcceptInvitation';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <PublicMap /> },
      { path: '/login', element: <Login /> },
      { path: '/feed', element: <ReportFeed /> },
      { path: '/register', element: <Register /> },
      { path: '/laporan/:id', element: <ReportDetail /> },
      { path: '/accept-invitation', element: <AcceptInvitation /> },

      {
        element: <ProtectedRoute allowedRoles={['user']} />,
        children: [
          { path: '/laporkan', element: <CreateReport /> },
          { path: '/laporan-saya', element: <MyReports /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin_wilayah']} />,
        children: [{ path: '/admin/wilayah', element: <AdminWilayah /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin_pusat']} />,
        children: [{ path: '/admin/pusat', element: <AdminPusat /> }],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
