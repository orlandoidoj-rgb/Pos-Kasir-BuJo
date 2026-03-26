import { pgEnum } from "drizzle-orm/pg-core";

export const onlineOrderStatusEnum = pgEnum("online_order_status", [
  "Pending",          // Baru masuk, belum dibayar
  "Paid",             // Sudah bayar, menunggu konfirmasi toko
  "Confirmed",        // Toko konfirmasi, mulai diproses
  "Preparing",        // Sedang dimasak
  "Ready",            // Siap diambil (pickup) atau siap dikirim
  "Out for Delivery", // Sedang diantar (delivery)
  "Completed",        // Selesai
  "Cancelled",        // Dibatalkan
]);

export const onlineFulfillmentEnum = pgEnum("online_fulfillment_type", [
  "pickup",           // Ambil sendiri
  "delivery",         // Diantar
]);

export const driverStatusEnum = pgEnum("driver_status", [
  "available",  // Siap terima orderan
  "busy",       // Sedang antar pesanan
  "offline",    // Tidak aktif
]);
