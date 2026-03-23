-- Fase 6: Simplifikasi online_customers

-- 1. Tambah kolom address_note
ALTER TABLE "online_customers" ADD COLUMN IF NOT EXISTS "address_note" text;

-- 2. Hapus kolom yang tidak diperlukan
ALTER TABLE "online_customers" DROP COLUMN IF EXISTS "google_id";
ALTER TABLE "online_customers" DROP COLUMN IF EXISTS "latitude";
ALTER TABLE "online_customers" DROP COLUMN IF EXISTS "longitude";
ALTER TABLE "online_customers" DROP COLUMN IF EXISTS "loyalty_points";

-- 3. Pastikan email NOT NULL (Hati-hati: jika ada data existing tanpa email, ini akan gagal. Tapi karena ini sesi awal, asumsikan aman)
-- Jika ingin aman: UPDATE "online_customers" SET email = 'default@example.com' WHERE email IS NULL;
ALTER TABLE "online_customers" ALTER COLUMN "email" SET NOT NULL;

-- 4. Drop index yang sudah tidak relevan
DROP INDEX IF EXISTS "idx_online_customers_google";
