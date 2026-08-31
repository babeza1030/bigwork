import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiLocationMarker } from 'react-icons/hi';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (form.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      toast.success('สมัครสมาชิกสำเร็จ!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-surface-900 relative overflow-hidden border-r border-surface-800">
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            เริ่มต้นใช้งาน<br />
            วันนี้
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            สมัครสมาชิกฟรี เพื่อเข้าถึงระบบร้านค้าออนไลน์ที่ครบวงจร
          </p>
        </div>
      </div>

      {/* Right - Register Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 p-8 border border-surface-100">
            <h2 className="text-2xl font-bold text-surface-900 mb-1">สมัครสมาชิก</h2>
            <p className="text-surface-500 mb-6">กรอกข้อมูลเพื่อสร้างบัญชีใหม่</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">ชื่อ *</label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="ชื่อ"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="นามสกุล"
                    required
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">อีเมล *</label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">รหัสผ่าน *</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="อย่างน้อย 6 ตัว"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">ยืนยันรหัสผ่าน *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">เบอร์โทรศัพท์</label>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0812345678"
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">ที่อยู่</label>
                <div className="relative">
                  <HiLocationMarker className="absolute left-3 top-3 text-surface-400" />
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="ที่อยู่สำหรับจัดส่ง"
                    rows={2}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
              </button>
            </form>

            <p className="text-center text-sm text-surface-500 mt-6">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
