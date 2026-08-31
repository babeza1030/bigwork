import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Product, Pagination } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiSearch, HiShoppingCart, HiChevronLeft, HiChevronRight, HiFilter, HiPhotograph } from 'react-icons/hi';

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12, sortBy, sortOrder };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.get('/products', { params });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch {
      toast.error('ไม่สามารถโหลดสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.categories);
    } catch {}
  };

  useEffect(() => {
    fetchProducts(1);
  }, [category, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const addToCart = async (productId: number) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    try {
      await api.post('/cart', { productId, quantity: 1 });
      toast.success('เพิ่มลงตะกร้าแล้ว');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถเพิ่มลงตะกร้าได้');
    }
  };

  const formatPrice = (price: number | string) => {
    return Number(price).toLocaleString('th-TH', { minimumFractionDigits: 0 });
  };

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-surface-900 rounded-3xl p-8 md:p-12 mb-8 text-white border border-surface-800">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">สินค้าทั้งหมด</h1>
            <p className="text-white/70 text-lg mb-6">เลือกซื้อสินค้าคุณภาพดี ราคาสุดคุ้ม</p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาสินค้า..."
                  className="w-full pl-11 pr-4 py-3 bg-white/95 backdrop-blur-sm text-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-medium hover:bg-white/30 transition-all border border-white/20"
              >
                ค้นหา
              </button>
            </form>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Category Filter & Sorting - Sidebar (Left) */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6 md:sticky md:top-24">
            {/* Category Filter */}
            <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-lg shadow-surface-200/50">
              <h2 className="text-base font-bold text-primary-600 mb-4 pb-2 border-b border-surface-100 flex items-center gap-2">
                <HiFilter />
                หมวดหมู่ / ประเภทสินค้า
              </h2>
              <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setCategory('')}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    !category
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  ทั้งหมด
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat!)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap md:whitespace-normal ${
                      category === cat
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting Widget */}
            <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-lg shadow-surface-200/50">
              <h2 className="text-base font-bold text-surface-900 mb-4 pb-2 border-b border-surface-100">
                เรียงตาม
              </h2>
              <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); }}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    sortBy === 'createdAt' && sortOrder === 'desc'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  สินค้าใหม่
                </button>
                <button
                  onClick={() => { setSortBy('id'); setSortOrder('desc'); }}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    sortBy === 'id' && sortOrder === 'desc'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  สินค้าขายดี
                </button>
                <button
                  onClick={() => { setSortBy('name'); setSortOrder('asc'); }}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    sortBy === 'name' && sortOrder === 'asc'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  แนะนำ
                </button>
                <button
                  onClick={() => { setSortBy('price'); setSortOrder('asc'); }}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    sortBy === 'price' && sortOrder === 'asc'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  ราคา ต่ำ-สูง
                </button>
                <button
                  onClick={() => { setSortBy('price'); setSortOrder('desc'); }}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    sortBy === 'price' && sortOrder === 'desc'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  ราคา สูง-ต่ำ
                </button>
              </div>
            </div>
          </div>

          {/* Products & Pagination (Right) */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-surface-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-surface-200 rounded w-3/4"></div>
                      <div className="h-3 bg-surface-100 rounded w-full"></div>
                      <div className="h-6 bg-surface-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
                <div className="text-6xl mb-4 flex justify-center text-surface-300"><HiSearch /></div>
                <h3 className="text-xl font-semibold text-surface-700 mb-2">ไม่พบสินค้า</h3>
                <p className="text-surface-500">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนหมวดหมู่ / ประเภทสินค้า</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-surface-100 hover:shadow-xl hover:shadow-surface-200/50 hover:border-primary-200 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image */}
                    <Link to={`/products/${product.id}`} className="block relative h-48 bg-gradient-to-br from-surface-100 to-surface-200 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiPhotograph className="text-5xl text-surface-300" />
                        </div>
                      )}
                      {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-warning-500 text-white text-xs font-semibold rounded-lg shadow-lg">
                          เหลือ {product.stockQuantity} ชิ้น
                        </span>
                      )}
                      {product.stockQuantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg">สินค้าหมด</span>
                        </div>
                      )}
                      {product.category && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-surface-600 text-xs font-medium rounded-lg">
                          {product.category}
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-5">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-surface-800 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-surface-500 line-clamp-2 mb-3 min-h-[2.5rem]">
                        {product.description || 'ไม่มีรายละเอียด'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-primary-600">
                            ฿{formatPrice(product.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={product.stockQuantity === 0}
                          className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-md shadow-primary-500/25 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title="เพิ่มลงตะกร้า"
                        >
                          <HiShoppingCart className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => fetchProducts(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <HiChevronLeft />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchProducts(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === pagination.page
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                        : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => fetchProducts(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <HiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
