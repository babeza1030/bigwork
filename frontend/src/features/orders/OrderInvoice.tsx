import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Order } from '../../types';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPrinter } from 'react-icons/hi';

export default function OrderInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch {
        toast.error('ไม่พบคำสั่งซื้อ');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatPrice = (price: number | string) =>
    Number(price).toLocaleString('th-TH', { minimumFractionDigits: 2 });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
      </div>
    );
  }

  if (!order) return null;

  const statusLabels: Record<string, string> = {
    PENDING: 'รอดำเนินการ',
    CONFIRMED: 'ยืนยันแล้ว',
    SHIPPED: 'จัดส่งแล้ว',
    DELIVERED: 'ได้รับแล้ว',
    CANCELLED: 'ยกเลิก',
  };

  return (
    <div className="min-h-screen bg-surface-100 pt-20">
      {/* Action Bar (hidden in print) */}
      <div className="no-print max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors"
          >
            <HiArrowLeft /> กลับ
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all text-sm font-medium"
            >
              <HiPrinter />
              พิมพ์ใบสั่งขาย
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="print-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-100 overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-surface-900 px-8 py-8 text-white relative overflow-hidden border-b border-surface-800">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg font-bold">S</span>
                  </div>
                  <h1 className="text-2xl font-bold">ShopPro</h1>
                </div>
                <p className="text-white/70 text-sm">123 Business Avenue, Bangkok 10100</p>
                <p className="text-white/70 text-sm">Tax ID: 0-1234-56789-01-2</p>
              </div>
              <div className="text-left sm:text-right">
                <h2 className="text-3xl font-bold mb-1">ใบสั่งขาย</h2>
                <p className="text-lg font-semibold text-white/90">SALES ORDER</p>
              </div>
            </div>
          </div>

          {/* Order Info Section */}
          <div className="px-8 py-6 border-b border-surface-100">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Bill To */}
              <div>
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">ลูกค้า / Bill To</h3>
                <div className="bg-surface-50 rounded-xl p-4">
                  <p className="font-semibold text-surface-900 text-lg">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-sm text-surface-600 mt-1">{order.user.email}</p>
                  {order.user.phone && (
                    <p className="text-sm text-surface-600">โทร: {order.user.phone}</p>
                  )}
                  {order.shippingAddress && (
                    <p className="text-sm text-surface-600 mt-2">
                      <span className="text-surface-400">ที่อยู่จัดส่ง:</span><br />
                      {order.shippingAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">รายละเอียดคำสั่งซื้อ / Order Details</h3>
                <div className="bg-surface-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">เลขที่ใบสั่งขาย</span>
                    <span className="font-bold text-primary-600">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">วันที่</span>
                    <span className="font-medium text-surface-800">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">สถานะ</span>
                    <span className={`font-semibold ${
                      order.status === 'CANCELLED' ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">วิธีชำระเงิน</span>
                    <span className="text-surface-800">โอนเงิน / Bank Transfer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary-500">
                  <th className="text-left py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider w-12">ลำดับ</th>
                  <th className="text-left py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">รายการสินค้า</th>
                  <th className="text-right py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider w-24">จำนวน</th>
                  <th className="text-right py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider w-32">ราคา/หน่วย</th>
                  <th className="text-right py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider w-36">รวมเงิน</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item, index) => (
                  <tr key={item.id} className="border-b border-surface-100 hover:bg-surface-50/50">
                    <td className="py-4 text-sm text-surface-500">{index + 1}</td>
                    <td className="py-4">
                      <p className="text-sm font-medium text-surface-800">{item.product.name}</p>
                    </td>
                    <td className="py-4 text-right text-sm text-surface-700">{item.quantity}</td>
                    <td className="py-4 text-right text-sm text-surface-700">฿{formatPrice(item.unitPrice)}</td>
                    <td className="py-4 text-right text-sm font-semibold text-surface-900">฿{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-8 py-6 border-t border-surface-100">
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">ยอดรวม (Subtotal)</span>
                  <span className="text-surface-800">฿{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">ภาษีมูลค่าเพิ่ม 7% (VAT)</span>
                  <span className="text-surface-800">฿{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="border-t-2 border-primary-500 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-surface-900">ยอดรวมสุทธิ (Grand Total)</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ฿{formatPrice(order.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-surface-50 border-t border-surface-100">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  เงื่อนไขการชำระเงิน / Payment Terms
                </h4>
                <p className="text-sm text-surface-600">ชำระเงินภายใน 30 วัน นับจากวันที่ในใบสั่งขาย</p>
                <p className="text-sm text-surface-600 mt-1">Payment due within 30 days from invoice date</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  ข้อมูลธนาคาร / Bank Information
                </h4>
                <p className="text-sm text-surface-600">ธนาคารกรุงเทพ สาขาสีลม</p>
                <p className="text-sm text-surface-600">เลขที่บัญชี: 123-4-56789-0</p>
                <p className="text-sm text-surface-600">ชื่อบัญชี: บริษัท ShopPro จำกัด</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-10 pt-6">
              <div className="text-center">
                <div className="border-b border-surface-300 w-48 mx-auto mb-2 pt-12"></div>
                <p className="text-sm text-surface-500">ผู้สั่งซื้อ / Customer</p>
                <p className="text-xs text-surface-400 mt-1">
                  {order.user.firstName} {order.user.lastName}
                </p>
              </div>
              <div className="text-center">
                <div className="border-b border-surface-300 w-48 mx-auto mb-2 pt-12"></div>
                <p className="text-sm text-surface-500">ผู้อนุมัติ / Authorized</p>
                <p className="text-xs text-surface-400 mt-1">ShopPro Admin</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="px-8 py-4 bg-amber-50 border-t border-amber-100">
              <p className="text-sm text-amber-700">
                <span className="font-semibold">หมายเหตุ:</span> {order.notes}
              </p>
            </div>
          )}

          {/* Document Footer */}
          <div className="px-8 py-3 bg-surface-900 text-center border-t border-surface-800">
            <p className="text-xs text-white/70">
              เอกสารนี้ออกโดยระบบ ShopPro — ขอบคุณที่ใช้บริการ | Thank you for your business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
