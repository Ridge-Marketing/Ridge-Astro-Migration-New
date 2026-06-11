/**
 * FeaturedProjectsGridDev — React island
 * Replaces Gatsby's FeaturedProjectsGridDev.js
 *
 * Four filterable tabs: Websites | Branding | Video | Interactive
 * URL param: ?type=websites|branding|video|interactive
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { netlifyImg } from '@/lib/netlify-image';
import { convertCMSLink } from '@/lib/wp-client';
import { theme } from '@/lib/theme';
import Parser from '@/lib/parser';
import Player from '@vimeo/player';

// ─── Image presets (Netlify Image CDN widths + sizes per role) ───────────────

const LARGE_WIDTHS    = [400, 800, 1200, 1600];
const LARGE_SIZES     = '(max-width: 1279px) 100vw, 870px';

const SMALL_WIDTHS    = [400, 700];
const SMALL_SIZES     = '(max-width: 1279px) 100vw, 350px';

const VIDEO_WIDTHS    = [400, 800, 1200];
const VIDEO_SIZES     = '(max-width: 767px) 100vw, 640px';

const LIGHTBOX_WIDTHS = [800, 1200, 1600];
const LIGHTBOX_SIZES  = '(max-width: 767px) 95vw, 60vw';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkData { url: string; title: string; target?: string; }

interface ImageSlot {
  imageUrl: string;
  mobileImageUrl: string;
  title: string;
  link: LinkData | null;
  sidePin: string;
  lightboxImages: string[]; // resolved URLs
}

interface ProjectBlock {
  largeImage: ImageSlot;
  smallImageTop: ImageSlot;
  smallImageBottom: ImageSlot;
}

interface VideoItem {
  title: string;
  subtitle: string;
  videoUrl: string;
  websiteLink: string;
  imageUrl: string;
}

interface MediaCategory { title: string; videos: VideoItem[]; }

interface FilterHeading {
  heading?: { black?: string; green?: string };
  body?: string;
}

interface PortfolioHeaderContent {
  websites?:    FilterHeading;
  branding?:    FilterHeading;
  video?:       FilterHeading;
  interactive?: FilterHeading;
  [key: string]: any;
}

interface LayoutSettings {
  id?: string;
  anchorId?: string;
  classes?: string;
  padding?: { top?: string; bottom?: string };
  backgroundColor?: string;
  containerWidth?: string;
}

interface PortfolioHeader {
  layoutContent: PortfolioHeaderContent;
  layoutSettings: LayoutSettings;
}

interface Props {
  websiteBlocks: ProjectBlock[];
  brandingBlocks: ProjectBlock[];
  videoCategories: MediaCategory[];
  interactiveCategories: MediaCategory[];
  header: any
}

type Filter = 'Websites' | 'Branding' | 'Video' | 'Interactive';

// ─── Theme snippets ───────────────────────────────────────────────────────────

const btnBase         = 'inline-block font-stratos uppercase py-3 px-10 font-normal border-2 border-solid transition-all ease-in-out text-[18px]';
const solidGreenDark  = 'text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black';
const solidBlackDark  = 'text-rm-white border-rm-black bg-rm-black hover:bg-rm-green hover:text-rm-black hover:border-rm-green';
const textLinkBase    = 'flex items-center font-stratos uppercase text-[18px] text-rm-green font-stratos-lights after:transition-all after:ease-out after:inline-block after:bg-contain after:bg-center after:bg-no-repeat after:w-[20px] after:h-[20px] after:ml-2 after:bg-[url("/images/arrow-right-green.svg")] hover:underline hover:after:bg-[url("/images/arrow-right-green.svg")]';

const imgBorder       = 'border-solid border-black border-[9px]';

// ─── Portfolio Nav ────────────────────────────────────────────────────────────

function PortfolioNav({ active, onFilter }: { active: Filter; onFilter: (f: Filter) => void }) {
  const base              = 'cursor-pointer font-basic-sans text-18px md:text-26px leading-36px text-white mx-3 md:mx-8 font-light transition-all';
  const activeClass       = 'font-semibold border-b-2 border-rm-green';
  const filters: Filter[] = ['Websites', 'Branding', 'Video', 'Interactive'];
  return (
    <div className="h-min pt-5 xl:pt-0 xl:h-[92px] bg-black flex justify-center">
      <div className="flex items-center">
        {filters.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={active === f}
            onClick={() => onFilter(f)}
            className={`${base} ${active === f ? activeClass : ''}`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Hover overlay (desktop) + mobile title bar ───────────────────────────────

function TitleOverlay({ title, subtitle, link, type }: { title: string; subtitle: string | null; link: LinkData | null, type: string | null; }) {
  const classes = type === 'website' || type === 'branding' ? `w-[calc(100%-18px)] h-[calc(100%-18px)] top-[9px] left-[9px]` : `top-0 left-0 w-full h-full`;
  
  return (
    <>
      {/* Desktop hover overlay */}
      <div className={`hidden lg:flex flex-col justify-center items-center absolute opacity-0 hover:opacity-100 bg-white/80 backdrop-blur-sm ${classes} transition-opacity duration-500 z-10`}>
        {subtitle &&
          <p>{subtitle}</p>
        }
        <h2 className={`text-rm-black font-stratos uppercase text-[1.75rem] leading-6 font-bold text-center ${link?.url ? 'mb-[45px]' : ''}`}>
          {title}
        </h2>
        {link?.url && (
          <a href={convertCMSLink(link.url)} target={link.target || '_self'} className={`${btnBase} ${solidGreenDark}`}>
            {link.title || 'View Project'}
          </a>
        )}
        {type === 'branding' && (
          <p className={`${btnBase} ${solidGreenDark} mt-[45px]`}>
            View Project
          </p>
        )}
        {type === 'video' && 
          <div className={"w-[65px] lg:w-[95px] text-center mx-auto xl:pt-7"}>
            <img 
              className="hidden xl:block" 
              src={'https://cms.ridgemarketing.com/wp-content/uploads/2023/06/circle-play-solid-1.svg'} 
              alt={`play button`} />
          </div>
        }
      </div>
      {/* Mobile text bar */}
      <div className="block lg:hidden bg-black p-6">
        <h2 className="text-white font-stratos uppercase text-[1.75rem] leading-6 font-bold mb-2 text-left">{title}</h2>
        {link?.url && (
          <a href={convertCMSLink(link.url)} target={link.target || '_self'} className={textLinkBase}>
            {link.title || 'View Project'}
          </a>
        )}
      </div>
    </>
  );
}

// ─── Image Lightbox (Branding) ────────────────────────────────────────────────

function BrandingLightbox({
  images, title, size, thumb, onOpen,
}: { images: string[]; title: string; size: 'large' | 'small'; thumb: string; onOpen: () => void }) {
  const heightClass = size === 'large'
    ? 'w-full h-[100vw] xl:h-[700px]'
    : 'w-full h-[100vw] xl:h-[350px]';
  if (!thumb) {
      return
  }
  return (
    <button type="button" className="block w-full text-left" onClick={onOpen} aria-label={`Open ${title} gallery`}>
      {thumb && (() => {
        const img = netlifyImg(thumb, { widths: size === 'large' ? LARGE_WIDTHS : SMALL_WIDTHS });
        return (
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes={size === 'large' ? LARGE_SIZES : SMALL_SIZES}
            alt={title}
            className={`${heightClass} object-cover object-top ${imgBorder}`}
            loading="lazy"
          />
        );
      })()}
      {title && 
        <TitleOverlay title={title} link={null} subtitle={null} type={'branding'} />
      }
    </button>
  );
}

function ImageGalleryModal({ images, title, onClose }: { images: string[]; title: string; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-[95%] md:w-3/4 lg:w-[60%] max-h-[90vh] flex flex-col">
        <button
          type="button"
          className="absolute -top-12 right-0 text-white p-2 z-20"
          aria-label="Close gallery"
          onClick={onClose}
        >
          <svg width="26" height="24" viewBox="0 0 26 24" fill="none">
            <path d="M2 2L23.1852 22" stroke="#F1F5F5" strokeWidth="3" strokeLinecap="round" />
            <path d="M24 2L2.81482 22" stroke="#F1F5F5" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
        {images[idx] && (() => {
          const img = netlifyImg(images[idx], { widths: LIGHTBOX_WIDTHS });
          return (
            <img
              src={img.src}
              srcSet={img.srcSet}
              sizes={LIGHTBOX_SIZES}
              alt={`${title} ${idx + 1}`}
              className="w-full max-h-[80vh] object-contain"
            />
          );
        })()}
        {images.length > 1 && (
          <div className="flex justify-center gap-4 mt-4">
            <button type="button" onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="text-white bg-black/50 px-4 py-2" aria-label="Previous image">←</button>
            <span className="text-white font-basic-sans">{idx + 1} / {images.length}</span>
            <button type="button" onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="text-white bg-black/50 px-4 py-2" aria-label="Next image">→</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Video Lightbox ───────────────────────────────────────────────────────────

function VideoModal({ videoUrl, title, onClose }: { videoUrl: string; title: string; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const player = new Player(containerRef.current, {
      url         : videoUrl,
      autoplay    : true,
      muted       : false,
      responsive  : true,
      title       : false,
    });
    player.play()
    return () => { player.destroy().catch(() => {}); };
  }, [videoUrl]);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <div className="w-[95%] md:w-3/4 relative">
          <button
            type="button"
            className="absolute -top-12 right-0 text-white p-2 z-20"
            aria-label="Close video"
            onClick={onClose}
          >
            <svg width="26" height="24" viewBox="0 0 26 24" fill="none">
              <path d="M2 2L23.1852 22" stroke="#F1F5F5" strokeWidth="3" strokeLinecap="round" />
              <path d="M24 2L2.81482 22" stroke="#F1F5F5" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
          <div className="aspect-video w-full relative">
            <div ref={containerRef} className="absolute top-0 left-0 w-full h-ful bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Website Block ────────────────────────────────────────────────────────────

function WebsiteBlockItem({ block, index }: { block: ProjectBlock; index: number }) {
  const rowReverse = index % 2 !== 0;
  const { largeImage, smallImageTop, smallImageBottom } = block;
  const displayImg = (slot: ImageSlot) => slot.mobileImageUrl || slot.imageUrl;

  return (
    <article
      className={`flex flex-col xl:flex-row ${rowReverse ? 'xl:flex-row-reverse' : ''} w-full xl:h-[700px] overflow-hidden xl:px-12 max-w-[1280px] ml-auto mr-auto`}
    >
      {/* Large image column */}
      <div className="relative flex flex-col w-full min-h-[100vw] xl:min-h-[700px] xl:w-[calc(100%-350px)] xl:h-[700px]">
        <div className='bg-radial from-white to-gray-500 animate-pulse top-0 left-0 w-full h-full z-0 absolute' />
        {(() => {
          const optimized = netlifyImg(displayImg(largeImage), { widths: LARGE_WIDTHS });
          const imgEl = (
            <img
              src={optimized.src}
              srcSet={optimized.srcSet}
              sizes={LARGE_SIZES}
              alt={largeImage.title || ''}
              className={`relative z-10 w-full h-[100vw] xl:h-[700px] object-cover ${imgBorder}`}
              style={{ objectPosition: largeImage.sidePin }}
              loading="lazy"
            />
          );
          return largeImage.link?.url ? (
            <a href={convertCMSLink(largeImage.link.url)} target={largeImage.link.target || '_self'} className="relative z-10 block">
              {imgEl}
            </a>
          ) : imgEl;
        })()}
        {(largeImage.title || largeImage.link?.url) && (
          <TitleOverlay title={largeImage.title} link={largeImage.link} subtitle={null} type={'website'} />
        )}
      </div>

      {/* Small images column */}
      <div className="relative flex flex-col w-full xl:w-[350px] xl:h-[700px]">
        {smallImageTop.imageUrl && (() => {
          const optimized = netlifyImg(displayImg(smallImageTop), { widths: SMALL_WIDTHS });
          return (
            <div className="relative min-h-[100vw] xl:min-h-[350px]">
              <div className='bg-radial from-white to-gray-500 animate-pulse top-0 left-0 w-full h-full z-0 absolute' />
              <img
                src={optimized.src}
                srcSet={optimized.srcSet}
                sizes={SMALL_SIZES}
                alt={smallImageTop.title || ''}
                className={`relative z-10 w-full h-[100vw] xl:h-[350px] object-cover ${imgBorder}`}
                loading="lazy"
              />
              {(smallImageTop.title || smallImageTop.link?.url) && (
                <TitleOverlay title={smallImageTop.title} link={smallImageTop.link} subtitle={null} type={`website`}/>
              )}
            </div>
          );
        })()}
        {smallImageBottom.imageUrl && (() => {
          const optimized = netlifyImg(displayImg(smallImageBottom), { widths: SMALL_WIDTHS });
          return (
            <div className="relative min-h-[100vw] xl:min-h-[350px]">
              <div className='bg-radial from-white to-gray-500 animate-pulse top-0 left-0 w-full h-full z-0 absolute' />
              <img
                src={optimized.src}
                srcSet={optimized.srcSet}
                sizes={SMALL_SIZES}
                alt={smallImageBottom.title || ''}
                className={`relative z-10 w-full h-[100vw] xl:h-[350px] object-cover ${imgBorder}`}
                loading="lazy"
              />
              {(smallImageBottom.title || smallImageBottom.link?.url) && (
                <TitleOverlay title={smallImageBottom.title} link={smallImageBottom.link} subtitle={null} type={`website`} />
              )}
            </div>
          );
        })()}
      </div>
    </article>
  );
}

// ─── Branding Block ───────────────────────────────────────────────────────────

function BrandingBlockItem({ block, index }: { block: ProjectBlock; index: number }) {
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const rowReverse = index % 2 !== 0;
  const { largeImage, smallImageTop, smallImageBottom } = block;
  const contactLink = { url: '/contact/', title: "Let's Talk" };

  const openLightbox = (images: string[], title: string) => {
    setLightboxImages(images);
    setLightboxTitle(title);
  };

  return (
    <>
      <div
        className={`flex flex-col xl:flex-row ${rowReverse ? 'xl:flex-row-reverse' : ''} w-full xl:h-[700px] overflow-hidden xl:px-12 max-w-[1280px] ml-auto mr-auto`}
      >
        {/* Large image */}
        <div className="relative flex flex-col w-full min-h-[100vw] xl:min-h-[700px] xl:w-[calc(100%-350px)] xl:h-[700px]">
          <div className='bg-radial from-white to-gray-500 animate-pulse top-0 left-0 w-full h-full z-0 absolute' />
          {largeImage.lightboxImages.length > 0 ? (
            <div className="relative z-10">
              <BrandingLightbox
                thumb={largeImage.imageUrl}
                images={largeImage.lightboxImages}
                title={largeImage.title}
                size="large"
                onOpen={() => openLightbox(largeImage.lightboxImages, largeImage.title)}
              />
            </div>
          ) : largeImage.imageUrl ? (() => {
            const optimized = netlifyImg(largeImage.imageUrl, { widths: LARGE_WIDTHS });
            return (
              <img
                src={optimized.src}
                srcSet={optimized.srcSet}
                sizes={LARGE_SIZES}
                alt={largeImage.title || ''}
                className={`relative z-10 w-full h-[100vw] xl:h-[700px] object-cover object-top ${imgBorder}`}
                loading="lazy"
              />
            );
          })() : null}
        </div>

        {/* Small images */}
        <div className="relative flex flex-col w-full xl:w-[350px] xl:h-[700px]">
          {smallImageTop.imageUrl && (
            <div className="relative min-h-[100vw] xl:min-h-[350px]">
              <div className='bg-radial from-white to-gray-500 animate-pulse top-0 left-0 w-full h-full z-0 absolute' />
              {smallImageTop.lightboxImages.length > 0 ? (
                <div className="relative z-10">
                  <BrandingLightbox
                    thumb={smallImageTop.imageUrl}
                    images={smallImageTop.lightboxImages}
                    title={smallImageTop.title}
                    size="small"
                    onOpen={() => openLightbox(smallImageTop.lightboxImages, smallImageTop.title)}
                  />
                </div>
              ) : (() => {
                const optimized = netlifyImg(smallImageTop.mobileImageUrl || smallImageTop.imageUrl, { widths: SMALL_WIDTHS });
                return (
                  <img
                    src={optimized.src}
                    srcSet={optimized.srcSet}
                    sizes={SMALL_SIZES}
                    alt={smallImageTop.title || ''}
                    className={`relative z-10 w-full h-[100vw] xl:h-[350px] object-cover ${imgBorder}`}
                    loading="lazy"
                  />
                );
              })()}
            </div>
          )}

          {smallImageBottom.imageUrl ? (
            <div className="relative min-h-[100vw] xl:min-h-[350px]">
              <div className='bg-radial from-white to-gray-500 animate-pulse top-0 left-0 w-full h-full z-0 absolute' />
              {smallImageBottom.lightboxImages.length > 0 ? (
                <div className="relative z-10">
                  <BrandingLightbox
                    thumb={smallImageBottom.imageUrl}
                    images={smallImageBottom.lightboxImages}
                    title={smallImageBottom.title}
                    size="small"
                    onOpen={() => openLightbox(smallImageBottom.lightboxImages, smallImageBottom.title)}
                  />
                </div>
              ) : (() => {
                const optimized = netlifyImg(smallImageBottom.mobileImageUrl || smallImageBottom.imageUrl, { widths: SMALL_WIDTHS });
                return (
                  <img
                    src={optimized.src}
                    srcSet={optimized.srcSet}
                    sizes={SMALL_SIZES}
                    alt={smallImageBottom.title || ''}
                    className={`relative z-10 w-full h-[100vw] xl:h-[350px] object-cover ${imgBorder}`}
                    loading="lazy"
                  />
                );
              })()}
            </div>
          ) : (
            /* CTA tile when no bottom image */
            <div className="relative hidden xl:flex flex-col items-center justify-center bg-[#24B6BF] xl:h-[350px] border-solid border-black border-[9px] p-6 text-center">
              <h2 className="text-white font-stratos uppercase text-[1.75rem] leading-6 font-bold mb-4">
                Want to see your new site here?
              </h2>
              <a href={convertCMSLink(contactLink.url)} className={`${btnBase} ${solidBlackDark}`}>
                {contactLink.title}
              </a>
            </div>
          )}
        </div>
      </div>

      {lightboxImages && (
        <ImageGalleryModal
          images={lightboxImages}
          title={lightboxTitle}
          onClose={() => setLightboxImages(null)}
        />
      )}
    </>
  );
}

// ─── Video / Interactive grid ─────────────────────────────────────────────────

function MediaGrid({ categories }: { categories: MediaCategory[] }) {
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  return (
    <div className="overflow-hidden xl:px-12 max-w-[1280px] ml-auto mr-auto">
      {categories.map((cat, ci) => (
        <div key={ci} className="md:py-10">
          {cat.title && (
            <h2 className="font-stratos uppercase font-bold text-50px leading-H2-H3 text-center pt-6 md:pt-0 md:pb-4 lg:pb-8 text-white">
              {cat.title}
            </h2>
          )}
          <div className="md:grid md:grid-cols-2 md:gap-6 border-solid border-black border-[9px]">
            {cat.videos.map((vid, vi) => {
              if (!vid.videoUrl || !vid.imageUrl) return null;
              return (
                <div key={vi} className="relative my-10 md:my-0 w-full min-h-[321px]">
                  <div className='bg-radial from-white to-gray-500 animate-pulse top-0 left-0 w-full h-full z-0 absolute' />
                  <button
                    type="button"
                    className="block w-full text-left bg-white z-10 relative"
                    onClick={() => setActiveVideo({ url: vid.videoUrl, title: vid.title })}
                    aria-label={`Play ${vid.title}`}
                  >
                    {(() => {
                      const optimized = netlifyImg(vid.imageUrl, { widths: VIDEO_WIDTHS });
                      return (
                        <img
                          src={optimized.src}
                          srcSet={optimized.srcSet}
                          sizes={VIDEO_SIZES}
                          alt={vid.title}
                          className="w-full object-cover"
                          loading="lazy"
                        />
                      );
                    })()}
                    {(vid.title && vid.subtitle) && 
                      <TitleOverlay title={vid.title} subtitle={vid.subtitle} link={null}  type={`video`} />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {activeVideo && (
        <VideoModal
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}

// –– FeaturedHeader  ───────────────────────────────────────────────────────────
function FeaturedHeader({ header, active }: { header: PortfolioHeader | false; active: Filter }) {
  if (!header) return null;

  const { layoutContent, layoutSettings } = header;

  const [toRender, setRendering] = useState<FilterHeading | undefined>(undefined);

  const handleRendering = (state: Filter) => {
    switch (state) {
      case "Websites":
        setRendering(layoutContent?.websites);
        break;
      case "Branding":
        setRendering(layoutContent?.branding);
        break;
      case "Video":
        setRendering(layoutContent?.video);
        break;
      case "Interactive":
        setRendering(layoutContent?.interactive);
        break;
      default:
        setRendering(layoutContent?.websites);
        break;
    }
  };

  useEffect(() => {
    handleRendering(active);
  }, [active]);

  if (!toRender) return null;

  return (
    <section className="-mt-px pt-20 pb-0 bg-white relative mb-20" >
      <div className="container">
        {toRender.heading && (
          <h1 className={`${theme.text.H1_STD} mb-9`}>
            {toRender.heading.black && (
              <span className="text-rm-black">{toRender.heading.black + " "}</span>
            )}
            {toRender.heading.green && (
              <span className="text-rm-green">{toRender.heading.green + " "}</span>
            )}
          </h1>
         )}
          {toRender.body && (
            <p
              dangerouslySetInnerHTML={{ __html: Parser(toRender.body) }}
              className={`mb-9 ${theme.text.H4_LTE}`}
            />
          )}
        </div>
      </section>
  );
}


// ─── Main component ───────────────────────────────────────────────────────────

export default function FeaturedProjectsGridDev({
  websiteBlocks,
  brandingBlocks,
  videoCategories,
  interactiveCategories,
  header
}: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('Websites');

  // Read initial filter from URL param on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const type = (params.get('type') || '').toLowerCase();
    if (type === 'branding') setActiveFilter('Branding');
    else if (type === 'video' || type === 'videos') setActiveFilter('Video');
    else if (type === 'interactive') setActiveFilter('Interactive');
    else if (type === 'websites') setActiveFilter('Websites');
  }, []);

  const handleFilter = useCallback((f: Filter) => setActiveFilter(f), []);

  const isBgBlack = activeFilter === 'Websites';

  return (
    <>
      <FeaturedHeader header={header} active={activeFilter} />
      <PortfolioNav active={activeFilter} onFilter={handleFilter} />

      <section
        className={` bg-black overflow-hidden py-0`}
      >
        {/* Websites */}
        {activeFilter === 'Websites' && (
          <div className="mt-10">
            {websiteBlocks.map((block, i) => (
              <WebsiteBlockItem key={i} block={block} index={i} />
            ))}
          </div>
        )}

        {/* Branding */}
        {activeFilter === 'Branding' && (
          <div className="mt-10">
            {brandingBlocks.map((block, i) => (
              <BrandingBlockItem key={i} block={block} index={i} />
            ))}
          </div>
        )}

        {/* Video */}
        {activeFilter === 'Video' && (
          <MediaGrid categories={videoCategories} />
        )}

        {/* Interactive */}
        {activeFilter === 'Interactive' && (
          <MediaGrid categories={interactiveCategories} />
        )}
      </section>
    </>
  );
}
