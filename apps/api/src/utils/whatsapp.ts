/**
 * generateWhatsAppLink
 * Generate link wa.me untuk direct chat.
 */
export function generateWhatsAppLink(
  phone: string,
  message?: string
): string {
  const baseUrl = "https://wa.me/";
  const url = new URL(`${baseUrl}${phone}`);
  if (message) {
    url.searchParams.set("text", message);
  }
  return url.toString();
}

/**
 * Template pesan pre-filled
 */
export function customerToStoreMessage(orderNumber: string): string {
  return `Halo, saya ingin bertanya tentang pesanan ${orderNumber}`;
}

export function storeToDriverMessage(
  orderNumber: string,
  customerName: string,
  deliveryAddress: string
): string {
  return `Pesanan ${orderNumber}\nCustomer: ${customerName}\nAlamat: ${deliveryAddress}\nMohon segera diantar. Terima kasih!`;
}

export function storeToCustomerMessage(
  orderNumber: string,
  status: string
): string {
  switch (status) {
    case "Paid":
      return `Pesanan Anda #${orderNumber} sudah kami terima! Kami akan segera memprosesnya.`;
    case "Preparing":
      return `Pesanan ${orderNumber} sedang disiapkan oleh tim dapur kami.`;
    case "Ready":
      return `Pesanan ${orderNumber} sudah siap! Silakan diambil atau tunggu kurir kami.`;
    case "Out for Delivery":
      return `Pesanan ${orderNumber} sedang dalam perjalanan ke alamat Anda.`;
    case "Completed":
      return `Terima kasih sudah memesan di Warung BuJo! Semoga Anda menikmati hidangan kami.`;
    case "Cancelled":
      return `Mohon maaf, pesanan ${orderNumber} terpaksa kami batalkan.`;
    default:
      return `Update status untuk pesanan ${orderNumber}: ${status}`;
  }
}
