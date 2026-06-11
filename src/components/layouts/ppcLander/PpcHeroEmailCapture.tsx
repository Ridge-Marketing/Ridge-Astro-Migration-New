/**
 * Desktop CMO hero callout email capture — React island.
 * On blur, persists the email (sessionStorage + custom event) so the main
 * lander form (FormLander2026) pre-fills it; the CTA just links to #form.
 * Replaces the persistantEmail handoff from Gatsby's PpcHeroCmoDesktop.js
 */

interface Props {
  buttonLabel?: string;
  buttonUrl?: string;
}

const inputClasses =
  'font-basic-sans font-light text-21px leading-28px w-full text-center text-black rounded-xl border-solid border-4 border-[#D9D9D9] max-w-[715px] min-h-[60px] mx-auto bg-white';

const buttonClasses =
  'inline-block text-21px font-stratos uppercase py-3 px-16 text-center font-normal border-2 border-solid transition-all ease-in-out text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black after:transition-all after:ease-out after:inline-block after:bg-contain after:bg-center after:bg-no-repeat after:w-[20px] after:h-[20px] after:ml-2 hover:after:translate-x-2 after:bg-[url("/images/arrow-right-black.svg")] hover:after:bg-[url("/images/arrow-right-white.svg")] !inline-flex items-center cursor-pointer min-w-[210px]';

export default function PpcHeroEmailCapture({ buttonLabel = 'Get a Quote', buttonUrl = '#form' }: Props) {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (!email) return;
    try {
      sessionStorage.setItem('ppcPersistEmail', email);
    } catch {}
    window.dispatchEvent(new CustomEvent('ppc-prefill', { detail: { email } }));
  };

  return (
    <>
      <input onBlur={handleBlur} placeholder="Your Business Email" type="email" className={inputClasses} />
      <a className={buttonClasses} href={buttonUrl}>
        {buttonLabel}
      </a>
    </>
  );
}
