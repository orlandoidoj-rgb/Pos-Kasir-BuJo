-- Fase 1: Enums
DO $$ BEGIN
    CREATE TYPE "online_order_status" AS ENUM('Pending', 'Paid', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "online_fulfillment_type" AS ENUM('pickup', 'delivery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1A. Tabel online_store_config
CREATE TABLE IF NOT EXISTS "online_store_config" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "branch_id" uuid NOT NULL REFERENCES "branches"("id"),
    "is_enabled" boolean NOT NULL DEFAULT false,
    "slug" varchar(100) NOT NULL UNIQUE,
    "store_name" varchar(255) NOT NULL,
    "description" text,
    "banner_image" text,
    "logo_image" text,
    "operating_hours" jsonb,
    "delivery_enabled" boolean NOT NULL DEFAULT false,
    "pickup_enabled" boolean NOT NULL DEFAULT true,
    "delivery_radius" numeric(5, 1),
    "delivery_fee" numeric(12, 2),
    "min_order_amount" numeric(12, 2) DEFAULT '0',
    "estimated_prep_time" integer DEFAULT 15,
    "whatsapp_number" varchar(20),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "online_store_config_branch_id_unique" UNIQUE("branch_id")
);

-- 1B. Tabel online_customers
CREATE TABLE IF NOT EXISTS "online_customers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar(255) NOT NULL,
    "email" varchar(255),
    "phone" varchar(20) NOT NULL,
    "google_id" varchar(255),
    "address" text,
    "latitude" numeric(10, 7),
    "longitude" numeric(10, 7),
    "total_orders" integer NOT NULL DEFAULT 0,
    "total_spent" numeric(12, 2) NOT NULL DEFAULT '0',
    "loyalty_points" integer NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "last_order_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_online_customers_phone" ON "online_customers" ("phone");
CREATE INDEX IF NOT EXISTS "idx_online_customers_email" ON "online_customers" ("email");
CREATE INDEX IF NOT EXISTS "idx_online_customers_google" ON "online_customers" ("google_id");

-- 1C. Tabel online_orders
CREATE TABLE IF NOT EXISTS "online_orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_number" varchar(50) NOT NULL UNIQUE,
    "branch_id" uuid NOT NULL REFERENCES "branches"("id"),
    "customer_id" uuid NOT NULL REFERENCES "online_customers"("id"),
    "status" "online_order_status" NOT NULL DEFAULT 'Pending',
    "fulfillment_type" "online_fulfillment_type" NOT NULL,
    "pickup_scheduled_at" timestamp,
    "delivery_address" text,
    "delivery_latitude" numeric(10, 7),
    "delivery_longitude" numeric(10, 7),
    "delivery_fee" numeric(12, 2) DEFAULT '0',
    "delivery_notes" text,
    "driver_name" varchar(255),
    "driver_phone" varchar(20),
    "subtotal" numeric(12, 2) NOT NULL,
    "discount" numeric(12, 2) DEFAULT '0',
    "total" numeric(12, 2) NOT NULL,
    "payment_method" varchar(50),
    "payment_status" varchar(20) DEFAULT 'unpaid',
    "midtrans_order_id" varchar(100),
    "midtrans_transaction_id" varchar(100),
    "paid_at" timestamp,
    "voucher_id" uuid REFERENCES "vouchers"("id"),
    "voucher_code" varchar(50),
    "customer_notes" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "confirmed_at" timestamp,
    "prepared_at" timestamp,
    "ready_at" timestamp,
    "completed_at" timestamp,
    "cancelled_at" timestamp,
    "cancel_reason" text,
    "pos_order_id" uuid REFERENCES "pos_orders"("id")
);

CREATE INDEX IF NOT EXISTS "idx_online_orders_branch_date" ON "online_orders" ("branch_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_online_orders_customer" ON "online_orders" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_online_orders_status" ON "online_orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_online_orders_number" ON "online_orders" ("order_number");
CREATE INDEX IF NOT EXISTS "idx_online_orders_payment" ON "online_orders" ("payment_status");

-- 1D. Tabel online_order_lines
CREATE TABLE IF NOT EXISTS "online_order_lines" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" uuid NOT NULL REFERENCES "online_orders"("id"),
    "product_id" uuid NOT NULL REFERENCES "products"("id"),
    "product_name" varchar(255) NOT NULL,
    "qty" integer NOT NULL,
    "price" numeric(12, 2) NOT NULL,
    "subtotal" numeric(12, 2) NOT NULL,
    "notes" text
);

CREATE INDEX IF NOT EXISTS "idx_online_order_lines_order" ON "online_order_lines" ("order_id");

-- 1E. Tabel online_order_status_log
CREATE TABLE IF NOT EXISTS "online_order_status_log" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" uuid NOT NULL REFERENCES "online_orders"("id"),
    "from_status" "online_order_status",
    "to_status" "online_order_status" NOT NULL,
    "changed_by" varchar(255),
    "notes" text,
    "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_online_status_log_order" ON "online_order_status_log" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_online_status_log_date" ON "online_order_status_log" ("created_at");
