/**
 * Layout name → component name mapping
 * Maps ACF flexible content layout names to component file names.
 *
 * In the GraphQL/Gatsby system, fieldGroupName was like
 * "WpPage_Flexiblelayouts_Layouts_TwoColImageText" and the substring after
 * the last underscore was used as the key. In the REST API, the ACF flexible
 * content uses acf_fc_layout which is the snake_case field name.
 *
 * This map translates both formats to the component name used in FlexibleLayouts.astro.
 */

export const layoutNameMap: Record<string, string> = {
  // REST API acf_fc_layout names (snake_case) → component names
  two_col_image_text: 'TwoColImageText',
  text_block: 'TextBlock',
  full_width_image: 'FullWidthImage',
  full_width_image_text: 'FullWidthImageText',
  full_width_image_video_text: 'FullWidthImageVideoText',
  home_hero: 'HomeHero',
  icon_text_boxes: 'IconTextBoxes',
  logo_cloud: 'LogoCloud',
  quotes: 'Quotes',
  results: 'Results',
  results_image: 'ResultsImage',
  results_mix: 'ResultsMixed',
  results_text_block: 'ResultsTextBlock',
  post_cards: 'PostCards',
  project_blocks: 'ProjectBlocks',
  flexible_project_blocks: 'FlexibleProjectBlocks',
  two_col_breakout_image_text: 'TwoColBreakoutImageText',
  two_col_breakout_image_heading: 'TwoColBreakoutImageHeading',
  two_col_image_text_v2: 'TwoColImageText',
  two_col_text_quote: 'TwoColTextQuote',
  two_col_list: 'TwoColList',
  two_col_icon_text: 'TwoColIconText',
  two_col_image_list: 'TwoColImageList',
  two_col_text_form: 'TwoColTextForm',
  venn_diagram: 'VennDiagram',
  vertical_slider: 'VerticalSlider',
  quarter_image_text: 'QuarterImageText',
  cta_form: 'CtaForm',
  careers_form: 'CareersForm',
  line_break: 'LineBreak',
  project_portfolio: 'ProjectPortfolio',
  video_player: 'VideoPlayer',
  images_top_aligned_text: 'ImagesTopAlignedText',
  media_blocks: 'MediaBlocks',
  team_grid: 'TeamGrid',
  text_video_overhang: 'TextVideoOverhang',
  featured_projects_carousel: 'FeaturedProjectsCarousel',
  featured_projects_grid: 'FeaturedProjectsGrid',
  featured_projects_grid_dev: 'FeaturedProjectsGridDev',
  button_row: 'ButtonRow',
  branding_cards: 'BrandingCards',
  cta_footer_ppc: 'CtaFooterPpc',
  image_carousel: 'ImageCarousel',
  pullquote_image: 'PullquoteImage',
  contact_four_square: 'ContactFourSquare',
  frequently_asked_questions: 'FrequentlyAskedQuestions',
  web_design_approach: 'WebDesignApproach',
  audit_card: 'AuditCard',
  audit_stats: 'AuditStats',
  two_column_content_ppc: 'TwoColContentPpc',
  two_col_text_quote_card: 'TwoColTextQuoteCard',
  steps_with_images: 'StepsWithImages',
  steps_with_card: 'StepsWithCard',
  ppc_project_slider: 'PpcProjectSlider',
  ppc_form: 'PpcForm',
  full_width_image_gallery: 'FullWidthImageGallery',
  expandable_icon_boxes: 'ExpandableIconBoxes',
  bullets_with_image: 'BulletsWithImage',

  // PascalCase names (from GraphQL fieldGroupName parsing) — same keys as layoutIndex.js
  TwoColImageText: 'TwoColImageText',
  TextBlock: 'TextBlock',
  FullWidthImage: 'FullWidthImage',
  FullWidthImageText: 'FullWidthImageText',
  FullWidthImageVideoText: 'FullWidthImageVideoText',
  HomeHero: 'HomeHero',
  IconTextBoxes: 'IconTextBoxes',
  LogoCloud: 'LogoCloud',
  Quotes: 'Quotes',
  Results: 'Results',
  ResultsImage: 'ResultsImage',
  ResultsMix: 'ResultsMixed',
  ResultsTextBlock: 'ResultsTextBlock',
  PostCards: 'PostCards',
  ProjectBlocks: 'ProjectBlocks',
  FlexibleProjectBlocks: 'FlexibleProjectBlocks',
  TwoColBreakoutImageText: 'TwoColBreakoutImageText',
  TwoColBreakoutImageHeading: 'TwoColBreakoutImageHeading',
  TwoColTextQuote: 'TwoColTextQuote',
  TwoColList: 'TwoColList',
  TwoColIconText: 'TwoColIconText',
  TwoColImageList: 'TwoColImageList',
  TwoColTextForm: 'TwoColTextForm',
  VennDiagram: 'VennDiagram',
  VerticalSlider: 'VerticalSlider',
  QuarterImageText: 'QuarterImageText',
  CtaForm: 'CtaForm',
  CareersForm: 'CareersForm',
  LineBreak: 'LineBreak',
  ProjectPortfolio: 'ProjectPortfolio',
  VideoPlayer: 'VideoPlayer',
  ImagesTopAlignedText: 'ImagesTopAlignedText',
  MediaBlocks: 'MediaBlocks',
  TeamGrid: 'TeamGrid',
  TextVideoOverhang: 'TextVideoOverhang',
  FeaturedProjectsCarousel: 'FeaturedProjectsCarousel',
  FeaturedProjectsGrid: 'FeaturedProjectsGrid',
  FeaturedProjectsGridDev: 'FeaturedProjectsGridDev',
  ButtonRow: 'ButtonRow',
  BrandingCards: 'BrandingCards',
  CtaFooterPpc: 'CtaFooterPpc',
  ImageCarousel: 'ImageCarousel',
  PullquoteImage: 'PullquoteImage',
  ContactFourSquare: 'ContactFourSquare',
  FrequentlyAskedQuestions: 'FrequentlyAskedQuestions',
  WebDesignApproach: 'WebDesignApproach',
  AuditCard: 'AuditCard',
  AuditStats: 'AuditStats',
  TwoColumnContentPpc: 'TwoColContentPpc',
  TwoColTextQuoteCard: 'TwoColTextQuoteCard',
  StepsWithImages: 'StepsWithImages',
  StepsWithCard: 'StepsWithCard',
  PpcProjectSlider: 'PpcProjectSlider',
  PpcForm: 'PpcForm',
  FullWidthImageGallery: 'FullWidthImageGallery',
  ExpandableIconBoxes: 'ExpandableIconBoxes',
  BulletsWithImage: 'BulletsWithImage',
};

/**
 * Resolve a layout name from ACF data to a component name.
 */
export function resolveLayoutName(acfFcLayout: string): string | null {
  // Direct lookup first
  if (layoutNameMap[acfFcLayout]) return layoutNameMap[acfFcLayout];
  // Normalize: replace dashes with underscores, collapse double underscores
  const normalized = acfFcLayout.replace(/-/g, '_').replace(/_{2,}/g, '_');
  return layoutNameMap[normalized] || null;
}
