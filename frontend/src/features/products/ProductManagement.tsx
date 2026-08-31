import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import api from '../../services/api';
import type { Product } from '../../types';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiPhotograph, HiSearch, HiDownload, HiUpload } from 'react-icons/hi';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  category: string;
  isActive: boolean;
  image: File | null;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  category: '',
  isActive: true,
  image: null,
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/admin/all', { params: { limit: 100, search } });
      setProducts(res.data.products);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleClearAll = async () => {
    if (!confirm('⚠️ คำเตือน: คุณต้องการลบสินค้าทั้งหมดในระบบใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้!')) return;
    try {
      await api.delete('/products/admin/bulk-delete');
      toast.success('ล้างข้อมูลสินค้าทั้งหมดสำเร็จ!');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถล้างข้อมูลได้');
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['name', 'description', 'price', 'stockQuantity', 'category'];
    const row = ['ตัวอย่างสินค้า 1', 'รายละเอียดสินค้า 1', '150', '20', 'Electronics'];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'product_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('ดาวน์โหลดเทมเพลตสำเร็จ!');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
          toast.error('ไฟล์เทมเพลตว่างหรือข้อมูลไม่ถูกต้อง');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = ['name', 'description', 'price', 'stockQuantity', 'category'];
        const isHeaderValid = expectedHeaders.every(h => headers.includes(h));

        if (!isHeaderValid) {
          toast.error('หัวคอลัมน์ของไฟล์ CSV ไม่ถูกต้องตามเทมเพลต');
          return;
        }

        const products: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const product: any = {};
          headers.forEach((header, idx) => {
            product[header] = values[idx] ? values[idx].replace(/^"|"$/g, '') : '';
          });

          if (!product.name) continue;
          product.price = parseFloat(product.price) || 0;
          product.stockQuantity = parseInt(product.stockQuantity) || 0;
          product.isActive = true;

          products.push(product);
        }

        if (products.length === 0) {
          toast.error('ไม่พบข้อมูลสินค้าที่ต้องการนำเข้า');
          return;
        }

        await api.post('/products/admin/bulk-create', products);
        toast.success(`นำเข้าสินค้าสำเร็จทั้งหมด ${products.length} รายการ!`);
        fetchProducts();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
      category: product.category || '',
      isActive: product.isActive,
      image: null,
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('stockQuantity', form.stockQuantity);
      formData.append('category', form.category);
      formData.append('isActive', String(form.isActive));
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('แก้ไขสินค้าสำเร็จ');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('เพิ่มสินค้าสำเร็จ');
      }

      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`ต้องการลบ "${product.name}" ใช่หรือไม่?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast.success('ลบสินค้าสำเร็จ');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบได้');
    }
  };

  const formatPrice = (price: number | string) =>
    Number(price).toLocaleString('th-TH', { minimumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">จัดการสินค้า</h1>
            <p className="text-surface-500 mt-1">เพิ่ม แก้ไข และลบสินค้าในระบบ ({products.length} รายการ)</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 font-medium rounded-xl transition-all text-sm"
            >
              <HiTrash className="text-base" />
              ล้างข้อมูลทั้งหมด
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-primary-200 text-primary-600 bg-primary-50/50 hover:bg-primary-50 font-medium rounded-xl transition-all text-sm"
            >
              <HiDownload className="text-base" />
              โหลด Template
            </button>
            <label className="flex items-center gap-1.5 px-4 py-2.5 border border-surface-200 text-surface-700 bg-white hover:bg-surface-50 font-medium rounded-xl transition-all text-sm cursor-pointer">
              <HiUpload className="text-base" />
              นำเข้า Excel
              <input
                type="file"
                accept=".csv"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/10 transition-all text-sm"
            >
              <HiPlus className="text-lg" />
              เพิ่มสินค้า
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg shadow-surface-200/50 border border-surface-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">สินค้า</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">หมวดหมู่</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">ราคา</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">สต็อก</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">สถานะ</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-surface-400">กำลังโหลด...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-surface-400">ไม่พบสินค้า</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-surface-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <HiPhotograph className="text-xl text-surface-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-surface-800 text-sm">{product.name}</p>
                            <p className="text-xs text-surface-400 line-clamp-1 max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-surface-600">{product.category || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-surface-800">฿{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-medium ${
                          product.stockQuantity === 0
                            ? 'text-red-500'
                            : product.stockQuantity <= 5
                            ? 'text-amber-500'
                            : 'text-green-600'
                        }`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-surface-100 text-surface-500'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                            title="แก้ไข"
                          >
                            <HiPencil />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="ลบ"
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-surface-100 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-surface-900">
                {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors">
                <HiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="ชื่อสินค้า"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">รายละเอียด</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  placeholder="รายละเอียดสินค้า"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">ราคา (฿) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">จำนวนสต็อก *</label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">หมวดหมู่</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="เช่น Electronics, Furniture"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">รูปภาพสินค้า</label>
                <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-surface-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                  <HiPhotograph className="text-2xl text-surface-400" />
                  <span className="text-sm text-surface-500">
                    {form.image ? form.image.name : 'คลิกเพื่อเลือกรูป (JPEG, PNG, WebP)'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded border-surface-300 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-surface-700">เปิดขาย (Active)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50 transition-all text-sm font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/10 transition-all disabled:opacity-60 text-sm font-medium"
                >
                  {saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
