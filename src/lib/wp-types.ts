/**
 * TypeScript interfaces for WordPress REST API data
 */

// ============================================
// Core WP types
// ============================================

export interface WpImage {
  id?: number;
  source_url: string;
  alt_text?: string;
  title?: { rendered: string };
  media_details?: {
    width: number;
    height: number;
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
}

export interface WpLink {
  url: string;
  title: string;
  target: string;
}

export interface WpButton {
  style: string;
  link: WpLink;
  colors: {
    resting: string;
  };
  icon?: string;
}

// ============================================
// Layout system
// ============================================

export interface LayoutSettings {
  padding?: {
    top: string;
    bottom: string;
  };
  backgroundColor?: string;
  containerWidth?: string;
  anchorId?: string;
  classes?: string;
  id?: string;
}

export interface LayoutBlock {
  acf_fc_layout: string;
  layoutContent?: Record<string, any>;
  layoutSettings?: LayoutSettings;
  [key: string]: any;
}

// ============================================
// Flexible Media
// ============================================

export interface FlexibleMediaData {
  type: string;
  image?: WpImage;
  videoSource?: string;
  video?: {
    videoUrl: string;
    thumbnailImage?: WpImage;
  };
  lottie?: string;
}

// ============================================
// Page types
// ============================================

export interface WpYoastSeo {
  title: string;
  description: string;
  canonical: string;
  og_title: string;
  og_description: string;
  og_url: string;
  og_type: string;
  og_image?: Array<{ url: string; width: number; height: number }>;
  twitter_title: string;
  twitter_description: string;
  twitter_card: string;
  twitter_image?: string;
  robots: {
    index: string;
    follow: string;
  };
  schema?: {
    '@graph'?: any[];
  };
}

export interface WpPage {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  template: string;
  acf: {
    isFrontPage?: boolean;
    homeHero?: any;
    pageHeader?: any;
    portfolioHeader?: any;
    flexibleLayouts?: {
      layouts: LayoutBlock[];
    };
    headerColor?: string;
    [key: string]: any;
  };
  yoast_head_json: WpYoastSeo;
  _embedded?: any;
}

export interface WpPost {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified: string;
  acf: {
    additionalBlogFields?: {
      previewMode?: boolean;
      squareImage?: number | WpImage;
    };
    [key: string]: any;
  };
  yoast_head_json: WpYoastSeo;
  _embedded?: {
    author?: Array<{
      name: string;
      avatar_urls?: Record<string, string>;
      acf?: {
        avatar?: number | WpImage;
      };
    }>;
    'wp:featuredmedia'?: WpImage[];
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WpService {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  acf: {
    pageHeader?: any;
    flexibleLayouts?: {
      layouts: LayoutBlock[];
    };
    headerColor?: string;
    accentColor?: string;
    secondaryColor?: string;
    [key: string]: any;
  };
  yoast_head_json: WpYoastSeo;
}

export interface WpProject {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  template: string;
  acf: {
    projectHeader?: any;
    flexibleLayouts?: {
      layouts: LayoutBlock[];
    };
    accentColor?: string;
    secondaryColor?: string;
    [key: string]: any;
  };
  yoast_head_json: WpYoastSeo;
}

export interface WpLander {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  acf: {
    pageHeader?: any;
    flexibleLayouts?: {
      layouts: LayoutBlock[];
    };
    landingPages?: {
      showFooter?: boolean;
      linkType?: string;
      url?: string;
    };
    [key: string]: any;
  };
  yoast_head_json: WpYoastSeo;
}

// ============================================
// Menu types
// ============================================

export interface WpMenuItem {
  id: number;
  title: { rendered: string };
  url: string;
  parent: number;
  menu_order: number;
  /** CSS classes set on the item in WP (e.g. "menu-break" starts a new footer-menu column) */
  classes?: string[];
  acf?: {
    icon?: WpImage;
  };
  children?: WpMenuItem[];
}

// ============================================
// Global settings
// ============================================

export interface WpGlobalSettings {
  logos: {
    light?: WpImage;
    dark?: WpImage;
    favicon?: WpImage;
  };
  contact: {
    address: { address: string };
    phone: { phone: WpLink };
    email: WpLink;
    socials: Array<{
      icon: WpImage;
      link: WpLink;
    }>;
  };
  copyright: string;
  footertext: {
    cta: string;
    link: WpLink;
  };
}
