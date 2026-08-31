import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Cart } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiLocationMarker, HiAnnotation, HiShieldCheck, HiPhotograph } from 'react-icons/hi';

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.items.length === 0) {
          toast.error('ตะกร้าว่าง กรุณาเลือกสินค้าก่อน');
          navigate('/');
          return;
        }
        setCart(res.data);
        if (user?.address) {
          setShippingAddress(user.address);
        }
      } catch {
        toast.error('ไม่สามารถโหลดข้อมูลได้');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error('กรุณากรอกที่อยู่จัดส่ง');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        shippingAddress,
        notes: notes || undefined,
      });
      toast.success('สั่งซื้อสำเร็จ!');
      navigate(`/orders/${res.data.order.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถสร้างคำสั่งซื้อได้');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number | string) =>
    Number(price).toLocaleString('th-TH', { minimumFractionDigits: 0 });

  if (loading || !cart) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
      </div>
    );
  }

  const taxAmount = cart.total * 0.07;
  const grandTotal = cart.total + taxAmount;

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-surface-900 mb-8">ยืนยันคำสั่งซื้อ</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-lg shadow-surface-200/50">
                <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                  <HiLocationMarker className="text-primary-500" />
                  ที่อยู่จัดส่ง
                </h3>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  required
                  placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า"
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                />
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-lg shadow-surface-200/50">
                <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                  <HiAnnotation className="text-primary-500" />
                  หมายเหตุ (ไม่บังคับ)
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="เช่น ส่งวันจันทร์-ศุกร์ เวลา 9:00-17:00"
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                />
              </div>

              {/* Items Preview */}
              <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-lg shadow-surface-200/50">
                <h3 className="text-lg font-bold text-surface-900 mb-4">รายการสินค้า ({cart.itemCount} ชิ้น)</h3>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2">
                      <div className="w-12 h-12 bg-surface-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiPhotograph className="text-lg text-surface-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-800 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-surface-500">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-surface-800">
                        ฿{formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-surface-100 p-6 sticky top-24 shadow-lg shadow-surface-200/50">
                <h3 className="text-lg font-bold text-surface-900 mb-4">สรุปการสั่งซื้อ</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">ยอดรวมสินค้า</span>
                    <span className="text-surface-800">฿{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">VAT 7%</span>
                    <span className="text-surface-800">฿{formatPrice(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">ค่าจัดส่ง</span>
                    <span className="text-green-600 font-medium">ฟรี</span>
                  </div>
                  <div className="border-t border-surface-100 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-surface-900">ยอดรวมทั้งสิ้น</span>
                      <span className="text-xl font-bold text-primary-600">
                        ฿{formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-md shadow-green-600/10 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <HiShieldCheck className="text-xl" />
                  {submitting ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}
                </button>

                <p className="text-xs text-center text-surface-400 mt-3">
                  เมื่อยืนยัน สต็อกสินค้าจะถูกตัดทันที
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
