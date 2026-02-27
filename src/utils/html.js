/** Removes HTML tags, collapses whitespace. Used for short descriptions. */
export function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Removes HTML tags including embedded <style> blocks and stray CSS selectors.
 * Used for full product descriptions.
 */
export function stripHtmlDeep(html) {
  if (!html) return '';
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/#[a-zA-Z][\w-]*\s*\[[^\]]*\][^{]*\{[^}]*\}/g, ' ');
  text = text.replace(/[a-zA-Z#.[\]"=\-_]+\s*\{[^}]*\}/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

/** Decodes HTML entities like &lt; &nbsp; &oacute; etc. (browser-only). */
export function decodeHtmlEntities(input) {
  const s = String(input || '');
  if (!s) return '';
  if (typeof globalThis.window === 'undefined') return s;
  const txt = document.createElement('textarea');
  txt.innerHTML = s;
  return txt.value;
}

/** Normalizes NBSP and repeated whitespace to single spaces. */
export function normalizeSpaces(text) {
  return String(text || '')
    .replace(/\u00A0/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
