export function generateWhatsAppLink(
  phone: string,
  message?: string
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  let finalPhone = cleanPhone;
  if (finalPhone.startsWith("0")) {
    finalPhone = "62" + finalPhone.slice(1);
  }

  const baseUrl = "https://wa.me/";
  const url = new URL(`${baseUrl}${finalPhone}`);
  if (message) {
    url.searchParams.set("text", message);
  }
  return url.toString();
}

export const getOrderWhatsAppMessage = (orderNumber: string) => {
  return `Halo Warung BuJo, saya ingin bertanya tentang pesanan saya dengan nomor ${orderNumber}.`;
};
