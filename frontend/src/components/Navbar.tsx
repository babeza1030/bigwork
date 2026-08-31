import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { HiShoppingCart, HiUser, HiLogout, HiMenu, HiX, HiCube, HiClipboardList, HiHome, HiLogin, HiUserAdd, HiCog } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/cart/count').then((res) => setCartCount(res.data.count)).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-primary-500/5 border-b border-surface-200/50'
          : 'bg-white/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/10 group-hover:bg-primary-700 transition-colors">
              <HiCube className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-surface-900">
              ShopPro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" active={isActive('/')} icon={<HiHome />}>
              สินค้า
            </NavLink>
            {user && (
              <NavLink to="/orders" active={isActive('/orders')} icon={<HiClipboardList />}>
                คำสั่งซื้อ
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/products" active={isActive('/admin/products')} icon={<HiCube />}>
                จัดการสินค้า
              </NavLink>
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl hover:bg-surface-100 transition-colors group"
                >
                  <HiShoppingCart className="text-xl text-surface-600 group-hover:text-primary-600 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-surface-200">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                    <HiUser className="text-sm" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-surface-800 leading-tight">
                      {user.firstName}
                    </p>
                    <p className="text-[11px] text-surface-400 leading-tight">
                      {user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-all"
                    title="ออกจากระบบ"
                  >
                    <HiLogout className="text-lg" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 rounded-lg hover:bg-surface-100 transition-all"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-md shadow-primary-600/10 transition-all"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <HiX className="text-xl text-surface-700" />
            ) : (
              <HiMenu className="text-xl text-surface-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-surface-100 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>
              <span className="flex items-center gap-2">
                <HiHome className="text-lg text-surface-500" />
                สินค้าทั้งหมด
              </span>
            </MobileNavLink>
            {user && (
              <>
                <MobileNavLink to="/cart" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2">
                    <HiShoppingCart className="text-lg text-surface-500" />
                    ตะกร้า {cartCount > 0 && `(${cartCount})`}
                  </span>
                </MobileNavLink>
                <MobileNavLink to="/orders" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2">
                    <HiClipboardList className="text-lg text-surface-500" />
                    คำสั่งซื้อ
                  </span>
                </MobileNavLink>
                {isAdmin && (
                  <MobileNavLink to="/admin/products" onClick={() => setMobileOpen(false)}>
                    <span className="flex items-center gap-2">
                      <HiCog className="text-lg text-surface-500" />
                      จัดการสินค้า
                    </span>
                  </MobileNavLink>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <HiLogout className="text-lg text-red-500" />
                  ออกจากระบบ ({user.firstName})
                </button>
              </>
            )}
            {!user && (
              <>
                <MobileNavLink to="/login" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2">
                    <HiLogin className="text-lg text-surface-500" />
                    เข้าสู่ระบบ
                  </span>
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2">
                    <HiUserAdd className="text-lg text-surface-500" />
                    สมัครสมาชิก
                  </span>
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  to,
  active,
  icon,
  children,
}: {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}
