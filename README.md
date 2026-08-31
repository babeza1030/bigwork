# ShopPro — ระบบร้านค้าออนไลน์

ระบบร้านค้าออนไลน์ครบวงจร พัฒนาด้วย React + Node.js + PostgreSQL

## ✨ Features

1. **ระบบสมัครสมาชิก & ล็อกอิน** — JWT Authentication + bcrypt
2. **จัดการสินค้า (CRUD)** — เพิ่ม, แก้ไข, ลบสินค้า (Admin only)
3. **ตะกร้าสินค้า** — เลือกสินค้า, ปรับจำนวน, ตรวจสอบสต็อก
4. **การตัดสต็อก** — ตัดสต็อกอัตโนมัติเมื่อสั่งซื้อ (DB Transaction)
5. **ใบสั่งขาย** — ออกใบสั่งขายพร้อมพิมพ์ (Print-ready)

## 🛠 Tech Stack

| Layer | Technology |
|:--|:--|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express 5 + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |

## 📁 Project Structure

```
├── frontend/          # React (Vite + Tailwind)
│   └── src/
│       ├── components/     # Shared components (Navbar)
│       ├── features/       # Feature modules
│       │   ├── auth/       # Login, Register
│       │   ├── products/   # Catalog, Detail, Admin CRUD
│       │   ├── cart/       # Cart, Checkout
│       │   └── orders/     # Order History, Invoice
│       ├── hooks/          # Auth context
│       └── services/       # API client (Axios)
│
├── backend/           # Express (TypeScript)
│   └── src/
│       ├── config/         # DB, Environment
│       ├── middleware/     # Auth, Error handler, Role guard
│       └── modules/       # Auth, Products, Cart, Orders
│           └── (controller, service, routes, validation)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### 1. Setup Database
```bash
# สร้าง database ชื่อ ecommerce_db ใน PostgreSQL
createdb ecommerce_db
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env    # แก้ไข DATABASE_URL ให้ตรงกับ PostgreSQL ของคุณ
npm install
npx prisma migrate dev  # สร้าง tables
npm run seed            # สร้างข้อมูลตัวอย่าง
npm run dev             # Start server at :4000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev             # Start app at :5173
```

### 4. Test Accounts
| Role | Email | Password |
|:--|:--|:--|
| Admin | admin@shop.com | Admin@1234 |
| Customer | user@shop.com | User@1234 |

## 📝 API Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | ล็อกอิน |
| GET | `/api/auth/me` | ข้อมูล user |
| GET | `/api/products` | รายการสินค้า |
| GET | `/api/products/:id` | รายละเอียดสินค้า |
| POST | `/api/products` | เพิ่มสินค้า (Admin) |
| PUT | `/api/products/:id` | แก้ไขสินค้า (Admin) |
| DELETE | `/api/products/:id` | ลบสินค้า (Admin) |
| GET | `/api/cart` | ดูตะกร้า |
| POST | `/api/cart` | เพิ่มลงตะกร้า |
| PUT | `/api/cart/:id` | แก้ไขจำนวน |
| DELETE | `/api/cart/:id` | ลบออกจากตะกร้า |
| POST | `/api/orders` | สร้างใบสั่งขาย |
| GET | `/api/orders` | ดูรายการคำสั่งซื้อ |
| GET | `/api/orders/:id` | ดูรายละเอียด/ใบสั่งขาย |
