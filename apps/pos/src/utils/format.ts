export const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.length >= 8) return '62' + d;
  return d;
}

export function formatPhoneDisplay(normalized: string): string {
  if (!normalized) return '';
  if (normalized.startsWith('62')) {
    const rest = normalized.slice(2);
    return '+62 ' + rest.replace(/(\d{3,4})(\d{4})(\d*)/, (_, a, b, c) => c ? `${a}-${b}-${c}` : `${a}-${b}`);
  }
  return normalized;
}
