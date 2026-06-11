/**
 * PPC Hero quick form — React island (mobile CMO hero callout)
 * Name + email → /api/google-sheet.json + /api/sendgrid-ppc-hero.json
 * Replaces the inline form in Gatsby's ppcLander/PpcHeroCmo.js
 */
import { useState } from 'react';

interface Props {
  buttonLabel?: string;
}

const inputClasses =
  'font-basic-sans font-light text-21px leading-28px placeholder:text-black w-full text-center text-black rounded-xl border-solid border-2 border-[#A7A7A7] max-w-[715px] min-h-[60px] mx-auto';

const buttonClasses =
  'border-white border border-solid inline-block text-21px font-stratos uppercase py-3 px-16 text-center font-normal border-2 transition-all ease-in-out text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black after:transition-all after:ease-out after:inline-block after:bg-contain after:bg-center after:bg-no-repeat after:w-[20px] after:h-[20px] after:ml-2 hover:after:translate-x-2 after:bg-[url("/images/arrow-right-black.svg")] hover:after:bg-[url("/images/arrow-right-white.svg")] !inline-flex items-center cursor-pointer min-w-[210px] disabled:opacity-60';

export default function PpcHeroQuickForm({ buttonLabel = 'Get a Quote' }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name     = (formData.get('name') as string) || '';
    const email    = (formData.get('email') as string) || '';

    if (!email) return;
    setStatus('processing');

    const message = JSON.stringify({ name, email, source: 'B2B Hero Top Form' });

    try {
      try {
        await fetch('/api/google-sheet.json', {
          body: JSON.stringify({ message }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch (sheetErr) {
        console.warn('[PpcHeroQuickForm] google-sheet logging failed', sheetErr);
      }

      const res = await fetch('/api/sendgrid-ppc-hero.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject: `Ridge PPC Hero Lead - ${name || 'Unknown'}`,
          message,
        }),
      });
      const { error } = await res.json();
      if (error) {
        setStatus('fail');
        return;
      }
      setStatus('success');
    } catch {
      setStatus('fail');
    }
  };

  if (status === 'success') {
    return (
      <p className="font-basic-sans font-light text-21px leading-28px text-black">
        Thanks — we'll be in touch shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full">
      <input name="name" placeholder="Your Name" type="text" className={inputClasses} />
      <input name="email" required placeholder="Your Business Email" type="email" className={inputClasses} />
      <button type="submit" disabled={status === 'processing'} className={buttonClasses}>
        {status === 'processing' ? 'Sending…' : buttonLabel}
      </button>
      {status === 'fail' && (
        <p className="font-basic-sans font-light text-21px leading-28px text-red-700">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
