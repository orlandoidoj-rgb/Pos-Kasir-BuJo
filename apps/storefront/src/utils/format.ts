export const formatRupiah = (value: number | string) => {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatPhone = (phone: string) => {
  // 628123456789 -> 0812-3456-789
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("62")) {
    clean = "0" + clean.slice(2);
  }
  return clean.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
};

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};
