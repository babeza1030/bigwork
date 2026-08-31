import prisma from './config/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      email: 'admin@shop.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      phone: '0812345678',
      address: '123 Admin Street, Bangkok 10100',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email} (password: Admin@1234)`);

  // Create test customer
  const customerPassword = await bcrypt.hash('User@1234', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'user@shop.com' },
    update: {},
    create: {
      email: 'user@shop.com',
      passwordHash: customerPassword,
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phone: '0898765432',
      address: '456 Customer Road, Bangkok 10200',
      role: 'CUSTOMER',
    },
  });
  console.log(`✅ Customer created: ${customer.email} (password: User@1234)`);

  // Create sample products
  const products = [
    {
      name: 'MacBook Pro 14"',
      description: 'Apple M3 Pro chip, 18GB RAM, 512GB SSD, Space Black. Professional laptop for developers and designers.',
      price: 69900,
      stockQuantity: 15,
      category: 'Electronics',
      imageUrl: null,
    },
    {
      name: 'iPhone 16 Pro Max',
      description: '256GB, Natural Titanium. A18 Pro chip with advanced camera system.',
      price: 48900,
      stockQuantity: 30,
      category: 'Electronics',
      imageUrl: null,
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Wireless noise-canceling headphones with exceptional sound quality and 30-hour battery life.',
      price: 11990,
      stockQuantity: 50,
      category: 'Electronics',
      imageUrl: null,
    },
    {
      name: 'Ergonomic Office Chair',
      description: 'Premium mesh back office chair with lumbar support, adjustable armrests, and breathable design.',
      price: 15900,
      stockQuantity: 20,
      category: 'Furniture',
      imageUrl: null,
    },
    {
      name: 'Standing Desk - Electric',
      description: 'Height-adjustable electric standing desk, 140x70cm, dual motor, memory presets.',
      price: 22900,
      stockQuantity: 12,
      category: 'Furniture',
      imageUrl: null,
    },
    {
      name: 'Mechanical Keyboard - Custom',
      description: 'Hot-swappable mechanical keyboard with RGB backlighting, Cherry MX switches, PBT keycaps.',
      price: 4590,
      stockQuantity: 40,
      category: 'Accessories',
      imageUrl: null,
    },
    {
      name: 'Logitech MX Master 3S',
      description: 'Advanced wireless mouse with MagSpeed scroll, 8K DPI sensor, quiet clicks.',
      price: 3490,
      stockQuantity: 35,
      category: 'Accessories',
      imageUrl: null,
    },
    {
      name: 'Samsung 4K Monitor 32"',
      description: 'UHD 4K IPS display, HDR10, USB-C connectivity, height-adjustable stand.',
      price: 16900,
      stockQuantity: 18,
      category: 'Electronics',
      imageUrl: null,
    },
    {
      name: 'Desk Lamp - LED Smart',
      description: 'Eye-care LED desk lamp with adjustable color temperature, brightness, and USB charging port.',
      price: 2290,
      stockQuantity: 60,
      category: 'Accessories',
      imageUrl: null,
    },
    {
      name: 'Laptop Backpack - Premium',
      description: 'Water-resistant laptop backpack with anti-theft design, USB port, fits 15.6" laptops.',
      price: 1890,
      stockQuantity: 45,
      category: 'Accessories',
      imageUrl: null,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(product) + 1 },
      update: {},
      create: product,
    });
  }
  console.log(`✅ ${products.length} products created`);

  console.log('\n🎉 Seed complete!\n');
  console.log('Admin login: admin@shop.com / Admin@1234');
  console.log('User login:  user@shop.com / User@1234\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
