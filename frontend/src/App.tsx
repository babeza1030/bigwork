import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProductCatalog from './features/products/ProductCatalog';
import ProductDetail from './features/products/ProductDetail';
import ProductManagement from './features/products/ProductManagement';
import CartPage from './features/cart/CartPage';
import CheckoutPage from './features/cart/CheckoutPage';
import OrderHistory from './features/orders/OrderHistory';
import OrderInvoice from './features/orders/OrderInvoice';

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<><Navbar /><ProductCatalog /></>} />
      <Route path="/products/:id" element={<><Navbar /><ProductDetail /></>} />

      {/* Guest only */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected */}
      <Route path="/cart" element={<ProtectedRoute><Navbar /><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Navbar /><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Navbar /><OrderHistory /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><Navbar /><OrderInvoice /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/admin/products" element={<ProtectedRoute adminOnly><Navbar /><ProductManagement /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
