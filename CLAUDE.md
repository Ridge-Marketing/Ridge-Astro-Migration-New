# Ridge Marketing: Gatsby → Astro Migration

Astro rebuild of ridgemarketing.com, ported from the Gatsby site. Content comes
from headless WordPress at `https://cms.ridgemarketing.com` (REST + ACF).
Deployed on Netlify.

- Gatsby source (reference only): `~/Documents/GitHub/Ridge`
  - Layouts: `Ridge/src/layouts/layouts/` (+ `auditLander/`, `ppcLander/` subdirs)
  - API functions: `Ridge/src/api/`
- This repo was re-created 2026-06-11 after `.env` leaked into the old repo's
  history. `Ridge-Astro-Migration-OLD-HISTORY-CONTAINS-SECRETS.git` is archived
  and superseded; never push from it.

## Commands

```bash
npm run dev        # astro dev
npm run devFresh   # astro dev --force (clears Vite dep cache)
npm run sync       # astro sync (regenerate types)
npm run build      # astro build
npm run preview
```

## Environment

Secrets are read at request time via `getSecret()` from `astro:env/server`
(not frozen at build). Required in `.env` locally and in Netlify env:

| Var                | Used for                                              |
| ------------------ | ----------------------------------------------------- |
| `WP_AUTH`          | `username:application_password` → Basic auth to WP   |
| `SENDGRID_API_KEY` | All `sendgrid-*` form endpoints                       |
| `WP_SHEET_URL`     | Google Sheet logging endpoint                         |
| `VERIFY_GATSBY`    | Shared secret for the sheet endpoint                  |

`SENDGRID_API_KEY`, `WP_AUTH` and `VERIFY_GATSBY` were exposed in the old repo
and must be rotated. There is no `.env.example` in this repo yet.

---

## Stack changes

| Concern                    | Gatsby (old)                        | Astro (new)                                                  |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Framework                  | Gatsby v5                           | Astro v5 (`output: 'static'`, API routes `prerender = false`) |
| Data source                | `gatsby-source-wordpress` (GraphQL) | WP REST API + ACF REST (`src/lib/wp-client.ts`)              |
| Images                     | `gatsby-plugin-image`               | `astro:assets <Image>` via `@astrojs/netlify` adapter        |
| Image transforms (islands) | n/a                                 | `src/lib/netlify-image.ts` (manual `/.netlify/images?url=…`) |
| Routing                    | `gatsby-node.js` + templates        | `src/pages/**/[...slug].astro` with `getStaticPaths`         |
| Styling                    | Tailwind                            | Tailwind v4 via `@tailwindcss/vite`                          |
| Interactivity              | React everywhere                    | Astro + React islands (`client:load` / `client:visible`)     |
| Color theming              | ThemeContext (React)                | `<style is:global define:vars={...}>` in `Layout.astro`      |
| Form handling              | Forms.js                            | React islands in `src/components/global/Form*.tsx`           |
| Redirects                  | gatsby-node                         | 217 legacy redirects loaded from `redirects.json` in `astro.config.mjs` |

---

## Repo map

```
src/
  pages/
    index.astro              # front page (WP page_on_front, via getFrontPage)
    [...slug].astro          # WP pages (catch-all, excludes front page)
    blog/index.astro         # post index → BlogIndex.tsx island
    blog/[...slug].astro     # single post
    project/[...slug].astro  # single project (ProjectHeader)
    service/[...slug].astro  # single service (ServiceHeader)
    lander/[...slug].astro   # PPC landers (getLanders, isB2B check)
    404.astro
    api/*.json.ts            # form endpoints → URLs are /api/<name>.json
  components/
    FlexibleLayouts.astro    # ACF flexible content dispatcher
    global/                  # Layout, Head, Header*, Footer, Section, Container,
                             # WpImage, FlexibleMedia, ResultCard, ServiceHeader,
                             # Form*.tsx islands
    layouts/                 # one component per ACF fc_layout
      ppcLander/             # PPC lander (CMO) components — raw snake_case props
    blog/                    # BlogIndex.tsx, PostNav, BlogCardHome, SeoPopup.tsx
  lib/
    wp-client.ts             # all REST fetchers + caches + helpers
    wp-types.ts              # TS interfaces for WP payloads
    layout-map.ts            # ACF fc_layout name → component name
    parser.ts                # shortcode → HTML span replacement
    theme.ts                 # text/text_links/padding/bg class snippets
    netlify-image.ts         # CDN URL builder for React islands
  styles/global.css
```

---

## Data layer (`src/lib/wp-client.ts`)

- **All build-time fetches.** No client-side WP calls.
- **Cached fetchers** (memoized, one fetch per build): `getPages`, `getPosts`,
  `getServices`, `getProjects`, `getLanders`, `getGlobalSettings`. Media
  resolution and `getProjectById` / `getServiceById` are cached in Maps by ID.
  Caching matters — WP rate-limits (429).
- `fetchJSON` / `fetchAllPaginated` retry 429s with exponential backoff
  (5 attempts, 2s→16s — shorter budgets lose to WP Engine's rate-limit window);
  pagination follows `X-WP-TotalPages`. `getMenus`, `getMenuItems` and
  `getOptionsPage` are cached too — the header/footer call them on every page.
- Remote image sizing goes through `src/lib/remote-size.ts` (cached + retried)
  from `WpImage.astro`; never use `<Image inferSize>` directly — one 429 there
  fails the build. Unmeasurable images fall back to a plain `<img>`.
- **Auth**: `WP_AUTH` → Basic auth for endpoints that need it (menu items,
  private posts). `getServiceById` is authenticated and returns `null` on
  failure — a private service post (401) used to kill the `/results` build.
- **Global settings**: custom endpoint `/wp-json/options/all`.
- **Image resolution**: ACF image fields are integer IDs. Always pass through
  `resolveImage(field)` → `{ source_url, alt_text, width, height } | null`.
  Pre-resolve arrays with `Promise.all()` in frontmatter.
- **Path helpers**: `extractPath(link)` strips the WP origin;
  `convertCMSLink(url)` strips CMS hostnames to relative paths.
- **Key transform**: `transformKeys(obj)` walks objects snake_case → camelCase.
  `snakeToCamel` collapses `__` → `_` first (keys like `component__button`).
  `FlexibleLayouts.astro` runs this on each block's content/settings, so layout
  components see `layoutContent.imagePosition`, not `image_position`.

### WP REST data shape / gotchas

- ACF image fields → integer media IDs (resolve via `/wp/v2/media/{id}`).
- ACF relationship fields (e.g. `services.service`) → integer post IDs. Resolve
  via `getServiceById(id)` / `getProjectById(id)` or a map from `getServices()`.
- Layouts live at `page.acf.layouts`. Block shape:
  `{ acf_fc_layout, layout__<name>: { layout__content, layout__settings } }`.
  `extractLayoutData` in `FlexibleLayouts.astro` also normalizes dashed names
  like `two-col_image__text`.
- Headers are flat, not wrapped: `acf.page_header`, `acf.project_header`,
  `acf.portfolio_header`, `acf.page_header_responsive`, `acf.layout__home_hero`.
  Routes wrap them manually:
  `{ layoutContent: acf.page_header.layout__content, layoutSettings: acf.page_header.layout__settings }`.
- **Front page hero**: the "Home Hero 2026" group sits at the top level of the
  front page's acf as `layout__content` / `layout__settings` (→
  `HomeHero2026.astro`). `acf.layout__home_hero` is the old cycling hero, used
  only as a fallback. The front page is whichever page links to `/`
  (currently "Home Page - 2026", id 9630).
- **Page Header Alt**: pages using the `page-alt.php` WP template (e.g.
  barn-of-brands) render `PageHeaderResponsive` instead of `PageHeader`.
- Project carousel image: `project.acf.images.carousel_feature` (media ID).
- Yoast SEO is under `yoast_head_json` on every record.
- ACF `true_false` fields are a literal `false`, not absent — guard accordingly.
- WP returns 403 without a User-Agent (e.g. bare `urllib`) — send `User-Agent: curl/8`.

---

## Routing model

Catch-all routes call `getStaticPaths` at build with slug-only params:

```ts
export async function getStaticPaths() {
  const all = await getProjects();
  return all.map((project, i) => {
    const slug = extractPath(project.link)
      .replace(/^\/project\//, '').replace(/^\/|\/$/g, '');
    return {
      params: { slug: slug || undefined },
      props: {
        project,
        prevSlug: extractPath(all[(i - 1 + all.length) % all.length].link),
        nextSlug: extractPath(all[(i + 1) % all.length].link),
      },
    };
  });
}
```

---

## Layout system

1. ACF flexible content arrives at `acf.layouts`.
2. Route hands it to `<FlexibleLayouts layouts={…} />`.
3. `FlexibleLayouts.astro` looks up each block's `acf_fc_layout` in
   `layout-map.ts`, then dispatches to a **statically imported** component
   (Astro can't dynamic-import `.astro` by string).
4. Each layout component takes `{ layoutData: { layoutContent, layoutSettings } }`.

### Adding a new layout — checklist

1. Find the Gatsby source: `Ridge/src/layouts/layouts/<Name>.js`.
2. Check the real data shape from WP:
   ```bash
   curl -sH "User-Agent: curl/8" \
     "https://cms.ridgemarketing.com/wp-json/wp/v2/<type>?per_page=100" \
     | python3 -c '...scan for acf_fc_layout==<name>...'
   ```
3. Create `src/components/layouts/<Name>.astro`:
   ```astro
   ---
   import Section from '@/components/global/Section.astro';
   import Container from '@/components/global/Container.astro';
   import { theme } from '@/lib/theme';
   import { parser } from '@/lib/parser';
   import { resolveImage } from '@/lib/wp-client';

   interface Props { layoutData: { layoutContent: any; layoutSettings: any; }; }
   const { layoutData } = Astro.props;
   const content  = layoutData.layoutContent  || {};
   const settings = layoutData.layoutSettings || {};
   // resolve any media IDs in parallel here
   ---
   <Section settings={settings}>
     <Container container={settings.containerWidth}>
       …
     </Container>
   </Section>
   ```
4. Register: import + add to the `layoutComponents` map in `FlexibleLayouts.astro`.
5. Verify the mapping in `layout-map.ts` (both snake_case fc_layout key and
   PascalCase legacy key).

### Conventions

- `Section` for the top-level wrap (padding, bg color, anchor IDs).
- `Container` for width (`default | slim | mini | none`).
- `parser(html)` on any text that may contain `[accent]`, `[b]`, `[h2]`, etc.
- `<WpImage src={...} alt={...} />` for resolved WP media in `.astro` files —
  defaults `quality=80`, widths `[400,800,1200,1600,3000]`,
  `sizes='(max-width: 640px) 100vw, (max-width: 1024px) 80vw, (max-width: 1600px) 1200px, 3000px'`.
- Dynamic positioning/measuring (overhang masks, portfolio bg) → tiny inline
  `<script>` blocks, not React islands.
- `ppcLander/` components take **raw snake_case** ACF props (no
  `transformKeys`), except when reusing `layoutData`-style components, which get
  `transformKeys` applied by the wrapper.
- Vertically align `=` in groups of 2+ consecutive declarations.

---

## React islands

Use when a feature needs client state (filters, modals, carousels, forms).

- `XyzWrapper.astro` resolves all WP data at build time (image IDs → URLs), then
  renders `<Xyz client:load … />` with plain serializable props.
- `Xyz.tsx` receives URLs, not WP image objects.
- Images inside islands: `netlifyImg(url, { widths, quality })` from
  `src/lib/netlify-image.ts` for plain `<img>` tags. Astro's `<Image>` doesn't
  work in `.tsx`.
- Never import `.astro` components into `.tsx` — they're server-only.

---

## Color theming

Per-record accent/secondary colors flow as `Layout` props:

```astro
<Layout accentColor={acf.accent_color} secondaryColor={acf.secondary_accent}>
```

`Layout.astro` emits:

```astro
<style is:global define:vars={{ accentColor, secondaryColor }}>
  .accent-text   { color: var(--accentColor)   !important; }
  .secondary-text{ color: var(--secondaryColor) !important; }
</style>
```

`is:global` is **required** — otherwise Astro scopes the rules with
`[data-astro-cid-…]` and they don't reach child components. Same rule for any
selector targeting children: use `is:global` or `:global(.cls)`. This is the #1
cause of "my styles don't apply".

---

## Tailwind v4 gotchas

- `@source inline()` must be a **single line** — multi-line strings throw
  "Unterminated string":
  ```css
  @source inline("bg-rm-green bg-rm-pale-grey text-rm-green text-rm-white");
  ```
- `@custom-variant` names can't start with `-`. Use `max-lg`, not `-lg`.
- `@utility` blocks may cause parse errors — use plain CSS classes instead.
- Arbitrary values like `1280px`, `[18px]` trip the `suggestCanonicalClasses`
  lint. Cosmetic.

---

## Forms & API routes

All in `src/pages/api/`, `prerender = false`, named `*.json.ts`:
`sendgrid-basic-contact`, `sendgrid-careers`, `sendgrid-cta-contact`,
`sendgrid-seo-popup`, `sendgrid-landers`, `sendgrid-ppc-hero`, `google-sheet`.

- **Google Sheet logging**: every form (incl. SeoPopup) POSTs `{message}` to
  `/api/google-sheet.json` before its SendGrid call (non-blocking, Gatsby
  parity). Each payload carries a `source` label: `'Contact Page Form'`,
  `'CTA Form'`, `'Careers Form'`, `'2026 PPC Lander Form'`, `'SEO Popup'`.
  Careers adds `type: 'careers'` (separate sheet tab, routed WP-side by
  `ridge_get_data_to_add_to_sheet`) and strips `resume`. SeoPopup adds a joined
  `name` (and logs to the sheet, unlike Gatsby).
- SendGrid rejects an empty `cc: []` — omit the field instead.
- Don't add an `/api/* → /.netlify/functions/:splat` redirect to
  `netlify.toml`; a stale one previously hijacked every form POST.

---

## PPC landers

`src/pages/lander/[...slug].astro` → `PPCLanderWrapperCMO.astro` for B2B/CMO
landers. Preview landers are excluded from the build entirely.

- Components: `PPCHeroCMO` (mobile) + `PPCHeroCMODesktop` with
  `PpcHeroQuickForm` / `PpcHeroEmailCapture` islands, `PPCTwoColContentCMO`,
  `PPCQuotesCMO` (review IDs via `getReviewById`), `PPCApproach` +
  `PpcApproachDiagram` island (hardcoded copy, same as Gatsby), `PPCAudit`,
  `PPCCaseStudies` + slider island. The wrapper also reuses
  `PpcProjectSliderWrapper` / `AuditStats` / `PpcForm` via `transformKeys`.
- Hero email prefills the main form via sessionStorage `ppcPersistEmail` + a
  `ppc-prefill` CustomEvent (`FormLander2026.tsx` listens).
- `hero_cmo` fields: `heading_desktop`, `sub_heading_desktop`,
  `background_image_mobile/tablet/desktop`, `carousel`, `video_fallback`.
  Mobile hero = 3 responsive bg images + logo CSS marquee; desktop renders
  heading + `video_fallback` as a second source. `--shadow-cmocard` lives in
  `global.css`.

---

## Blog

- `blog/index.astro` → `BlogIndex.tsx` (`client:load`); `PostCards.astro` layout
  for post cards; `PostNav.astro` prev/next; `SeoPopup.tsx` 3-step modal.
- Blog hero image: `https://cms.ridgemarketing.com/wp-content/uploads/2022/07/blog-hero.png`.
- **Preview mode** (`acf.additional_blog_fields.preview_mode`): preview posts
  ARE built (shareable URL) but get `noindex` and no Yoast head (`noindex` prop
  on `Layout.astro`), are filtered from the blog grid / PostCards, are skipped
  by prev/next nav, and are excluded from the sitemap.
- **Sitemap**: `astro.config.mjs` fetches preview slugs at config load; the
  filter also excludes `/lander/`, `/thank-you`, `/wrapped_2024` (Gatsby parity).

---

## Status

Build: 97 pages, zero unrecognized layouts (as of 2026-10-26).

**Routes ported:** `/`, `/[...slug]`, `/blog`, `/blog/[slug]`,
`/service/[slug]`, `/project/[slug]`, `/lander/[slug]`, `/404`.

**Layouts ported (~65):** PageHeader, PortfolioHeader, ProjectHeader, HomeHero,
TextBlock, TwoColImageText, TwoColBreakoutImageText, TwoColBreakoutImageHeading,
TwoColTextQuote, TwoColTextQuoteCard, TwoColIconText, TwoColImageList,
TwoColTextForm, TwoColContentPpc, FullWidthImage, FullWidthImageText,
FullWidthImageVideoText, FullWidthImageGallery (CSS marquee), IconTextBoxes,
ExpandableIconBoxes, BulletsWithImage, LogoCloud, Quotes, Results, ResultsMixed,
ResultsTextBlock, ResultsImage, PostCards, ProjectBlocks, FlexibleProjectBlocks,
ProjectPortfolio, QuarterImageText, VerticalSlider, CtaForm, CareersForm,
PpcForm (+ FormLander2026.tsx), PpcProjectSlider (island + wrapper),
AuditStats, AuditCard, StepsWithImages, StepsWithCard, LineBreak, BrandingCards,
ButtonRow, ContactFourSquare, FrequentlyAskedQuestions, TeamGrid,
FeaturedProjectsCarousel, FeaturedProjectsGridDev, MediaBlocks, VideoPlayer,
TextVideoOverhang, ImagesTopAlignedText, PullquoteImage, ImageCarousel,
CtaFooterPpc, plus (Oct 2026, from Gatsby's Jul–Aug work) TwoColTextText,
TwoColTextList, FullWidthVideoText, CaseStudies, FeaturedCampaigns,
BarnOfBrands, LogoCarousel, HomeHero2026, PageHeaderResponsive. Quotes has
the `alternate_style` variant.

**Skipped** (mapped in `layout-map.ts` but zero WP usage — would render "not
yet implemented"): TwoColList, VennDiagram, FeaturedProjectsGrid (legacy of
GridDev), WebDesignApproach (empty in Gatsby too), QuotesPpc.

### Open items / known gaps

- **Cookie consent**: Gatsby (Jul 2026) loads GTM only after consent
  (`ConsentLoader` / `src/static/consent.js`), adds a Do-Not-Sell link in the
  footer, and dropped Mouseflow. Astro's `Layout.astro` still loads GTM
  unconditionally — must be ported before launch.
- `/visibility-audit` (AI Audit lander) and `/wrapped_2024` render blank. The
  "AI Audit" ACF group (`group_6984afb3574b1`) has `show_in_rest` off, so its
  data isn't in REST yet.
- Non-CMO landers (audit, full-service-digital-marketing ×2,
  your-marketing-dream-team) build but render empty — their wrappers aren't
  ported yet.
- `TwoColTextForm.astro` reuses `FormCTALayout.tsx`. If lander-specific
  `redirectForm` behavior is needed, port Gatsby's `FormLanders`.
- `ImageCarousel` was Splide; now native scroll-snap + prev/next buttons (no
  infinite loop).
- `FlexibleMedia` Vimeo builds an iframe on first click (no
  `@u-wave/react-vimeo`).
- `globalSettings.logos.favicon` uses `source_url`, but several routes also
  check `.sourceUrl` as a fallback, which TS flags. Cosmetic.
- If you see "Failed to resolve import 'lottie-web'", run `npm install`
  (used by `VerticalSlider.astro` and `FlexibleMedia.astro`).

---

## Keeping this file useful

- When porting a layout, record new conventions or gotchas in the right section
  here, not in a commit message.
- When the WP data shape shifts (new ACF field, new fc_layout), update "WP REST
  data shape" or "Layout system".
- When ripping out a dep (Splide, framer-motion, react-vimeo…), record the
  replacement under "Open items".
