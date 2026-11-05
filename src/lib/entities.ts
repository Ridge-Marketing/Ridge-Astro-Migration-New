/**
 * Decode HTML entities in plain-text strings from WP.
 *
 * WP and Yoast hand back titles, descriptions and schema names already
 * HTML-encoded ("Dun &amp; Bradstreet", "[&hellip;]", "&#8217;"). Astro
 * escapes text and attributes again on render, so without decoding first,
 * search results and social cards show the entity literally. Decodes once:
 * a literal "&amp;amp;" in the source stays "&amp;".
 */
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', bull: '•', middot: '·',
  copy: '©', reg: '®', trade: '™', deg: '°', times: '×', eacute: 'é',
};

export function decodeEntities(value: string): string;
export function decodeEntities(value: string | undefined | null): string | undefined | null;
export function decodeEntities(value: string | undefined | null) {
  if (!value) return value;
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    }
    return NAMED[code.toLowerCase()] ?? match;
  });
}

/** decodeEntities on every string in a JSON-like value (Yoast schema) */
export function decodeDeep<T>(value: T): T {
  if (typeof value === 'string') return decodeEntities(value) as T;
  if (Array.isArray(value)) return value.map(decodeDeep) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decodeDeep(v)])) as T;
  }
  return value;
}
