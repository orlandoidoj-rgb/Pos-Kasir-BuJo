export function generateWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function getOrderWhatsAppMessage(orderNumber: string) {
  return `Halo, saya dari Warung BuJo ingin menginformasikan status pesanan Anda ${orderNumber}.`;
}

export function getDriverWhatsAppMessage(orderNumber: string, customerName: string, address: string, items: string, total: string) {
  return `Halo, ada pesanan delivery ${orderNumber}.\n\n` +
    `Pelanggan: ${customerName}\n` +
    `Alamat: ${address}\n\n` +
    `Menu:\n${items}\n\n` +
    `Total: ${total} (SUDAH DIBAYAR)\n\n` +
    `Mohon segera diantar. Terima kasih!`;
}
