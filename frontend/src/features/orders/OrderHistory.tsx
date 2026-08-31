import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Order } from '../../types';
import toast from 'react-hot-toast';
import { HiClipboardList, HiEye, HiClock, HiCheck, HiTruck, HiX as HiXIcon } from 'react-icons/hi';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'รอดำเนินการ', color: 'bg-amber-100 text-amber-700', icon: <HiClock /> },
  CONFIRMED: { label: 'ยืนยันแล้ว', color: 'bg-blue-100 text-blue-700', icon: <HiCheck /> },
  SHIPPED: { label: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-700', icon: <HiTruck /> },
  DELIVERED: { label: 'ได้รับแล้ว', color: 'bg-green-100 text-green-700', icon: <HiCheck /> },
  CANCELLED: { label: 'ยกเลิก', color: 'bg-red-100 text-red-700', icon: <HiXIcon /> },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.orders);
      } catch {
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price: number | string) =>
    Number(price).toLocaleString('th-TH', { minimumFractionDigits: 0 });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

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
          <HiClipboardList className="text-primary-500" />
          คำสั่งซื้อ
        </h1>
        <p className="text-surface-500 mb-8">{orders.length} รายการ</p>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
            <div className="text-7xl mb-4 flex justify-center text-surface-300"><HiClipboardList /></div>
            <h3 className="text-xl font-semibold text-surface-700 mb-2">ยังไม่มีคำสั่งซื้อ</h3>
            <p className="text-surface-500 mb-6">เมื่อคุณสั่งซื้อสินค้า จะแสดงที่นี่</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25"
            >
              เลือกสินค้า
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white rounded-2xl border border-surface-100 p-6 hover:shadow-xl hover:shadow-surface-200/50 hover:border-primary-200 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-surface-900">{order.orderNumber}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-surface-500">{formatDate(order.createdAt)}</p>
                      {order.user && (
                        <p className="text-sm text-surface-400 mt-1">
                          ลูกค้า: {order.user.firstName} {order.user.lastName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-surface-500">ยอดรวม</p>
                      <p className="text-xl font-bold text-primary-600">
                        ฿{formatPrice(order.grandTotal)}
                      </p>
                      <p className="text-xs text-surface-400 mt-1">
                        {order._count?.orderItems || 0} รายการ
                      </p>
                    </div>
                    <HiEye className="text-xl text-surface-300 hidden sm:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
