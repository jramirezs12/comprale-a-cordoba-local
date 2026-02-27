/** Encodes a value for safe use as a URL path segment. */
export function encodePathSegment(value) {
  return encodeURIComponent(String(value ?? ''));
}

/** Decodes a URI component, handling stray % signs gracefully. */
export function safeDecodeURIComponent(value) {
  const s = String(value ?? '');
  const sanitized = s.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
  try {
    return decodeURIComponent(sanitized);
  } catch {
    return s;
  }
}

/** Normalizes a SKU for comparison: decode, collapse spaces, lowercase. */
export function normSku(value) {
  const s = String(value ?? '');
  const decoded = safeDecodeURIComponent(s);
  return decoded.replace(/\+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}
