/**
 * React island for Header interactivity:
 * - Scroll detection (shrink on scroll)
 * - Mobile menu toggle
 */
import { useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';

interface HeaderIslandProps {
  logoLight: string;
  logoDark: string;
  logoAlt: string;
  color: string;
  menuItems: any[];
  mobileMenuItems: any[];
}

// Inline SVG components (from src/components/svg.js)
const Hamburger = () => (
  <svg version="1.1" x="0px" y="0px" width="33" height="19.5" viewBox="0 0 33 19.5">
    <g className="w-full" fill="currentColor">
      <path d="M0,0h33v4H0V0z" />
      <path d="M0,15.6h33v4H0V15.6z" />
      <path d="M0,7.8h33v4H0V7.8z" />
    </g>
  </svg>
);

const Close = () => (
  <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.17708 2.7369C3.27392 1.71602 4.98513 1.78271 5.99918 2.88587L23.3211 21.73C24.3352 22.8332 24.2681 24.555 23.1712 25.5759C22.0744 26.5968 20.3632 26.5301 19.3491 25.4269L2.02718 6.58281C1.01313 5.47965 1.08025 3.75778 2.17708 2.7369Z" fill="currentColor" />
    <path d="M2.35122 25.736C1.23902 24.732 1.14563 23.0116 2.14263 21.8932L19.1773 2.78434C20.1743 1.66594 21.8842 1.57313 22.9964 2.57704C24.1086 3.58095 24.2019 5.30142 23.2049 6.41982L6.17027 25.5287C5.17327 26.6471 3.46342 26.7399 2.35122 25.736Z" fill="currentColor" />
  </svg>
);

export default function HeaderIsland({
  logoLight,
  logoDark,
  logoAlt,
  color,
  menuItems,
  mobileMenuItems,
}: HeaderIslandProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu]     = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.pageYOffset > 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const textColor = color === 'black' ? 'text-rm-white' : 'text-rm-black';
  const logo = color === 'black' ? logoDark : logoLight;
  const logoClasses = color === 'black' ? 'w-[250px] sm:w-[275px] xl:w-[300px]' : 'w-[175px] sm:w-[250px] xl:w-[300px]';

  return (
    <>
      <li className={`transition-transform duration-500 ${isScrolled ? 'scale-75' : ''}`}>
        <a href="/" className="h-min">
          <img className={`${logoClasses} block`} alt={logoAlt} src={logo} />
        </a>
      </li>
      <li className="w-[40px] h-[40px] flex ml-auto xl:hidden">
        <button
          onClick={() => setShowMenu(!showMenu)}
          type="button"
          aria-expanded={showMenu}
          aria-label="Toggle mobile menu"
        >
          {showMenu ? <Close /> : <Hamburger />}
        </button>
      </li>
      <div className="block xl:hidden">
        {showMenu && (
          <MobileMenu
            menuItems={mobileMenuItems}
            setShowMenu={setShowMenu}
          />
        )}
      </div>
    </>
  );
}
