/**
 * FeaturedProjectsCarousel — React island for auto-advancing carousel
 * Replaces Gatsby's FeaturedProjectsCarousel.js
 */
import { useState, useRef, useEffect, useCallback } from 'react';

interface Slide {
  caption: string;
  title: string;
  link: string;
  imageUrl: string;
  imageAlt: string;
}

interface Props {
  heading: string;
  slides: Slide[];
}

const theme = {
  text: {
    H2: 'font-stratos uppercase font-bold text-50px leading-H2-H3 ',
    P_STD: 'font-basic-sans font-light text-21px leading-28px ',
  },
  button: {
    BASE_STYLING:
      'inline-block text-21px font-stratos uppercase py-3 px-16 text-center font-normal border-2 border-solid transition-all ease-in-out ',
    GHOST_GREEN_HOVER_DARK:
      'GHOST_GREEN_HOVER_DARK text-rm-black border-rm-green bg-white hover:bg-rm-green ',
  },
};

export default function FeaturedProjectsCarousel({ heading, slides }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);

  const slide = slides[activeIndex];
  const headingArr = heading ? heading.split(' ') : ['', ''];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const handleClick = (next: boolean) => {
    setUserInteracted(true);
    next ? nextSlide() : prevSlide();
  };

  // IntersectionObserver for visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (userInteracted) return;
    const interval = setInterval(() => {
      if (isVisibleRef.current) nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [userInteracted, nextSlide]);

  return (
    <div ref={containerRef} className="relative lg:flex justify-end">
      {/* Mobile heading */}
      <div className="lg:hidden">
        <h2 className={`${theme.text.H2} hidden lg:block lg:absolute lg:top-6 lg:right-4`}>
          {heading}
        </h2>
      </div>

      {/* Image panel */}
      <div className="flex-shrink-0 w-full max-w-[680px] 2xl:max-w-[712px] h-[734px] text-right md:w-[calc(100%+(50vw-350px))] md:-ml-[calc(50vw-350px)] lg:w-[calc(100%+(50vw-465px))] lg:-ml-[calc(50vw-465px)] xl:w-full xl:ml-0 bg-transparent relative">
        <h2 className={`${theme.text.H2} z-20 text-white hidden lg:block lg:absolute lg:top-6 lg:right-4`}>
          {headingArr[0]}
        </h2>
        {slide?.imageUrl && (
          <div className="absolute overflow-hidden w-full h-full">
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt || ' '}
              className="w-full h-full object-contain object-top-right transition-opacity duration-500"
              key={activeIndex}
            />
          </div>
        )}
      </div>

      {/* Content panel */}
      <div className="absolute bottom-0 right-0 w-full lg:relative md:flex">
        <h2 className={`${theme.text.H2} text-black hidden lg:block lg:absolute lg:mt-6 lg:ml-4`}>
          {headingArr[1]}
        </h2>
        <div className="self-end flex flex-col w-full mx-auto md:w-auto md:ml-auto md:mr-0 lg:-ml-[45%] xl:-ml-36 max-w-[360px] md:max-w-none">
          <div className="px-8 pt-7 pb-10 bg-white w-full md:max-w-[548px] md:px-12 md:pt-9 shadow-block">
            <h3
              className={theme.text.P_STD}
              dangerouslySetInnerHTML={{ __html: slide?.title ?? '' }}
            />
            <h5 className="font-stratos uppercase font-bold text-[32px] md:text-40px leading-44px">
              {slide?.caption}
            </h5>
            <div className="mt-6">
              <a
                className={`${theme.button.BASE_STYLING}${theme.button.GHOST_GREEN_HOVER_DARK}`}
                href={slide?.link}
              >
                View Project
              </a>
            </div>
          </div>
          <div className="w-36 flex bg-rm-pale-grey">
            <button
              className="flex-1 px-5 py-3 text-40px cursor-pointer"
              onClick={() => handleClick(false)}
              aria-label="Previous slide"
            >
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5938 35.1875L19.1406 34.6406C19.5312 34.25 19.5312 33.7031 19.1406 33.3125L3.90625 18L19.1406 2.76562C19.5312 2.375 19.5312 1.82812 19.1406 1.4375L18.5938 0.890625C18.2031 0.5 17.6562 0.5 17.2656 0.890625L0.78125 17.375C0.390625 17.7656 0.390625 18.3125 0.78125 18.7031L17.2656 35.1875C17.6562 35.5781 18.2031 35.5781 18.5938 35.1875Z" fill="black"/>
              </svg>
            </button>
            <button
              className="flex-1 px-5 py-3 text-40px cursor-pointer"
              onClick={() => handleClick(true)}
              aria-label="Next slide"
            >
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.40625 35.1875L0.859375 34.6406C0.46875 34.25 0.46875 33.7031 0.859375 33.3125L16.0938 18L0.859375 2.76562C0.46875 2.375 0.46875 1.82812 0.859375 1.4375L1.40625 0.890625C1.79688 0.5 2.34375 0.5 2.73438 0.890625L19.2188 17.375C19.6094 17.7656 19.6094 18.3125 19.2188 18.7031L2.73438 35.1875C2.34375 35.5781 1.79688 35.5781 1.40625 35.1875Z" fill="black"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
