/**
 * PPC Approach interactive circles diagram — React island.
 * Desktop: click a circle to toggle its popup card; tablet: card below the
 * diagram for the active circle; mobile: all cards stacked.
 * Replaces the interactive portion of Gatsby's ppcLander/PpcApproach.js
 * (copy is hardcoded there too — ACF save issues; never edited by non-devs)
 */
import { useState } from 'react';

const COPY = [
  {
    title: 'Strategy',
    color: 'text-rm-green',
    copy: 'We start with your end goals in mind and build an iterative and actionable plan to get you there.',
  },
  {
    title: 'Creativity',
    color: 'text-rm-aqua',
    copy: 'We build and optimize websites, creative assets and campaigns to attract and inspire your next wave of customers.',
  },
  {
    title: 'Service',
    color: 'text-[#757575]',
    copy: 'We work as an extension of your team, we pay attention to details, and we execute quickly.',
  },
  {
    title: 'Results',
    color: 'text-rm-grey',
    copy: 'We work strategically to achieve the results you need, track campaigns carefully, and make continuous improvements.',
  },
];

const P_STD = 'font-basic-sans font-light text-21px leading-28px ';

// Per-circle absolute positions for the desktop popup buttons (don't follow a
// consistent pattern — specifically positioned, same as Gatsby)
const BUTTON_POSITIONS = [
  'left-[13.5%] lg:left-[12.75%] lg:ml-[15px]',
  'left-[36.5%] lg:left-[37.5%]',
  'left-[60%] lg:left-[61%]',
  'left-[82%] lg:left-[83%]',
];

export default function PpcApproachDiagram() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDesktop, setOpenDesktop] = useState<number | null>(null);
  const [openTablet, setOpenTablet]   = useState(true);

  const handleDesktopClick = (index: number) => {
    setActiveIndex(index);
    setOpenTablet(true);
    setOpenDesktop((prev) => (prev === index ? null : index));
  };

  const renderInsideDesktop = (copy: string, isOpen: boolean) => (
    <>
      <svg width="31" height="31" viewBox="0 0 31 31" fill="none">
        <path d="M23.5 14.5V16.5C23.5 16.9375 23.125 17.25 22.75 17.25H17.25V22.75C17.25 23.1875 16.875 23.5 16.5 23.5H14.5C14.0625 23.5 13.75 23.1875 13.75 22.75V17.25H8.25C7.8125 17.25 7.5 16.9375 7.5 16.5V14.5C7.5 14.125 7.8125 13.75 8.25 13.75H13.75V8.25C13.75 7.875 14.0625 7.5 14.5 7.5H16.5C16.875 7.5 17.25 7.875 17.25 8.25V13.75H22.75C23.125 13.75 23.5 14.125 23.5 14.5ZM31 15.5C31 24.0625 24.0625 31 15.5 31C6.9375 31 0 24.0625 0 15.5C0 6.9375 6.9375 0 15.5 0C24.0625 0 31 6.9375 31 15.5ZM28 15.5C28 8.625 22.375 3 15.5 3C8.5625 3 3 8.625 3 15.5C3 22.4375 8.5625 28 15.5 28C22.375 28 28 22.4375 28 15.5Z" fill="white" />
      </svg>
      <div className={`bg-white rounded-2xl shadow-cmocard hidden xl:flex flex-col items-center w-[313px] gap-4 absolute -top-6 left-1/2 -translate-x-1/2 transition-all duration-150 ease-out ${isOpen ? 'px-7 pt-6 pb-14' : 'h-0 overflow-hidden opacity-0'}`}>
        <svg width="31" height="31" viewBox="0 0 31 31" fill="none">
          <path d="M8.25 17.25C7.8125 17.25 7.5 16.9375 7.5 16.5V14.5C7.5 14.125 7.8125 13.75 8.25 13.75H22.75C23.125 13.75 23.5 14.125 23.5 14.5V16.5C23.5 16.9375 23.125 17.25 22.75 17.25H8.25ZM31 15.5C31 24.0625 24.0625 31 15.5 31C6.9375 31 0 24.0625 0 15.5C0 6.9375 6.9375 0 15.5 0C24.0625 0 31 6.9375 31 15.5ZM28 15.5C28 8.625 22.375 3 15.5 3C8.5625 3 3 8.625 3 15.5C3 22.4375 8.5625 28 15.5 28C22.375 28 28 22.4375 28 15.5Z" fill="black" />
        </svg>
        <p className={P_STD}>{copy}</p>
      </div>
    </>
  );

  return (
    <>
      <div className="relative">
        {COPY.map((el, index) => (
          <button
            key={el.title}
            onClick={() => handleDesktopClick(index)}
            className={`absolute z-10 hidden md:block bottom-12 ${BUTTON_POSITIONS[index]}`}
          >
            {renderInsideDesktop(el.copy, openDesktop === index)}
          </button>
        ))}

        <svg className="w-full" width="1146" viewBox="0 0 1146 358" fill="none">
          <g filter="url(#filter0_d_9665_1379)">
            <path d="M967.213 346C1059.33 346 1134 271.23 1134 179C1134 86.7699 1059.33 12 967.213 12C875.102 12 800.428 86.7699 800.428 179C800.428 271.23 875.102 346 967.213 346Z" fill="white" fillOpacity="0.8" shapeRendering="crispEdges" />
          </g>
          <g filter="url(#filter1_d_9665_1379)">
            <path d="M712.969 346C805.081 346 879.755 271.23 879.755 179C879.755 86.7699 805.081 12 712.969 12C620.858 12 546.184 86.7699 546.184 179C546.184 271.23 620.858 346 712.969 346Z" fill="white" fillOpacity="0.8" shapeRendering="crispEdges" />
          </g>
          <g filter="url(#filter2_d_9665_1379)">
            <path d="M443.766 346C535.878 346 610.552 271.23 610.552 179C610.552 86.7699 535.878 12 443.766 12C351.654 12 276.98 86.7699 276.98 179C276.98 271.23 351.654 346 443.766 346Z" fill="white" fillOpacity="0.8" shapeRendering="crispEdges" />
          </g>
          <g opacity="0.8" filter="url(#filter3_d_9665_1379)">
            <path d="M178.786 346C270.897 346 345.571 271.23 345.571 179C345.571 86.7699 270.897 12 178.786 12C86.674 12 12 86.7699 12 179C12 271.23 86.674 346 178.786 346Z" fill="white" />
          </g>
          <path d="M178.785 326.187C259.843 326.187 325.544 260.401 325.544 179.239C325.544 98.0765 259.843 32.291 178.785 32.291C97.7264 32.291 32.0254 98.0765 32.0254 179.239C32.0254 260.401 97.7264 326.187 178.785 326.187Z" fill="#A9CF38" fillOpacity="0.8" />
          <path d="M967.627 325.949C1048.68 325.949 1114.39 260.163 1114.39 179.001C1114.39 97.8382 1048.68 32.0527 967.627 32.0527C886.568 32.0527 820.867 97.8382 820.867 179.001C820.867 260.163 886.568 325.949 967.627 325.949Z" fill="#474848" fillOpacity="0.8" />
          <path d="M712.828 326.187C793.886 326.187 859.587 260.401 859.587 179.239C859.587 98.0765 793.886 32.291 712.828 32.291C631.769 32.291 566.068 98.0765 566.068 179.239C566.068 260.401 631.769 326.187 712.828 326.187Z" fill="#CDCDCD" fillOpacity="0.8" />
          <path d="M443.765 326.187C524.824 326.187 590.525 260.401 590.525 179.239C590.525 98.0765 524.824 32.291 443.765 32.291C362.707 32.291 297.006 98.0765 297.006 179.239C297.006 260.401 362.707 326.187 443.765 326.187Z" fill="#24B6BF" fillOpacity="0.8" />
          <path d="M115.204 179.19C115.204 174.71 118.116 172.918 121.7 172.918C125.316 172.918 128.228 174.998 128.228 179.318V181.014H123.78V179.414C123.78 177.654 122.98 176.854 121.7 176.854C120.516 176.854 119.684 177.59 119.684 178.966C119.684 180.566 120.644 181.398 122.116 182.486L124.868 184.502C126.916 186.038 128.548 187.958 128.548 191.062C128.548 195.51 125.476 197.75 121.732 197.75C117.988 197.75 114.948 195.446 114.948 191.318V189.334H119.428V191.094C119.428 192.79 120.356 193.814 121.732 193.814C123.14 193.814 124.036 192.982 124.036 191.606C124.036 189.878 123.012 188.918 121.476 187.766L118.852 185.814C116.74 184.278 115.204 182.39 115.204 179.19ZM129.743 177.398V173.334H142.991V177.398H138.703V197.334H134.063V177.398H129.743ZM145.218 197.334V173.334H152.834C156.866 173.334 159.746 175.51 159.746 179.574V180.502C159.746 183.798 157.858 185.75 155.106 186.454L160.418 197.334H155.138L149.826 185.526V197.334H145.218ZM152.322 177.334H149.826V183.766H152.322C154.05 183.766 155.138 182.838 155.138 180.598V180.182C155.138 178.102 154.05 177.334 152.322 177.334ZM161.148 197.334L165.5 173.334H172.604L176.988 197.334H172.412L171.612 192.438H166.492L165.692 197.334H161.148ZM167.164 188.438H170.94L169.052 176.854L167.164 188.438ZM176.555 177.398V173.334H189.803V177.398H185.515V197.334H180.875V177.398H176.555ZM192.03 197.334V173.334H203.518V177.398H196.638V182.998H202.878V187.094H196.638V193.238H203.518V197.334H192.03ZM213.378 184.534H221.282V197.334H217.57V194.838C216.61 196.79 214.946 197.75 212.802 197.75C208.738 197.75 206.242 194.966 206.242 189.398V181.238C206.242 175.67 209.09 172.918 213.762 172.918C218.434 172.918 221.282 175.67 221.282 181.238V182.326H216.642V181.174C216.642 178.038 215.554 177.014 213.762 177.014C212.002 177.014 210.882 178.038 210.882 181.174V189.494C210.882 192.63 211.97 193.654 213.762 193.654C215.522 193.654 216.642 192.598 216.642 189.718V188.438H213.378V184.534ZM232.751 188.598V197.334H228.111V188.598L222.735 173.334H227.247L230.415 183.254L233.583 173.334H238.095L232.751 188.598Z" fill="black" />
          <path d="M381.675 187.574H386.315V189.398C386.315 194.966 383.467 197.75 378.795 197.75C374.123 197.75 371.275 194.966 371.275 189.398V181.238C371.275 175.67 374.123 172.918 378.795 172.918C383.467 172.918 386.315 175.67 386.315 181.238V182.774H381.675V181.174C381.675 178.038 380.587 177.014 378.795 177.014C377.035 177.014 375.915 178.038 375.915 181.174V189.494C375.915 192.63 377.003 193.654 378.795 193.654C380.587 193.654 381.675 192.63 381.675 189.494V187.574ZM389.845 197.334V173.334H397.461C401.493 173.334 404.373 175.51 404.373 179.574V180.502C404.373 183.798 402.485 185.75 399.733 186.454L405.045 197.334H399.765L394.453 185.526V197.334H389.845ZM396.949 177.334H394.453V183.766H396.949C398.677 183.766 399.765 182.838 399.765 180.598V180.182C399.765 178.102 398.677 177.334 396.949 177.334ZM407.439 197.334V173.334H418.927V177.398H412.047V182.998H418.287V187.094H412.047V193.238H418.927V197.334H407.439ZM420.306 197.334L424.658 173.334H431.762L436.146 197.334H431.57L430.77 192.438H425.65L424.85 197.334H420.306ZM426.322 188.438H430.098L428.21 176.854L426.322 188.438ZM435.714 177.398V173.334H448.962V177.398H444.674V197.334H440.034V177.398H435.714ZM455.829 197.334H451.189V173.334H455.829V197.334ZM473.833 173.334L469.449 197.334H462.345L457.993 173.334H462.537L465.897 193.814L469.257 173.334H473.833ZM480.61 197.334H475.97V173.334H480.61V197.334ZM482.839 177.398V173.334H496.087V177.398H491.799V197.334H487.159V177.398H482.839ZM506.722 188.598V197.334H502.082V188.598L496.706 173.334H501.218L504.386 183.254L507.554 173.334H512.066L506.722 188.598Z" fill="black" />
          <path d="M654.561 179.19C654.561 174.71 657.473 172.918 661.057 172.918C664.673 172.918 667.585 174.998 667.585 179.318V181.014H663.137V179.414C663.137 177.654 662.337 176.854 661.057 176.854C659.873 176.854 659.041 177.59 659.041 178.966C659.041 180.566 660.001 181.398 661.473 182.486L664.225 184.502C666.273 186.038 667.905 187.958 667.905 191.062C667.905 195.51 664.833 197.75 661.089 197.75C657.345 197.75 654.305 195.446 654.305 191.318V189.334H658.785V191.094C658.785 192.79 659.713 193.814 661.089 193.814C662.497 193.814 663.393 192.982 663.393 191.606C663.393 189.878 662.369 188.918 660.833 187.766L658.209 185.814C656.097 184.278 654.561 182.39 654.561 179.19ZM670.7 197.334V173.334H682.188V177.398H675.308V182.998H681.548V187.094H675.308V193.238H682.188V197.334H670.7ZM685.232 197.334V173.334H692.848C696.88 173.334 699.76 175.51 699.76 179.574V180.502C699.76 183.798 697.872 185.75 695.12 186.454L700.432 197.334H695.152L689.84 185.526V197.334H685.232ZM692.336 177.334H689.84V183.766H692.336C694.064 183.766 695.152 182.838 695.152 180.598V180.182C695.152 178.102 694.064 177.334 692.336 177.334ZM717.001 173.334L712.617 197.334H705.513L701.161 173.334H705.705L709.065 193.814L712.425 173.334H717.001ZM723.778 197.334H719.138V173.334H723.778V197.334ZM737.687 187.574H742.327V189.398C742.327 194.966 739.479 197.75 734.807 197.75C730.135 197.75 727.287 194.966 727.287 189.398V181.238C727.287 175.67 730.135 172.918 734.807 172.918C739.479 172.918 742.327 175.67 742.327 181.238V182.774H737.687V181.174C737.687 178.038 736.599 177.014 734.807 177.014C733.047 177.014 731.927 178.038 731.927 181.174V189.494C731.927 192.63 733.015 193.654 734.807 193.654C736.599 193.654 737.687 192.63 737.687 189.494V187.574ZM745.857 197.334V173.334H757.345V177.398H750.465V182.998H756.705V187.094H750.465V193.238H757.345V197.334H745.857Z" fill="black" />
          <path d="M915.905 197.334V173.334H923.521C927.553 173.334 930.433 175.51 930.433 179.574V180.502C930.433 183.798 928.545 185.75 925.793 186.454L931.105 197.334H925.825L920.513 185.526V197.334H915.905ZM923.009 177.334H920.513V183.766H923.009C924.737 183.766 925.825 182.838 925.825 180.598V180.182C925.825 178.102 924.737 177.334 923.009 177.334ZM933.499 197.334V173.334H944.987V177.398H938.107V182.998H944.347V187.094H938.107V193.238H944.987V197.334H933.499ZM947.422 179.19C947.422 174.71 950.334 172.918 953.918 172.918C957.534 172.918 960.446 174.998 960.446 179.318V181.014H955.998V179.414C955.998 177.654 955.198 176.854 953.918 176.854C952.734 176.854 951.902 177.59 951.902 178.966C951.902 180.566 952.862 181.398 954.334 182.486L957.086 184.502C959.134 186.038 960.766 187.958 960.766 191.062C960.766 195.51 957.694 197.75 953.95 197.75C950.206 197.75 947.166 195.446 947.166 191.318V189.334H951.646V191.094C951.646 192.79 952.574 193.814 953.95 193.814C955.358 193.814 956.254 192.982 956.254 191.606C956.254 189.878 955.23 188.918 953.694 187.766L951.07 185.814C948.958 184.278 947.422 182.39 947.422 179.19ZM963.402 173.334H968.042V189.878C968.042 192.694 969.066 193.654 970.762 193.654C972.458 193.654 973.482 192.694 973.482 189.878V173.334H978.122V189.814C978.122 195.126 975.338 197.75 970.762 197.75C966.186 197.75 963.402 195.126 963.402 189.814V173.334ZM993.46 193.238V197.334H981.812V173.334H986.452V193.238H993.46ZM992.18 177.398V173.334H1005.43V177.398H1001.14V197.334H996.5V177.398H992.18ZM1007.05 179.19C1007.05 174.71 1009.96 172.918 1013.54 172.918C1017.16 172.918 1020.07 174.998 1020.07 179.318V181.014H1015.62V179.414C1015.62 177.654 1014.82 176.854 1013.54 176.854C1012.36 176.854 1011.53 177.59 1011.53 178.966C1011.53 180.566 1012.49 181.398 1013.96 182.486L1016.71 184.502C1018.76 186.038 1020.39 187.958 1020.39 191.062C1020.39 195.51 1017.32 197.75 1013.58 197.75C1009.83 197.75 1006.79 195.446 1006.79 191.318V189.334H1011.27V191.094C1011.27 192.79 1012.2 193.814 1013.58 193.814C1014.98 193.814 1015.88 192.982 1015.88 191.606C1015.88 189.878 1014.86 188.918 1013.32 187.766L1010.7 185.814C1008.58 184.278 1007.05 182.39 1007.05 179.19Z" fill="white" />
          <defs>
            <filter id="filter0_d_9665_1379" x="788.428" y="0" width="357.571" height="358" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset />
              <feGaussianBlur stdDeviation="6" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9665_1379" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9665_1379" result="shape" />
            </filter>
            <filter id="filter1_d_9665_1379" x="534.184" y="0" width="357.571" height="358" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset />
              <feGaussianBlur stdDeviation="6" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9665_1379" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9665_1379" result="shape" />
            </filter>
            <filter id="filter2_d_9665_1379" x="264.98" y="0" width="357.571" height="358" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset />
              <feGaussianBlur stdDeviation="6" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9665_1379" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9665_1379" result="shape" />
            </filter>
            <filter id="filter3_d_9665_1379" x="0" y="0" width="357.571" height="358" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset />
              <feGaussianBlur stdDeviation="6" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9665_1379" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9665_1379" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Tablet: active card below the diagram */}
      <div className="hidden md:block xl:hidden mt-10">
        <div className={`bg-white rounded-2xl shadow-cmocard flex-col gap-6 py-10 px-7 md:px-14 items-center w-full relative ${openTablet ? 'flex' : 'hidden'}`}>
          <svg
            onClick={() => openTablet && setOpenTablet(false)}
            className="absolute top-5 right-5 cursor-pointer"
            width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.07177 0.000546455L5.50377 5.34455L9.07177 10.5605H7.40777L5.27977 7.44055C4.95977 6.96055 4.62377 6.28855 4.54377 6.11255H4.51177C4.43177 6.28855 4.09577 6.96055 3.75977 7.44055L1.59977 10.5605H-0.000234365L3.53577 5.36055L-0.000234365 0.000546455H1.74377L3.82377 3.28055C4.04777 3.64855 4.43177 4.33655 4.51177 4.52855H4.54377C4.62377 4.33655 5.00777 3.64855 5.24777 3.28055L7.39177 0.000546455H9.07177Z" fill="#474848" />
          </svg>
          <h3 className={`font-stratos ${COPY[activeIndex].color} font-bold text-[2.125rem] uppercase`}>
            {COPY[activeIndex].title}
          </h3>
          <p className={P_STD}>{COPY[activeIndex].copy}</p>
        </div>
      </div>

      {/* Mobile: all cards stacked */}
      <div className="md:hidden flex flex-col gap-4 mt-10">
        {COPY.map((el) => (
          <div key={el.title} className="bg-white rounded-2xl shadow-cmocard flex flex-col gap-6 py-10 px-7 md:px-14 items-center w-full relative">
            <h3 className={`font-stratos ${el.color} font-bold text-[2.125rem] uppercase`}>{el.title}</h3>
            <p className={P_STD}>{el.copy}</p>
          </div>
        ))}
      </div>
    </>
  );
}
