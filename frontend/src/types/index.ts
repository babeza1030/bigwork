// TypeScript interfaces for the E-Commerce system

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  stockQuantity: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  totalAmount: number | string;
  taxAmount: number | string;
  grandTotal: number | string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  orderItems?: OrderItem[];
  _count?: { orderItems: number };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}
