/**
 * WordPress REST API client
 * Replaces all GraphQL queries from the Gatsby site
 */
import type {
  WpPage,
  WpPost,
  WpService,
  WpProject,
  WpLander,
  WpMenuItem,
  WpGlobalSettings,
} from './wp-types';

const WP_BASE = import.meta.env.WP_BASE_URL;
const WP_API  = `${WP_BASE}/wp/v2`;
const ACF_API = `${WP_BASE}/acf/v3`;

// ============================================
// Utility: snake_case → camelCase key transform
// ============================================

export function snakeToCamel(str: string): string {
  // Collapse multiple underscores into single, then convert to camelCase
  return str
    .replace(/_{2,}/g, '_')
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        acc[snakeToCamel(key)] = transformKeys(value);
        return acc;
      },
      {} as Record<string, any>
    );
  }
  return obj;
}

// ============================================
// Fetch helpers
// ============================================

// Optional Basic auth for endpoints that require it (WP Application Password)
// Set WP_AUTH=username:application_password in your .env file
const WP_AUTH = import.meta.env.WP_AUTH as string | undefined;
const authHeader = WP_AUTH
  ? { Authorization: `Basic ${Buffer.from(WP_AUTH).toString('base64')}` }
  : {};

async function fetchJSON<T>(url: string, retries = 3, authenticated = false): Promise<T> {
  const headers = authenticated ? authHeader : {};
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, { headers });
    if (res.ok) return res.json() as Promise<T>;
    if (res.status === 429 && attempt < retries - 1) {
      const delay = Math.pow(2, attempt + 1) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    throw new Error(`WP API error: ${res.status} ${res.statusText} for ${url}`);
  }
  throw new Error(`WP API: max retries exceeded for ${url}`);
}

/**
 * Fetches all items from a paginated WP endpoint (max 100 per page).
 * Follows X-WP-TotalPages header to get every page.
 */
async function fetchAllPaginated<T>(baseUrl: string, authenticated = false): Promise<T[]> {
  const separator     = baseUrl.includes('?') ? '&' : '?';
  const firstPageUrl  = `${baseUrl}${separator}per_page=50&page=1`;
  const headers       = authenticated ? authHeader : {};

  let firstRes: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    firstRes = await fetch(firstPageUrl, { headers });
    if (firstRes.ok) break;
    if (firstRes.status === 429 && attempt < 2) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
      continue;
    }
    throw new Error(`WP API error: ${firstRes.status} for ${firstPageUrl}`);
  }

  if (!firstRes || !firstRes.ok) {
    throw new Error(`WP API error: failed to fetch ${firstPageUrl}`);
  }

  const totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1', 10);
  const firstPageData: T[] = await firstRes.json();

  if (totalPages <= 1) return firstPageData;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchJSON<T[]>(`${baseUrl}${separator}per_page=50&page=${i + 2}`, 3, authenticated)
    )
  );

  return [...firstPageData, ...remaining.flat()];
}

// ============================================
// Content type fetchers
// ============================================

/** Build-time cache for all pages */
let pagesCache: WpPage[] | null = null;
let pagesFetchPromise: Promise<WpPage[]> | null = null;

export async function getPages(): Promise<WpPage[]> {
  if (pagesCache) return pagesCache;
  if (pagesFetchPromise) return pagesFetchPromise;

  pagesFetchPromise = fetchAllPaginated<WpPage>(`${WP_API}/pages?_embed`).then((pages) => {
    pagesCache = pages;
    return pages;
  });

  return pagesFetchPromise;
}

export async function getPageBySlug(slug: string): Promise<WpPage | null> {
  const pages = await fetchJSON<WpPage[]>(
    `${WP_API}/pages?slug=${encodeURIComponent(slug)}&_embed`
  );
  return pages[0] || null;
}

export async function getPageById(id: number): Promise<WpPage> {
  return fetchJSON<WpPage>(`${WP_API}/pages/${id}?_embed`);
}

const serviceCache = new Map<number, WpService | null>();

export async function getServiceById(id: number): Promise<WpService | null> {
  if (!id || typeof id !== 'number') return null;
  if (serviceCache.has(id)) return serviceCache.get(id)!;

  try {
    // Authenticated: unpublished/private services 401 without credentials
    const service = await fetchJSON<WpService>(`${WP_API}/service/${id}?_embed`, 3, true);
    serviceCache.set(id, service);
    return service;
  } catch {
    serviceCache.set(id, null);
    return null;
  }
}


export async function getFrontPage(): Promise<WpPage | null> {
  // WP settings: show_on_front = page, page_on_front = id
  const settings = await fetchJSON<{ page_on_front: number }>(
    `${WP_BASE}/wp/v2/settings`
  ).catch(() => null);

  if (settings?.page_on_front) {
    return getPageById(settings.page_on_front);
  }
  // Fallback: try to find a page with template "front-page" or slug "home"
  const pages = await fetchJSON<WpPage[]>(
    `${WP_API}/pages?slug=home&_embed`
  );
  return pages[0] || null;
}

/** Build-time cache for all posts */
let postsCache: WpPost[] | null = null;
let postsFetchPromise: Promise<WpPost[]> | null = null;

export async function getPosts(): Promise<WpPost[]> {
  if (postsCache) return postsCache;
  if (postsFetchPromise) return postsFetchPromise;

  postsFetchPromise = fetchAllPaginated<WpPost>(`${WP_API}/posts?_embed&orderby=date&order=desc`).then((posts) => {
    postsCache = posts;
    return posts;
  });

  return postsFetchPromise;
}

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  const posts = await fetchJSON<WpPost[]>(
    `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed`
  );
  return posts[0] || null;
}

let sevicesCache: WpService[] | null = null
let servicesFetchPromise: Promise<WpService[]> | null = null;


export async function getServices(): Promise<WpService[]> {
  if (sevicesCache) return sevicesCache;
  if (servicesFetchPromise) return servicesFetchPromise;

  servicesFetchPromise = fetchAllPaginated<WpService>(`${WP_API}/service?_embed`).then((posts) => {
    sevicesCache = posts;
    return posts;
  });

  return servicesFetchPromise
}

export async function getServiceBySlug(slug: string): Promise<WpService | null> {
  const items = await fetchJSON<WpService[]>(
    `${WP_API}/service?slug=${encodeURIComponent(slug)}&_embed`
  );
  return items[0] || null;
}

export async function getProjects(): Promise<WpProject[]> {
  return fetchAllPaginated<WpProject>(`${WP_API}/project?_embed`);
}

export async function getProjectBySlug(slug: string): Promise<WpProject | null> {
  const items = await fetchJSON<WpProject[]>(
    `${WP_API}/project?slug=${encodeURIComponent(slug)}&_embed`
  );
  return items[0] || null;
}

export async function getLanders(): Promise<WpLander[]> {
  return fetchAllPaginated<WpLander>(`${WP_API}/lander?_embed`);
}

export async function getLanderBySlug(slug: string): Promise<WpLander | null> {
  const items = await fetchJSON<WpLander[]>(
    `${WP_API}/lander?slug=${encodeURIComponent(slug)}&_embed`
  );
  return items[0] || null;
}

export async function getOptionsPage(): Promise<any>{
  const options = await fetchJSON<any []>(
    `${WP_BASE}/options/all`
  )
  return options
}

// ============================================
// Menus
// ============================================

/**
 * Fetches menu items and builds a tree structure.
 * Requires WP 5.9+ or the "WP REST API Menus" plugin.
 * Menu IDs/locations need to be discovered via the menus endpoint.
 */
export async function getMenuItems(menuIdOrSlug: string | number): Promise<WpMenuItem[]> {
  const items = await fetchAllPaginated<any>(
    `${WP_API}/menu-items?menus=${menuIdOrSlug}&_embed`,
    true
  );

  // Build tree: items with parent === 0 are top-level
  const map = new Map<number, WpMenuItem>();
  const tree: WpMenuItem[] = [];

  for (const item of items) {
    const menuItem: WpMenuItem = {
      id: item.id,
      title: item.title,
      url: item.url,
      parent: item.parent || 0,
      menu_order: item.menu_order,
      acf: item.acf,
      children: [],
    };
    map.set(item.id, menuItem);
  }

  for (const item of map.values()) {
    if (item.parent === 0) {
      tree.push(item);
    } else {
      const parent = map.get(item.parent);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(item);
      }
    }
  }

  // Sort by menu_order
  const sortItems = (items: WpMenuItem[]) => {
    items.sort((a, b) => a.menu_order - b.menu_order);
    for (const item of items) {
      if (item.children?.length) sortItems(item.children);
    }
  };
  sortItems(tree);

  return tree;
}

/**
 * Discover available menus (returns list of menu objects with id and name).
 * Requires WP Application Password auth — set WP_AUTH=username:app_password in .env
 */
export async function getMenus(): Promise<Array<{ id: number; name: string; slug: string }>> {
  return fetchJSON(`${WP_API}/menus`, 3, true);
}

// ============================================
// Global settings (ACF options page)
// ============================================

/** Build-time cache for global settings (fetched once, reused across all pages) */
let globalSettingsCache: WpGlobalSettings | null | undefined = undefined;

export async function getGlobalSettings(): Promise<WpGlobalSettings> {
  if (globalSettingsCache !== undefined) {
    if (globalSettingsCache === null) throw new Error('Global settings not available');
    return globalSettingsCache;
  }

  try {
    // Custom REST endpoint registered in WordPress
    const data = await fetchJSON<any>(`${WP_BASE}/options/all`);
    // Normalize the data shape to match what components expect
    globalSettingsCache = {
      logos: {
        dark: data.logos?.dark ? { sourceUrl: data.logos.dark.url, altText: data.logos.dark.alt } : undefined,
        light: data.logos?.light ? { sourceUrl: data.logos.light.url, altText: data.logos.light.alt } : undefined,
        favicon: typeof data.logos?.favicon === 'string'
          ? { sourceUrl: data.logos.favicon }
          : data.logos?.favicon ? { sourceUrl: data.logos.favicon.url } : undefined,
      },
      contact: {
        address: { address: data.contact?.address?.address || '' },
        email: data.contact?.email || '',
        phone: {
          phone: data.contact?.phone?.phone || { title: '', url: '', target: '' },
        },
        socials: (data.contact?.socials || []).map((s: any) => ({
          icon: s.icon ? { sourceUrl: s.icon.url, altText: s.icon.alt } : undefined,
          link: s.link || { title: '', url: '', target: '' },
        })),
      },
      copyright: data.copyright || '',
      footertext: {
        cta: data.FooterText?.cta || data.footertext?.cta || '',
        link: data.FooterText?.link || data.footertext?.link || { title: '', url: '', target: '' },
      },
    } as WpGlobalSettings;
    return globalSettingsCache;
  } catch (e) {
    globalSettingsCache = null;
    throw e;
  }
}

// ============================================
// Reviews (single by ID, cached)
// ============================================

const reviewCache = new Map<number, any>();

export async function getReviewById(id: number): Promise<any | null> {
  if (!id || typeof id !== 'number') return null;
  if (reviewCache.has(id)) return reviewCache.get(id)!;

  try {
    const review = await fetchJSON<any>(`${WP_API}/review/${id}?_embed`);
    reviewCache.set(id, review);
    return review;
  } catch {
    return null;
  }
}

// ============================================
// Projects (single by ID, cached)
// ============================================

const projectCache = new Map<number, any>();

export async function getProjectById(id: number): Promise<any | null> {
  if (!id || typeof id !== 'number') return null;
  if (projectCache.has(id)) return projectCache.get(id)!;

  try {
    const project = await fetchJSON<any>(`${WP_API}/project/${id}?_embed`);
    projectCache.set(id, project);
    return project;
  } catch {
    return null;
  }
}


export async function getProjectInfo(id: number):Promise<any | null> {
    if (!id) return null

    


}

// ============================================
// Media / Image resolution
// ============================================

/** Build-time cache: image ID → media object */
const mediaCache = new Map<number, any>();

/**
 * Resolve a WP media attachment by its ID.
 * Returns an object with { source_url, alt_text, width, height } or null.
 */
export async function getMediaById(id: number): Promise<any | null> {
  if (!id || typeof id !== 'number') return null;
  if (mediaCache.has(id)) return mediaCache.get(id)!;

  try {
    const media = await fetchJSON<any>(
      `${WP_API}/media/${id}?_fields=id,source_url,alt_text,mime_type,media_details`
    );
    const result = {
      source_url: media.source_url,
      alt_text:   media.alt_text || '',
      mime_type:  media.mime_type || '',
      width:      media.media_details?.width,
      height:     media.media_details?.height,
    };
    mediaCache.set(id, result);
    return result;
  } catch {
    return null;
  }
}

/**
 * Resolve an ACF image field that may be an integer ID, an object, or a URL string.
 * Returns { source_url, alt_text, width, height } or null.
 */
export async function resolveImage(image: any): Promise<any | null> {
  if (!image) return null;
  if (typeof image === 'number') return getMediaById(image);
  if (typeof image === 'string') {
    if (image.startsWith('http')) return { source_url: image, alt_text: '' };
    return null;
  }
  // Already an object with source_url
  if (image.source_url || image.sourceUrl) return image;
  return null;
}

// ============================================
// Helpers
// ============================================

/**
 * Extract the URI path from a full WordPress link.
 * e.g., "https://cms.ridgemarketing.com/sample-page/" → "/sample-page/"
 */
export function extractPath(link: string): string {
  try {
    const url = new URL(link);
    return url.pathname;
  } catch {
    return link;
  }
}

/**
 * Get a WP image source URL from various data shapes.
 * Works with objects, strings, or integer IDs (sync — for IDs, use resolveImage instead).
 */
export function getImageUrl(image: any): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (image.source_url) return image.source_url;
  if (image.sourceUrl) return image.sourceUrl;
  if (image.url) return image.url;
  return '';
}


export function convertCMSLink(link: string): string {
  
  if (!link) {
    return ''
  }

  let newLink         = link
  const removalItems  = [
    'https://cms.ridgemarketing.com',
    'http://cms.ridgemarketing.com',
    'https://ridgemarketing.com',
    'http://ridgemarketing.com',
    'http://rm2022stage.wpengine.com',
    'https://rm2022stage.wpengine.com',
  ]

  removalItems.forEach(el => {
    if (newLink.includes(el)){
      newLink = newLink.replace(el, '')
    }
  })

  return newLink
}