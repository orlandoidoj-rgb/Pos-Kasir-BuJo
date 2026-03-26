const { Pool } = require('./apps/api/node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://warungbujo:BuJo2026SecurePass!@localhost:5432/warungbujo' });

const sql = `
-- Branches
INSERT INTO branches (id, name, address, phone, is_hq) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Warung BuJo Pusat', 'Jl. Merdeka No. 1, Malang', '0341-123456', true),
  ('b0000000-0000-0000-0000-000000000002', 'Warung BuJo Lowokwaru', 'Jl. Soekarno Hatta No. 5, Malang', '0341-654321', false)
ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users (id, email, password_hash, role, branch_id) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'admin@warungbujo.com', 'google_auth', 'master', 'b0000000-0000-0000-0000-000000000001'),
  ('a0000001-0000-0000-0000-000000000002', 'kasir@warungbujo.com', 'google_auth', 'cashier', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Accounts
INSERT INTO accounts (id, code, name, type) VALUES
  ('ac000001-0000-0000-0000-000000000001', '1101', 'Kas', 'asset'),
  ('ac000001-0000-0000-0000-000000000002', '1401', 'Persediaan Bahan Baku', 'asset'),
  ('ac000001-0000-0000-0000-000000000003', '2101', 'Hutang Usaha', 'liability'),
  ('ac000001-0000-0000-0000-000000000004', '3101', 'Modal Pemilik', 'equity'),
  ('ac000001-0000-0000-0000-000000000005', '4101', 'Pendapatan Penjualan', 'revenue'),
  ('ac000001-0000-0000-0000-000000000006', '4201', 'Pendapatan Lain-lain', 'revenue'),
  ('ac000001-0000-0000-0000-000000000007', '5101', 'Harga Pokok Penjualan', 'expense'),
  ('ac000001-0000-0000-0000-000000000008', '5201', 'Beban Penyusutan Persediaan', 'expense')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name) VALUES
  ('ca000001-0000-0000-0000-000000000001', 'Makanan'),
  ('ca000001-0000-0000-0000-000000000002', 'Minuman')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, name, price, purchase_price, category_id, unit, is_sellable, is_raw_material, image) VALUES
  ('dd000001-0000-0000-0000-000000000001', 'Nasi Goreng BuJo', '25000', '10000', 'ca000001-0000-0000-0000-000000000001', 'Porsi', true, false, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400'),
  ('dd000001-0000-0000-0000-000000000002', 'Ayam Geprek', '22000', '9000', 'ca000001-0000-0000-0000-000000000001', 'Porsi', true, false, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'),
  ('dd000001-0000-0000-0000-000000000003', 'Mie Goreng Spesial', '20000', '8000', 'ca000001-0000-0000-0000-000000000001', 'Porsi', true, false, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400'),
  ('dd000001-0000-0000-0000-000000000004', 'Es Teh Manis', '8000', '2000', 'ca000001-0000-0000-0000-000000000002', 'Gelas', true, false, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
  ('dd000001-0000-0000-0000-000000000005', 'Es Jeruk', '10000', '3000', 'ca000001-0000-0000-0000-000000000002', 'Gelas', true, false, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400'),
  ('dd000001-0000-0000-0000-000000000006', 'Kopi Susu', '15000', '5000', 'ca000001-0000-0000-0000-000000000002', 'Gelas', true, false, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400')
ON CONFLICT (id) DO NOTHING;

-- Online Store Config
INSERT INTO online_store_config (id, branch_id, is_enabled, slug, store_name, description, pickup_enabled, delivery_enabled, delivery_fee, min_order_amount, estimated_prep_time, whatsapp_number) VALUES
  ('ee000001-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', true, 'malang-pusat', 'Warung BuJo Malang Pusat', 'Warung makan khas Malang sejak 2020. Nasi goreng, ayam geprek, dan minuman segar!', true, true, '10000', '20000', 15, '6281234567890')
ON CONFLICT (id) DO NOTHING;

-- Drivers
INSERT INTO drivers (id, name, phone, email, status, branch_id) VALUES
  ('ff000001-0000-0000-0000-000000000001', 'Pak Budi', '6281234567001', 'budi@driver.com', 'available', 'b0000000-0000-0000-0000-000000000001'),
  ('ff000001-0000-0000-0000-000000000002', 'Mas Anto', '6281234567002', 'anto@driver.com', 'available', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

SELECT 'Seed complete!' as status;
`;

pool.query(sql)
  .then(() => {
    return Promise.all([
      pool.query('SELECT count(*) as cnt FROM branches'),
      pool.query('SELECT count(*) as cnt FROM products'),
      pool.query('SELECT count(*) as cnt FROM drivers'),
    ]);
  })
  .then(([b, p, d]) => {
    console.log(`Seed OK — branches: ${b.rows[0].cnt}, products: ${p.rows[0].cnt}, drivers: ${d.rows[0].cnt}`);
    pool.end();
  })
  .catch(err => {
    console.error('Seed error:', err.message);
    pool.end();
    process.exit(1);
  });
