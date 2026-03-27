CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"phone" varchar(50),
	"is_hq" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" NOT NULL,
	"phone_number" varchar(20),
	"email" varchar(255),
	"password_hash" text,
	"google_id" varchar(255),
	"full_name" varchar(255) DEFAULT '' NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"branch_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unique_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"is_customer" boolean DEFAULT false NOT NULL,
	"is_supplier" boolean DEFAULT false NOT NULL,
	CONSTRAINT "partners_unique_id_unique" UNIQUE("unique_id")
);
--> statement-breakpoint
CREATE TABLE "boms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"raw_material_id" uuid,
	"qty_required" numeric(12, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" text,
	"unit" varchar(50) DEFAULT 'pcs' NOT NULL,
	"price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"purchase_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"category_id" uuid,
	"is_sellable" boolean DEFAULT true NOT NULL,
	"is_raw_material" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"qty" numeric(12, 4) NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"partner_id" uuid,
	"order_type" "order_type" NOT NULL,
	"status" "order_status" DEFAULT 'Pending' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"payment_method" "payment_method",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"quota" integer DEFAULT 0 NOT NULL,
	"valid_until" timestamp,
	CONSTRAINT "vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"current_qty" numeric(12, 4) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_min_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"min_qty" numeric(12, 4) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_moves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"qty" numeric(12, 4) NOT NULL,
	"reference_type" "stock_reference_type" NOT NULL,
	"reference_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"qty" numeric(12, 4) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_number" varchar(50) NOT NULL,
	"supplier_id" uuid,
	"branch_id" uuid NOT NULL,
	"status" "purchase_status" DEFAULT 'Draft' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"received_at" timestamp,
	CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "stock_transfer_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"qty" numeric(12, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_number" varchar(50) NOT NULL,
	"from_branch_id" uuid NOT NULL,
	"to_branch_id" uuid NOT NULL,
	"status" "transfer_status" DEFAULT 'Draft' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"received_at" timestamp,
	CONSTRAINT "stock_transfers_transfer_number_unique" UNIQUE("transfer_number")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "account_type" NOT NULL,
	CONSTRAINT "accounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"reference" varchar(100),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "journal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"debit" numeric(12, 2) DEFAULT '0' NOT NULL,
	"credit" numeric(12, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"status" "driver_status" DEFAULT 'offline' NOT NULL,
	"current_order_id" uuid,
	"branch_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"google_id" varchar(255),
	"avatar_url" text,
	"address" text,
	"address_note" text,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_order_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "online_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"qty" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "online_order_status_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "online_order_status",
	"to_status" "online_order_status" NOT NULL,
	"changed_by" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"branch_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"status" "online_order_status" DEFAULT 'Pending' NOT NULL,
	"fulfillment_type" "online_fulfillment_type" NOT NULL,
	"pickup_scheduled_at" timestamp,
	"delivery_address" text,
	"delivery_latitude" numeric(10, 7),
	"delivery_longitude" numeric(10, 7),
	"delivery_fee" numeric(12, 2) DEFAULT '0',
	"delivery_notes" text,
	"driver_id" uuid,
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
	"voucher_id" uuid,
	"voucher_code" varchar(50),
	"customer_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"prepared_at" timestamp,
	"ready_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"pos_order_id" uuid,
	CONSTRAINT "online_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "online_store_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"slug" varchar(100) NOT NULL,
	"store_name" varchar(255) NOT NULL,
	"description" text,
	"banner_image" text,
	"logo_image" text,
	"operating_hours" jsonb,
	"delivery_enabled" boolean DEFAULT false NOT NULL,
	"pickup_enabled" boolean DEFAULT true NOT NULL,
	"delivery_radius" numeric(5, 1),
	"delivery_fee" numeric(12, 2),
	"min_order_amount" numeric(12, 2) DEFAULT '0',
	"estimated_prep_time" integer DEFAULT 15,
	"whatsapp_number" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "online_store_config_branch_id_unique" UNIQUE("branch_id"),
	CONSTRAINT "online_store_config_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "promos_vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"min_order" numeric(12, 2) DEFAULT '0',
	"max_discount" numeric(12, 2) DEFAULT '0',
	"usage_limit" integer DEFAULT 0 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promos_vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"promo_voucher_id" uuid NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boms" ADD CONSTRAINT "boms_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boms" ADD CONSTRAINT "boms_raw_material_id_products_id_fk" FOREIGN KEY ("raw_material_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_order_lines" ADD CONSTRAINT "pos_order_lines_order_id_pos_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."pos_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_order_lines" ADD CONSTRAINT "pos_order_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_orders" ADD CONSTRAINT "pos_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_orders" ADD CONSTRAINT "pos_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_orders" ADD CONSTRAINT "pos_orders_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stocks" ADD CONSTRAINT "product_stocks_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stocks" ADD CONSTRAINT "product_stocks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_min_levels" ADD CONSTRAINT "stock_min_levels_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_min_levels" ADD CONSTRAINT "stock_min_levels_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_partners_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfer_lines" ADD CONSTRAINT "stock_transfer_lines_transfer_id_stock_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."stock_transfers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfer_lines" ADD CONSTRAINT "stock_transfer_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_branch_id_branches_id_fk" FOREIGN KEY ("from_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_branch_id_branches_id_fk" FOREIGN KEY ("to_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_items" ADD CONSTRAINT "journal_items_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_items" ADD CONSTRAINT "journal_items_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_order_lines" ADD CONSTRAINT "online_order_lines_order_id_online_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."online_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_order_lines" ADD CONSTRAINT "online_order_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_order_status_log" ADD CONSTRAINT "online_order_status_log_order_id_online_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."online_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_orders" ADD CONSTRAINT "online_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_orders" ADD CONSTRAINT "online_orders_customer_id_online_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."online_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_orders" ADD CONSTRAINT "online_orders_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_orders" ADD CONSTRAINT "online_orders_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_orders" ADD CONSTRAINT "online_orders_pos_order_id_pos_orders_id_fk" FOREIGN KEY ("pos_order_id") REFERENCES "public"."pos_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_store_config" ADD CONSTRAINT "online_store_config_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_promo_voucher_id_promos_vouchers_id_fk" FOREIGN KEY ("promo_voucher_id") REFERENCES "public"."promos_vouchers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_phone" ON "users" USING btree ("phone_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_google_id" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE INDEX "idx_boms_product" ON "boms" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_boms_raw_material" ON "boms" USING btree ("raw_material_id");--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_pos_order_lines_order" ON "pos_order_lines" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_pos_orders_branch_date" ON "pos_orders" USING btree ("branch_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_pos_orders_status_type" ON "pos_orders" USING btree ("status","order_type");--> statement-breakpoint
CREATE INDEX "idx_pos_orders_incomplete" ON "pos_orders" USING btree ("branch_id") WHERE "pos_orders"."status" != 'Paid';--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_stocks_branch_product" ON "product_stocks" USING btree ("branch_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_product_stocks_branch" ON "product_stocks" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_product_stocks_qty" ON "product_stocks" USING btree ("branch_id","current_qty");--> statement-breakpoint
CREATE INDEX "idx_stock_moves_branch_product" ON "stock_moves" USING btree ("branch_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_stock_moves_reference" ON "stock_moves" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "idx_stock_moves_date" ON "stock_moves" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_journal_entries_date" ON "journal_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_journal_entries_reference" ON "journal_entries" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "idx_journal_items_entry" ON "journal_items" USING btree ("journal_entry_id");--> statement-breakpoint
CREATE INDEX "idx_journal_items_account" ON "journal_items" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_drivers_phone" ON "drivers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_drivers_branch_status" ON "drivers" USING btree ("branch_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_online_customers_phone" ON "online_customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_online_customers_email" ON "online_customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_online_order_lines_order" ON "online_order_lines" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_online_status_log_order" ON "online_order_status_log" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_online_status_log_date" ON "online_order_status_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_online_orders_branch_date" ON "online_orders" USING btree ("branch_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_online_orders_customer" ON "online_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_online_orders_status" ON "online_orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_online_orders_number" ON "online_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "idx_online_orders_payment" ON "online_orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_online_orders_driver" ON "online_orders" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "idx_user_vouchers_user" ON "user_vouchers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_vouchers_promo" ON "user_vouchers" USING btree ("promo_voucher_id");