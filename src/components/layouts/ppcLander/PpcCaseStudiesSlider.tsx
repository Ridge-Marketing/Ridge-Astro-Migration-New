/**
 * PPC Case Studies slider — React island.
 * Auto-advancing media + text slider with prev/next counter.
 * Replaces Gatsby's ppcLander/PpcCaseStudies.js (media pre-resolved by the
 * Astro wrapper into plain URLs)
 */
import { useState, useRef, useEffect } from 'react';

interface Item {
  heading: string;
  body: string;
  industry: string;
  tactic: string;
  mediaType: string;
  imageUrl: string;
  imageAlt: string;
  mobileImageUrl: string;
  mobileImageAlt: string;
  videoUrl: string;
  videoMime: string;
}

interface Props {
  items: Item[];
}

const theme = {
  P_STD:  'font-basic-sans font-light text-21px leading-28px ',
  FOOTER: 'font-basic-sans font-light text-16px leading-26px ',
};

export default function PpcCaseStudiesSlider({ items }: Props) {
  const [slide, setSlide]                  = useState(0);
  const [slideInteraction, setInteraction] = useState(false);
  const [isVisible, setIsVisible]          = useState(false);
  const carouselRef                        = useRef<HTMLDivElement>(null);
  const activeVideo                        = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    if (carouselRef.current) observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeVideo.current) {
      activeVideo.current.play().catch(() => {});
    }
  }, [slide]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isVisible && !slideInteraction) {
        setSlide((i) => (i === items.length - 1 ? 0 : i + 1));
      }
    }, 6000);
    return () => clearInterval(interval);
  });

  const nextSlide = () => {
    setInteraction(true);
    setSlide((i) => (i === items.length - 1 ? 0 : i + 1));
  };

  const prevSlide = () => {
    setInteraction(true);
    setSlide((i) => (i === 0 ? items.length - 1 : i - 1));
  };

  if (!items.length) return null;

  const current = items[slide];

  return (
    <div ref={carouselRef} className="flex flex-col xl:flex-row xl:mr-[calc((100%-1224px)/2)] max-w-[2000px] 3xl:mx-auto items-center justify-start">

      <div className="w-full xl:w-[55%] xlz:w-[65%] xlz:max-w-[945px] aspect-video overflow-hidden shrink-0">
        {current.mediaType === 'image' ? (
          current.imageUrl && (
            <>
              {current.mobileImageUrl && (
                <img
                  src={current.mobileImageUrl}
                  alt={current.mobileImageAlt || ''}
                  className="w-full h-full aspect-video object-contain xl:hidden"
                />
              )}
              <img
                src={current.imageUrl}
                alt={current.imageAlt || ''}
                className={`w-full h-full aspect-video object-contain ${current.mobileImageUrl ? 'hidden xl:block' : ''}`}
              />
            </>
          )
        ) : (
          current.videoUrl && (
            <video key={current.videoUrl} ref={activeVideo} autoPlay muted playsInline loop className="w-full h-full aspect-video">
              <source src={current.videoUrl} type={current.videoMime} />
            </video>
          )
        )}
      </div>

      <div className="w-full xl:w-[45%] xlz:w-[35%] flex flex-col justify-center gap-10 px-8 md:px-14 xl:pl-20 xl:pr-0 py-12 xl:py-0 text-center md:text-left items-center md:items-start">

        <div className="flex flex-col gap-6">
          {current.heading && (
            <h3 className="font-stratos font-normal text-[34px] leading-[38px] md:text-[2.875rem] md:leading-[1.2] text-black">
              {current.heading}
            </h3>
          )}
          {current.body && (
            <div
              dangerouslySetInnerHTML={{ __html: current.body }}
              className={`${theme.P_STD} !leading-[2rem] text-black`}
            />
          )}
          {(current.industry || current.tactic) && (
            <p className={`${theme.FOOTER} text-black`}>
              {current.industry && (
                <>
                  <strong>Industry:</strong> <span>{current.industry}</span>
                </>
              )}
              {current.industry && current.tactic && <span className="text-[#cdcdcd] mx-3">|</span>}
              {current.tactic && (
                <>
                  <strong>Tactic:</strong> <span>{current.tactic}</span>
                </>
              )}
            </p>
          )}
        </div>

        {items.length > 1 && (
          <div className="flex items-center bg-rm-pale-grey w-[138px] h-[68px]">
            <button
              onClick={prevSlide}
              aria-label="Previous case study"
              className="flex items-center justify-center w-[46px] h-full shrink-0 transition-opacity hover:opacity-60 cursor-pointer"
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M9 1L1 9L9 17" stroke="#474848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className={`${theme.FOOTER} text-black text-center flex-1`}>
              {slide + 1} / {items.length}
            </span>
            <button
              onClick={nextSlide}
              aria-label="Next case study"
              className="flex items-center justify-center w-[46px] h-full shrink-0 transition-opacity hover:opacity-60 cursor-pointer"
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M1 1L9 9L1 17" stroke="#474848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
