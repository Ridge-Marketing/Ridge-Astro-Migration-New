/**
 * React island: Mobile navigation with accordion sub-menus
 */
import { useState } from 'react';
import type { WpMenuItem } from '@/lib/wp-types';

const ChevronRight = ({ className }: { className?: string }) => (
  <svg width="20" height="36" viewBox="0 0 20 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M1.40625 35.1875L0.859375 34.6406C0.46875 34.25 0.46875 33.7031 0.859375 33.3125L16.0938 18L0.859375 2.76562C0.46875 2.375 0.46875 1.82812 0.859375 1.4375L1.40625 0.890625C1.79688 0.5 2.34375 0.5 2.73438 0.890625L19.2188 17.375C19.6094 17.7656 19.6094 18.3125 19.2188 18.7031L2.73438 35.1875C2.34375 35.5781 1.79688 35.5781 1.40625 35.1875Z" fill="currentColor" />
  </svg>
);

interface MenuItemProps {
  navItem: any;
  setShowMenu: (show: boolean) => void;
}

function MenuItem({ navItem, setShowMenu }: MenuItemProps) {
  const children = navItem.children || [];
  const [subMenuOpen, setSubMenuOpen] = useState(children.length > 6);

  return (
    <li className="font-basic-sans font-light text-21px leading-28px group flex flex-col h-full justify-center relative bg-white">
      <div className="flex justify-between items-center">
        <a
          onClick={() => setShowMenu(false)}
          title={navItem.title?.rendered || navItem.title}
          href={navItem.url}
          className="py-2 border-b border-transparent flex items-center group-hover:text-rm-green group-hover:border-rm-green"
        >
          <span>{navItem.title?.rendered || navItem.title}</span>
        </a>
        {children.length > 0 && (
          <button
            onClick={() => setSubMenuOpen(!subMenuOpen)}
            className="w-6 h-6 flex flex-col items-center justify-center"
          >
            <ChevronRight className={`h-4 ${subMenuOpen ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        )}
      </div>
      {children.length > 0 && (
        <div className={`transition-all duration-300 ${subMenuOpen ? 'h-auto' : 'h-0 overflow-hidden'}`}>
          <div className={`bg-white py-2 text-rm-black flex flex-col gap-6 pl-4 border-l border-rm-grey border-opacity-10 ${children.length > 6 ? 'md:grid md:grid-cols-2 gap-y-4 gap-x-6' : ''}`}>
            {children.map((subItem: any, idx: number) => (
              <a
                key={idx}
                onClick={() => setShowMenu(false)}
                href={subItem.url}
                className="flex hover:text-rm-green hover:underline"
              >
                {subItem.acf?.icon?.source_url && (
                  <img src={subItem.acf.icon.source_url} alt="" className="h-[40px] w-[40px] mr-5 block" />
                )}
                {subItem.title?.rendered || subItem.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

interface MobileMenuProps {
  menuItems: any[];
  setShowMenu: (show: boolean) => void;
}

export default function MobileMenu({ menuItems, setShowMenu }: MobileMenuProps) {
  return (
    <div className="absolute top-full left-0 flex flex-col pt-6 min-h-screen md:w-full">
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70"></div>
      <div className="container">
        <div className="relative py-4 px-6 bg-white text-black max-h-[80vh] overflow-scroll">
          {menuItems.map((navItem: any, index: number) => (
            <MenuItem key={index} navItem={navItem} setShowMenu={setShowMenu} />
          ))}
        </div>
      </div>
    </div>
  );
}
