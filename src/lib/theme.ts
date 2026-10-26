/**
 * Design tokens and class utilities
 * Migrated from src/static/theme.js — no React dependency
 */

export const theme = {
  text: {
    HERO: 'font-stratos uppercase font-bold text-50px sm:text-60px lg:text-100px leading-H1-m lg:leading-[4.75rem] ',
    PAGE_HEADER: 'font-stratos uppercase font-bold text-60px md:text-80px leading-[60px] xl:text-100px xl:leading-[76px] ',
    H1_STD: 'font-stratos uppercase font-bold text-60px lg:text-80px leading-H1-m lg:leading-H1 ',
    H1_LTE: 'font-stratos-lights uppercase text-60px lg:text-80px leading-H1-m lg:leading-H1 ',
    H2: 'font-stratos uppercase font-bold text-50px leading-H2-H3 ',
    H3: 'font-basic-sans font-semibold text-50px leading-H2-H3 ',
    H4: 'font-basic-sans font-semibold text-26px leading-30px ',
    H4_LTE: 'font-basic-sans font-light text-26px leading-36px ',
    H5: 'font-stratos uppercase font-bold text-40px leading-44px ',
    P_STD: 'font-basic-sans font-light text-21px leading-28px ',
    P_BLD: 'font-basic-sans font-bold text-21px leading-28px ',
    P_SML: 'font-basic-sans font-light text-16px leading-23px ',
    LINK: 'font-basic-sans font-light underline text-21px leading-28px ',
    FOOTER: 'font-basic-sans font-normal text-18px leading-26px ',
    Q: 'font-basic-sans italic font-normal text-30px lg:text-40px leading-36px lg:leading-44px ',
    PULL_Q: 'font-basic-sans italic font-semibold text-30px lg:text-55px leading-36px lg:leading-PULL-Q ',
    STATS: 'font-stratos uppercase font-bold text-120px lg:text-160px leading-120px lg:leading-160px ',
    CIRCLE_NUM: 'font-stratos font-bold text-45px leading-26px flex items-center justify-center border-solid border-[3px] rounded-full ',
  },

  button: {
    BASE_STYLING: 'inline-block text-21px font-stratos uppercase py-3 px-8 sm:px-16 text-center font-normal border-2 border-solid transition-all ease-in-out ',

    GHOST_GREEN_HOVER_DARK: 'GHOST_GREEN_HOVER_DARK text-rm-black border-rm-green bg-white hover:bg-rm-green ',
    GHOST_GREEN_HOVER_LIGHT: 'GHOST_GREEN_HOVER_LIGHT text-rm-white border-rm-green bg-rm-black hover:bg-rm-green hover:text-rm-black ',
    GHOST_GREEN_TRANSPARENT: 'GHOST_GREEN_TRANSPARENT text-rm-black border-rm-green bg-transparent hover:bg-rm-green hover:text-rm-black ',
    GHOST_GREEN_TRANSPARENT_W: 'GHOST_GREEN_TRANSPARENT text-rm-white border-rm-green bg-transparent hover:bg-rm-green hover:text-rm-white ',

    SOLID_GREEN_HOVER_LIGHT: 'SOLID_GREEN_HOVER_LIGHT text-rm-black border-rm-green bg-rm-green hover:bg-rm-white hover:text-rm-black hover:border-rm-white ',
    SOLID_GREEN_HOVER_DARK: 'SOLID_GREEN_HOVER_DARK text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black ',

    SOLID_BLACK_HOVER_DARK: 'SOLID_BLACK_HOVER_LIGHT text-rm-white border-rm-black bg-rm-black hover:bg-rm-green hover:text-rm-black hover:border-rm-green ',

    SOLID_WHITE_HOVER_DARK: 'SOLID_WHITE_HOVER_DARK text-rm-black border-rm-white bg-rm-white hover:bg-rm-black hover:text-rm-white hover:border-rm-black ',
    SOLID_WHITE_HOVER_LIGHT: 'SOLID_WHITE_HOVER_LIGHT text-rm-black border-rm-white bg-rm-white hover:bg-rm-black hover:text-rm-white hover:border-rm-black ',

    GHOST_WHITE_HOVER_LIGHT: 'GHOST_WHITE_HOVER_LIGHT text-rm-white border-rm-white hover:bg-rm-green hover:text-rm-black hover:border-rm-green',
    GHOST_WHITE_HOVER_DARK: 'GHOST_WHITE_HOVER_DARK text-rm-black border-rm-white bg-rm-white hover:bg-rm-green hover:text-rm-black hover:border-rm-green',

    GHOST_GREEN_GREY_HOVER_DARK: 'GHOST_GREEN_HOVER_DARK text-rm-black border-rm-green bg-rm-pale-grey hover:bg-rm-green ',
    GHOST_GREEN_GREY_HOVER_LIGHT: 'GHOST_GREEN_HOVER_LIGHT text-rm-white border-rm-green bg-rm-pale-grey hover:bg-rm-green hover:text-rm-black ',

    GHOST_TRANSPARENT_WHITE: 'GHOST_TRANSPARENT_WHITE text-rm-white border-rm-white bg-transparent hover:bg-white hover:text-black',
  } as Record<string, string>,

  text_links: {
    BASE_STYLING: 'flex items-center font-stratos uppercase ',
    FWD_BASE: 'after:transition-all after:ease-out after:inline-block after:bg-contain after:bg-center after:bg-no-repeat after:w-[20px] after:h-[20px] after:ml-2 hover:after:translate-x-2 ',
    BACK_BASE: 'before:transition-all before:ease-out before:inline-block before:bg-contain before:bg-center before:bg-no-repeat before:w-[20px] before:h-[20px] before:mr-2 hover:before:-translate-x-2 ',

    STD: 'text-21px ',
    LARGE: 'text-40px after:w-[40px] before:w-[40px] ',

    HOVER_WHITE: ' hover:underline hover:text-white ',
    HOVER_GREEN: ' hover:underline hover:text-rm-green ',

    ARW_FWD_WHITE: 'before:hidden after:bg-[url("/images/arrow-right-white.svg")] ',
    ARW_FWD_GREY: 'before:hidden after:bg-[url("/images/arrow-right-grey.svg")] hover:after:bg-[url("/images/arrow-right-white.svg")] ',
    ARW_FWD_BLACK: 'before:hidden after:bg-[url("/images/arrow-right-black.svg")] ',
    ARW_FWD_GREEN: 'before:hidden after:bg-[url("/images/arrow-right-green.svg")] ',
    ARW_BACK_GREEN: 'after:hidden before:bg-[url("/images/arrow-left-green.svg")] ',
    HOVER_ARW_FWD_WHITE: ' hover:after:bg-[url("/images/arrow-right-white.svg")] ',
    HOVER_ARW_FWD_GREEN: ' hover:after:bg-[url("/images/arrow-right-green.svg")] ',
    HOVER_ARW_FWD_BLACK: ' hover:after:bg-[url("/images/arrow-right-black.svg")] ',
  },

  forms: {
    INPUT: 'font-basic-sans border-b border-solid min-h-[30px] ',
    LABEL: '',
    CONTAINER: 'form-group w-full lg:w-[48%] font-basic-san w-full flex flex-col mb-6 ',

    BASE_STYLING: '',
    HALF: 'form-one-col w-full xl:w-[45%] xl:ml-[5%] xl:mr-[5%] flex-col',
    HALF_PADDING: 'p-8 lg:p-16',
    FULL_DISPLAY: 'form-two-col mt-20 ml-auto mr-auto w-full lg:w-3/4 flex flex-row justify-around flex-wrap',
    NO_WRAP: 'form-one-col w-full flex-col',
    NO_WRAP_PADDING: 'py-8',
  },

  paddingTop: {
    standard: 'pt-20',
    none: 'pt-0',
    header: 'pt-20',
    custom: '',
  } as Record<string, string>,

  paddingBottom: {
    standard: 'pb-20',
    none: 'pb-0',
    footer: 'pb-24',
    custom: '',
  } as Record<string, string>,

  backgroundColor: {
    black: 'black text-white',
    white: 'white',
    paleGrey: 'rm-pale-grey',
    darkGrey: 'rm-dark-grey',
    paleTeal: 'rm-pale-teal',
    transparent: 'transparent',
    whiteToBlack: 'white-black',
  } as Record<string, string>,

  containers: {
    standard: {
      sm: '640px',
      md: '700px',
      lg: '930px',
      xl: '1280px',
      xlz: '1280px',
      '2xl': '1280px',
    },
    slim: {
      sm: '640px',
      md: '700px',
      lg: '930px',
      xl: '1120px',
      '2xl': '1120px',
    },
  },

  colors: {
    primary: {
      accent: '#A9CF38',
    },
    secondary: {
      accent: '#000000',
    },
  },
};
