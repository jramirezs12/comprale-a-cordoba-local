export function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price || 0);
}

export function formatDisplayNumber(value, format) {
  if (format === 'currency') {
    if (value < 1000) return String(Math.floor(value));
    const k = Math.floor(value / 1000);
    return `${k}k`;
  }
  return String(Math.floor(value));
}
