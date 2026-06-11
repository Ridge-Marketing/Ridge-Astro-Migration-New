/**
 * PpcProjectSlider — React island for the looping, center-focused project
 * circle slider (autoplay + arrows).
 * Replaces Gatsby's ppcLander/PpcProjectSlider.js (@splidejs); the track is
 * rendered 3× and re-centered without transition at the copy boundaries.
 */
import { useState, useRef, useEffect, useCallback } from 'react';

interface Slide {
  imageUrl: string;
  imageAlt: string;
}

interface Props {
  slides: Slide[];
}

const SPEED = 800;     // transition ms (Splide speed)
const INTERVAL = 3000; // autoplay ms

export default function PpcProjectSlider({ slides }: Props) {
  const count = slides.length;

  // index within the middle copy: [count, 2*count)
  const [index, setIndex]           = useState(count);
  const [animate, setAnimate]       = useState(true);
  const [perPage, setPerPage]       = useState(5);
  const [moving, setMoving]         = useState(false);
  const containerRef                = useRef<HTMLDivElement>(null);
  const isVisibleRef                = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setPerPage(mq.matches ? 3 : 5);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const move = useCallback((delta: number) => {
    if (moving) return;
    setMoving(true);
    setAnimate(true);
    setIndex((prev) => prev + delta);
    window.setTimeout(() => {
      setMoving(false);
      // Re-center into the middle copy without animating
      setIndex((prev) => {
        if (prev >= count * 2 || prev < count) {
          setAnimate(false);
          return count + (((prev % count) + count) % count);
        }
        return prev;
      });
    }, SPEED);
  }, [moving, count]);

  // Re-enable animation on the frame after a silent re-center
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  // Autoplay (only while visible)
  useEffect(() => {
    const id = setInterval(() => {
      if (isVisibleRef.current) move(1);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [move]);

  if (count === 0) return null;

  const slideWidth = 100 / perPage;
  // Center the active slide: shift so `index` sits in the middle slot
  const offset = (index - (perPage - 1) / 2) * slideWidth;

  const arrowClasses = `cursor-pointer !h-[35px] transition-all duration-300 ease-out ${moving ? 'pointer-events-none opacity-60' : ''}`;

  return (
    <div ref={containerRef} className="w-[175%] -ml-[37.5%] xl:w-[120%] xl:-ml-[10%] will-change-transform">
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${offset}%)`,
            transition: animate ? `transform ${SPEED}ms ease` : 'none',
          }}
        >
          {[0, 1, 2].map((copy) =>
            slides.map((slide, i) => {
              const absolute = copy * count + i;
              const isActive = absolute === index;
              return (
                <div
                  key={`${copy}-${i}`}
                  className="shrink-0 px-[12px]"
                  style={{ width: `${slideWidth}%` }}
                  aria-hidden={copy !== 1 ? 'true' : undefined}
                >
                  <img
                    src={slide.imageUrl}
                    alt={copy === 1 ? slide.imageAlt : ''}
                    className="w-full h-auto rounded-3xl object-contain will-change-transform [image-rendering:crisp-edges]"
                    style={{
                      transform: isActive ? 'scale(1)' : 'scale(0.9)',
                      transition: `transform ${SPEED}ms ease`,
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-center mt-10 gap-14">
        <button type="button" aria-label="Previous slide" onClick={() => move(-1)} className={`${arrowClasses} rotate-180`}>
          <svg width="19" height="35" viewBox="0 0 19 35" fill="none">
            <path d="M0.839844 34.5898C1.23047 34.9805 1.77734 34.9805 2.16797 34.5898L18.6523 18.1055C19.043 17.7148 19.043 17.168 18.6523 16.7773L2.16797 0.292969C1.77734 -0.0976562 1.23047 -0.0976562 0.839844 0.292969L0.292969 0.839844C-0.0976562 1.23047 -0.0976562 1.77734 0.292969 2.16797L15.5273 17.4023L0.292969 32.7148C-0.0976562 33.1055 -0.0976562 33.6523 0.292969 34.043L0.839844 34.5898Z" fill="#474848" />
          </svg>
        </button>
        <button type="button" aria-label="Next slide" onClick={() => move(1)} className={arrowClasses}>
          <svg width="19" height="35" viewBox="0 0 19 35" fill="none">
            <path d="M0.839844 34.5898C1.23047 34.9805 1.77734 34.9805 2.16797 34.5898L18.6523 18.1055C19.043 17.7148 19.043 17.168 18.6523 16.7773L2.16797 0.292969C1.77734 -0.0976562 1.23047 -0.0976562 0.839844 0.292969L0.292969 0.839844C-0.0976562 1.23047 -0.0976562 1.77734 0.292969 2.16797L15.5273 17.4023L0.292969 32.7148C-0.0976562 33.1055 -0.0976562 33.6523 0.292969 34.043L0.839844 34.5898Z" fill="#474848" />
          </svg>
        </button>
      </div>
    </div>
  );
}
