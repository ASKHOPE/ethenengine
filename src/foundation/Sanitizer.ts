// Security Helper: HTML Entity Escaping function to prevent Cross-Site Scripting (XSS)

export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  if (typeof Bun !== 'undefined' && typeof (Bun as any).escapeHTML === 'function') {
    return (Bun as any).escapeHTML(str);
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

