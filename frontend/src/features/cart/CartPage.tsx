import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Cart } from '../../types';
import toast from 'react-hot-toast';
import { HiTrash, HiMinus, HiPlus, HiShoppingCart, HiArrowRight, HiPhotograph } from 'react-icons/hi';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch {
      toast.error('ไม่สามารถโหลดตะกร้าได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: number, quantity: number) => {
    setUpdatingId(itemId);
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถอัปเดตได้');
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await api.delete(`/cart/${itemId}`);
      toast.success('ลบออกจากตะกร้าแล้ว');
      await fetchCart();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบได้');
    }
  };

  const clearCart = async () => {
    if (!confirm('ต้องการล้างตะกร้าทั้งหมดใช่หรือไม่?')) return;
    try {
      await api.delete('/cart/clear');
      toast.success('ล้างตะกร้าแล้ว');
      setCart({ items: [], total: 0, itemCount: 0 });
    } catch {
      toast.error('ไม่สามารถล้างตะกร้าได้');
    }
  };

  const formatPrice = (price: number | string) =>
    Number(price).toLocaleString('th-TH', { minimumFractionDigits: 0 });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-surface-900 mb-2 flex items-center gap-2">
          <HiShoppingCart className="text-primary-500" />
          ตะกร้าสินค้า
        </h1>
        <p className="text-surface-500 mb-8">
          {cart && cart.items.length > 0
            ? `${cart.itemCount} ชิ้น (${cart.items.length} รายการ)`
            : 'ตะกร้าของคุณว่างเปล่า'}
        </p>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
            <div className="text-7xl mb-4 flex justify-center text-surface-300"><HiShoppingCart /></div>
            <h3 className="text-xl font-semibold text-surface-700 mb-2">ตะกร้าว่าง</h3>
            <p className="text-surface-500 mb-6">เลือกสินค้าที่ชอบแล้วเพิ่มลงตะกร้ากันเถอะ!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-600/10"
            >
              เลือกสินค้า <HiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-surface-100 p-5 flex gap-4 hover:shadow-lg hover:shadow-surface-200/50 transition-all animate-fade-in"
                >
                  {/* Image */}
                  <Link to={`/products/${item.productId}`} className="w-24 h-24 bg-surface-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiPhotograph className="text-3xl text-surface-300" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`} className="font-semibold text-surface-800 hover:text-primary-600 transition-colors line-clamp-1">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-surface-500 mt-0.5">
                      ฿{formatPrice(item.product.price)} / ชิ้น
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center bg-surface-100 rounded-lg">
                        <button
                          onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingId === item.id || item.quantity <= 1}
                          className="p-2 text-surface-600 hover:text-primary-600 transition-colors disabled:opacity-40"
                        >
                          <HiMinus className="text-sm" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-surface-800">
                          {updatingId === item.id ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingId === item.id || item.quantity >= item.product.stockQuantity}
                          className="p-2 text-surface-600 hover:text-primary-600 transition-colors disabled:opacity-40"
                        >
                          <HiPlus className="text-sm" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary-600">
                          ฿{formatPrice(item.subtotal)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="ลบ"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-sm text-surface-400 hover:text-red-500 transition-colors"
              >
                ล้างตะกร้าทั้งหมด
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-surface-100 p-6 sticky top-24 shadow-lg shadow-surface-200/50">
                <h3 className="text-lg font-bold text-surface-900 mb-4">สรุปคำสั่งซื้อ</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">ยอดรวมสินค้า</span>
                    <span className="text-surface-800 font-medium">฿{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">VAT (7%)</span>
                    <span className="text-surface-800 font-medium">฿{formatPrice(cart.total * 0.07)}</span>
                  </div>
                  <div className="border-t border-surface-100 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-surface-800">ยอดรวมทั้งสิ้น</span>
                      <span className="text-xl font-bold text-primary-600">
                        ฿{formatPrice(cart.total * 1.07)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/10 hover:shadow-xl transition-all"
                >
                  ดำเนินการสั่งซื้อ
                  <HiArrowRight />
                </button>

                <Link
                  to="/"
                  className="block text-center text-sm text-surface-500 hover:text-primary-600 mt-3 transition-colors"
                >
                  ← เลือกสินค้าเพิ่ม
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
