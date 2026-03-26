export function generateWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  // Convert 08xx to 628xx
  const intl = cleaned.startsWith('0') ? '62' + cleaned.slice(1) : cleaned;
  const url = `https://wa.me/${intl}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function generateOrderWhatsAppMessage(orderNumber: string, storeName: string): string {
  return `Halo ${storeName}, saya ingin bertanya tentang pesanan saya #${orderNumber}`;
}

export function generateDriverWhatsAppMessage(orderNumber: string): string {
  return `Halo, saya pemesan #${orderNumber}. Posisi pengiriman saat ini di mana ya?`;
}
