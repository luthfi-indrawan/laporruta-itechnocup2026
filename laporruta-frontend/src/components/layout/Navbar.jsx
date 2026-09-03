import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, LayoutDashboard, PlusCircle, List, User, Newspaper, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin_wilayah') return '/admin/wilayah';
    if (user?.role === 'admin_pusat') return '/admin/pusat';
    return '/laporan-saya';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 mx-auto max-w-7xl p-4">
      <nav className="bg-neo-yellow shadow-neo-md rounded-2xl border-3 border-black p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-3 border-black bg-black text-xl font-black text-white">
              <img
                src="/logo.jpeg"
                alt="LaporRuta"
                className="h-full w-full rounded-md object-contain"
              />
            </div>

            <h1 className="font-display mr-4 text-xl font-black tracking-tight uppercase sm:text-2xl">
              LaporRuta!
            </h1>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                {user?.role === 'user' && (
                  <>
                    <Link to="/laporkan">
                      <Button variant="secondary" size="sm">
                        <PlusCircle className="h-4 w-4" />
                        Buat Laporan
                      </Button>
                    </Link>

                    <Link to="/feed">
                      <Button variant="ghost" size="sm">
                        <Newspaper className="h-4 w-4" />
                        Feed
                      </Button>
                    </Link>

                    <Link to="/laporan-saya">
                      <Button variant="ghost" size="sm">
                        <List className="h-4 w-4" />
                        Laporan Saya
                      </Button>
                    </Link>
                  </>
                )}

                {(user?.role === 'admin_wilayah' || user?.role === 'admin_pusat') && (
                  <Link to={getDashboardLink()}>
                    <Button variant="secondary" size="sm">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                <div className="hidden items-center gap-2 md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white">
                    <User className="h-4 w-4" />
                  </div>

                  <span className="font-display text-sm font-bold">{user?.full_name}</span>
                </div>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>

                <Link to="/register">
                  <Button variant="secondary" size="sm">
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-4 flex flex-col gap-3 border-t-3 border-black pt-4 md:hidden">
            {isAuthenticated ? (
              <>
                {user?.role === 'user' && (
                  <>
                    <Link to="/laporkan" onClick={closeMenu}>
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        <PlusCircle className="h-4 w-4" />
                        Buat Laporan
                      </Button>
                    </Link>

                    <Link to="/feed" onClick={closeMenu}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Newspaper className="h-4 w-4" />
                        Feed
                      </Button>
                    </Link>

                    <Link to="/laporan-saya" onClick={closeMenu}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <List className="h-4 w-4" />
                        Laporan Saya
                      </Button>
                    </Link>
                  </>
                )}

                {(user?.role === 'admin_wilayah' || user?.role === 'admin_pusat') && (
                  <Link to={getDashboardLink()} onClick={closeMenu}>
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-white p-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white">
                    <User className="h-4 w-4" />
                  </div>

                  <span className="font-display truncate text-sm font-bold">{user?.full_name}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Masuk
                  </Button>
                </Link>

                <Link to="/register" onClick={closeMenu}>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
