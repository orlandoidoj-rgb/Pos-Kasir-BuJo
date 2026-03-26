const { Pool } = require('./apps/api/node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://warungbujo:BuJo2026SecurePass!@localhost:5432/warungbujo' });

const sql = `
-- Enums
DO $$ BEGIN CREATE TYPE user_role AS ENUM('master','cashier','manager'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_type AS ENUM('Regular','Takeaway','Delivery'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM('Pending','Completed','Cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM('Cash','QRIS','Transfer','Credit'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE stock_move_type AS ENUM('in','out','adjustment'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE reference_type AS ENUM('pos_sale','purchase','transfer_in','transfer_out','adjustment','initial'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE account_type AS ENUM('asset','liability','equity','revenue','expense'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE po_status AS ENUM('Draft','Ordered','Partial','Done','Cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE online_order_status AS ENUM('Pending','Paid','Confirmed','Preparing','Ready','Out for Delivery','Completed','Cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE online_fulfillment_type AS ENUM('pickup','delivery'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE driver_status AS ENUM('available','busy','offline'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  is_hq BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  branch_id UUID REFERENCES branches(id)
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  is_customer BOOLEAN DEFAULT false NOT NULL,
  is_supplier BOOLEAN DEFAULT false NOT NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  image TEXT,
  unit VARCHAR(50) DEFAULT 'pcs' NOT NULL,
  price NUMERIC(12,2) DEFAULT '0' NOT NULL,
  purchase_price NUMERIC(12,2) DEFAULT '0' NOT NULL,
  category_id UUID REFERENCES categories(id),
  is_sellable BOOLEAN DEFAULT true NOT NULL,
  is_raw_material BOOLEAN DEFAULT false NOT NULL
);

-- BOMs
CREATE TABLE IF NOT EXISTS boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  raw_material_id UUID REFERENCES products(id),
  qty_required NUMERIC(12,4) NOT NULL
);

-- Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL,
  value NUMERIC(12,2) NOT NULL,
  quota INTEGER DEFAULT 0 NOT NULL,
  valid_until TIMESTAMP
);

-- POS Orders
CREATE TABLE IF NOT EXISTS pos_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  user_id UUID NOT NULL REFERENCES users(id),
  partner_id UUID REFERENCES partners(id),
  order_type order_type NOT NULL,
  status order_status DEFAULT 'Pending' NOT NULL,
  total NUMERIC(12,2) DEFAULT '0' NOT NULL,
  discount NUMERIC(12,2) DEFAULT '0' NOT NULL,
  payment_method payment_method,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- POS Order Lines
CREATE TABLE IF NOT EXISTS pos_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES pos_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  qty NUMERIC(12,4) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

-- Product Stocks
CREATE TABLE IF NOT EXISTS product_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  product_id UUID NOT NULL REFERENCES products(id),
  current_qty NUMERIC(12,4) DEFAULT '0' NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_stocks_branch_product ON product_stocks(branch_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_stocks_branch ON product_stocks(branch_id);

-- Stock Moves
CREATE TABLE IF NOT EXISTS stock_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  product_id UUID NOT NULL REFERENCES products(id),
  qty NUMERIC(12,4) NOT NULL,
  reference_type reference_type NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_moves_branch_product ON stock_moves(branch_id, product_id);

-- Stock Min Levels
CREATE TABLE IF NOT EXISTS stock_min_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  product_id UUID NOT NULL REFERENCES products(id),
  min_qty NUMERIC(12,4) DEFAULT '0' NOT NULL
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  partner_id UUID REFERENCES partners(id),
  status po_status DEFAULT 'Draft' NOT NULL,
  total NUMERIC(12,2) DEFAULT '0' NOT NULL,
  notes TEXT,
  ordered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Purchase Order Lines
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  qty NUMERIC(12,4) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  received_qty NUMERIC(12,4) DEFAULT '0' NOT NULL
);

-- Stock Transfers
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_branch_id UUID REFERENCES branches(id),
  to_branch_id UUID REFERENCES branches(id),
  status VARCHAR(20) DEFAULT 'Draft' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Stock Transfer Lines
CREATE TABLE IF NOT EXISTS stock_transfer_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES stock_transfers(id),
  product_id UUID NOT NULL REFERENCES products(id),
  qty NUMERIC(12,4) NOT NULL
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type account_type NOT NULL
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP DEFAULT now() NOT NULL,
  reference VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);

-- Journal Items
CREATE TABLE IF NOT EXISTS journal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  debit NUMERIC(12,2) DEFAULT '0' NOT NULL,
  credit NUMERIC(12,2) DEFAULT '0' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_journal_items_entry ON journal_items(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_account ON journal_items(account_id);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  status driver_status NOT NULL DEFAULT 'offline',
  current_order_id UUID,
  branch_id UUID NOT NULL REFERENCES branches(id),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_branch_status ON drivers(branch_id, status);

-- Online Customers
CREATE TABLE IF NOT EXISTS online_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  google_id VARCHAR(255),
  avatar_url TEXT,
  address TEXT,
  address_note TEXT,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  total_spent NUMERIC(12,2) DEFAULT '0',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  last_order_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_online_customers_phone ON online_customers(phone);
CREATE INDEX IF NOT EXISTS idx_online_customers_email ON online_customers(email);
CREATE INDEX IF NOT EXISTS idx_online_customers_google ON online_customers(google_id);

-- Online Store Config
CREATE TABLE IF NOT EXISTS online_store_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) UNIQUE,
  is_enabled BOOLEAN DEFAULT false NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  store_name VARCHAR(255) NOT NULL,
  description TEXT,
  banner_image TEXT,
  logo_image TEXT,
  operating_hours JSONB,
  delivery_enabled BOOLEAN DEFAULT false NOT NULL,
  pickup_enabled BOOLEAN DEFAULT true NOT NULL,
  delivery_radius NUMERIC(5,1),
  delivery_fee NUMERIC(12,2),
  min_order_amount NUMERIC(12,2) DEFAULT '0',
  estimated_prep_time INTEGER DEFAULT 15,
  whatsapp_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Online Orders
CREATE TABLE IF NOT EXISTS online_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  branch_id UUID NOT NULL REFERENCES branches(id),
  customer_id UUID NOT NULL REFERENCES online_customers(id),
  status online_order_status NOT NULL DEFAULT 'Pending',
  fulfillment_type online_fulfillment_type NOT NULL,
  pickup_scheduled_at TIMESTAMP,
  delivery_address TEXT,
  delivery_latitude NUMERIC(10,7),
  delivery_longitude NUMERIC(10,7),
  delivery_fee NUMERIC(12,2) DEFAULT '0',
  delivery_notes TEXT,
  driver_id UUID REFERENCES drivers(id),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  subtotal NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) DEFAULT '0',
  total NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  midtrans_order_id VARCHAR(100),
  midtrans_transaction_id VARCHAR(100),
  paid_at TIMESTAMP,
  voucher_id UUID REFERENCES vouchers(id),
  voucher_code VARCHAR(50),
  customer_notes TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMP,
  prepared_at TIMESTAMP,
  ready_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancel_reason TEXT,
  pos_order_id UUID REFERENCES pos_orders(id)
);
CREATE INDEX IF NOT EXISTS idx_online_orders_branch_date ON online_orders(branch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_online_orders_customer ON online_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_status ON online_orders(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_online_orders_number ON online_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_online_orders_payment ON online_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_online_orders_driver ON online_orders(driver_id);

-- Online Order Lines
CREATE TABLE IF NOT EXISTS online_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES online_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  qty INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_online_order_lines_order ON online_order_lines(order_id);

-- Online Order Status Log
CREATE TABLE IF NOT EXISTS online_order_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES online_orders(id),
  from_status online_order_status,
  to_status online_order_status NOT NULL,
  changed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_online_status_log_order ON online_order_status_log(order_id);
CREATE INDEX IF NOT EXISTS idx_online_status_log_date ON online_order_status_log(created_at);

SELECT 'Schema created successfully!' as status;
`;

pool.query(sql)
  .then(result => {
    console.log('Migration completed:', result[result.length - 1]?.rows?.[0]?.status || 'OK');
    pool.end();
  })
  .catch(err => {
    console.error('Migration error:', err.message);
    pool.end();
    process.exit(1);
  });
