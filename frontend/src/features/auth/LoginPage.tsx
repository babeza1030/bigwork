import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiCube, HiShoppingCart, HiDocumentText, HiKey } from 'react-icons/hi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('เข้าสู่ระบบสำเร็จ!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 relative overflow-hidden border-r border-surface-800">
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            ยินดีต้อนรับ<br />
            กลับมา
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-md">
            เข้าสู่ระบบเพื่อจัดการร้านค้า สั่งซื้อสินค้า และติดตามคำสั่งซื้อของคุณ
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <HiCube className="text-lg text-white" />
              </div>
              <span>ระบบจัดการสินค้าครบวงจร</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <HiShoppingCart className="text-lg text-white" />
              </div>
              <span>ตะกร้าสินค้าพร้อมตัดสต็อกอัตโนมัติ</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <HiDocumentText className="text-lg text-white" />
              </div>
              <span>ออกใบสั่งขายแบบมืออาชีพ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-primary-600/20">
              <span className="text-2xl text-white font-bold">S</span>
            </div>
            <h2 className="text-2xl font-bold text-surface-900">ShopPro</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 p-8 border border-surface-100">
            <h2 className="text-2xl font-bold text-surface-900 mb-1">เข้าสู่ระบบ</h2>
            <p className="text-surface-500 mb-8">กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">อีเมล</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">รหัสผ่าน</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPassword ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
              <p className="text-xs font-semibold text-primary-700 mb-2 flex items-center gap-1">
                <HiKey className="text-sm" />
                บัญชีทดสอบ
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => { setEmail('admin@shop.com'); setPassword('Admin@1234'); }}
                  className="px-3 py-2 bg-white rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors text-left"
                >
                  <span className="font-medium">Admin</span><br />
                  <span className="text-primary-500">admin@shop.com</span>
                </button>
                <button
                  onClick={() => { setEmail('user@shop.com'); setPassword('User@1234'); }}
                  className="px-3 py-2 bg-white rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors text-left"
                >
                  <span className="font-medium">Customer</span><br />
                  <span className="text-primary-500">user@shop.com</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-surface-500 mt-6">
              ยังไม่มีบัญชี?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                สมัครสมาชิก
              </Link>
            </p>
            <p className='text-center text-sm text-surface-500 mt-6'> <Link to="/" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">กลับไปหน้าหลัก</Link> </p>
          </div>
        </div>
      </div>
    </div>
  );
}
