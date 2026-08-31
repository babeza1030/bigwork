import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { HiShoppingCart, HiArrowLeft, HiMinus, HiPlus, HiTag, HiCube, HiPhotograph } from 'react-icons/hi';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch {
        toast.error('ไม่พบสินค้า');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', { productId: product!.id, quantity });
      toast.success(`เพิ่ม ${product!.name} x${quantity} ลงตะกร้าแล้ว`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถเพิ่มลงตะกร้าได้');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
      </div>
    );
  }

  if (!product) return null;

  const price = Number(product.price);

  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <HiArrowLeft /> กลับ
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-100 overflow-hidden animate-fade-in">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-72 md:h-full min-h-[400px] bg-gradient-to-br from-surface-100 to-surface-200">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <HiPhotograph className="text-8xl text-surface-300" />
                </div>
              )}
              {product.category && (
                <span className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-surface-700 text-sm font-medium rounded-lg flex items-center gap-1.5">
                  <HiTag className="text-primary-500" />
                  {product.category}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-8 md:p-10 flex flex-col">
              <h1 className="text-3xl font-bold text-surface-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.stockQuantity > 10
                    ? 'bg-green-100 text-green-700'
                    : product.stockQuantity > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <HiCube className="inline mr-1" />
                  {product.stockQuantity > 0 ? `คงเหลือ ${product.stockQuantity} ชิ้น` : 'สินค้าหมด'}
                </span>
              </div>

              <p className="text-surface-600 leading-relaxed mb-8 flex-1">
                {product.description || 'ไม่มีรายละเอียดสินค้า'}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-sm text-surface-500">ราคา</span>
                <div className="text-4xl font-bold text-primary-600">
                  ฿{price.toLocaleString('th-TH')}
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-surface-100 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-surface-600 hover:text-primary-600 transition-colors"
                  >
                    <HiMinus />
                  </button>
                  <span className="w-12 text-center font-semibold text-surface-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="p-3 text-surface-600 hover:text-primary-600 transition-colors"
                  >
                    <HiPlus />
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  disabled={product.stockQuantity === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/10 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <HiShoppingCart className="text-xl" />
                  เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
