/**
 * AI Audit form (2026) — First/Last Name, Business Email, Website URL.
 * Posts to /api/google-sheet.json (sheet log) then /api/sendgrid-audit.json
 * (email), then redirects to /thank-you-audit/.
 * Replaces Gatsby's FormAudit2026 (Forms.js). Fields use the shared
 * sliding-label Input (FormFields.tsx).
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from './FormFields';

interface FormAudit2026Props {
  classes?: string;
  submitLabel?: string;
  redirectForm?: boolean;
}

// flex (not Gatsby's inline-block + flex): under Tailwind v4 inline-block wins and the arrow wraps
const btnClasses = 'text-21px font-stratos uppercase py-3 px-8 sm:px-16 text-center font-normal border-2 border-solid transition-all ease-in-out text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black cursor-pointer w-max flex flex-nowrap items-center gap-2 group mt-8';

export default function FormAudit2026({
  classes = '',
  submitLabel = 'Submit',
  redirectForm = false,
}: FormAudit2026Props) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [status, setStatus] = useState<string | false>(false);

  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    if (params.get('utm_source')) setValue('urlSource', params.get('utm_source'));
  }, []);

  const onSubmit = async (data: any) => {
    setStatus('processing');
    const message   = JSON.stringify(data);
    const sheetData = { ...data, source: 'AI Audit Form' };

    try {
      // Sheet log first (non-blocking on failure, matching the Gatsby behavior)
      try {
        await fetch('/api/google-sheet.json', {
          body: JSON.stringify({ message: JSON.stringify(sheetData) }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch (sheetErr) {
        console.warn('[FormAudit2026] google-sheet logging failed', sheetErr);
      }

      const res = await fetch('/api/sendgrid-audit.json', {
        body: JSON.stringify({
          email:   data.email,
          subject: 'New Audit Page Submission',
          message,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const { error } = await res.json();
      if (error) {
        setStatus('fail-email');
        return;
      }

      setStatus('success');
      reset();

      if (typeof window !== 'undefined' && (window as any).dataLayer?.push) {
        (window as any).dataLayer.push({ event: 'Audit 2026 Form Submission' });
      }
      if (redirectForm) {
        window.location.href = '/thank-you-audit/';
      }
    } catch (err) {
      console.error('[FormAudit2026] fetch threw', err);
      setStatus('fail-email');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes}>
      {status === 'fail-email' && (
        <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
          <p className="font-basic-sans font-bold text-[21px] leading-[28px]">
            There was an error when emailing your submission. Please try again. If the issue persist, let us know at{' '}
            <a href="tel:908-340-4480">908-340-4480</a>.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-rm-aqua text-white py-3 px-6 mt-3 mb-6">
          <p className="font-basic-sans font-bold text-[21px] leading-[28px]">
            Thank you for your submission. We will be in touch with you shortly.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Input register={register} errors={errors} required type="text" name="firstName" label="First Name" textColor="black" fontWeight="light" />
        <Input register={register} errors={errors} required type="text" name="lastName" label="Last Name" textColor="black" fontWeight="light" />
        <Input register={register} errors={errors} required type="email" name="email" label="Business Email" textColor="black" fontWeight="light" />
        <Input register={register} errors={errors} required type="text" name="website" label="Website URL" textColor="black" fontWeight="light" />
        <input type="hidden" {...register('urlSource')} />
        <div className="mt-4">
          <button
            className={`${status === 'processing' ? 'opacity-80' : ''} ${btnClasses}`}
            type="submit"
            disabled={status === 'processing'}
          >
            {status === 'processing' ? 'Sending...' : submitLabel}
            <svg width="25" height="16" viewBox="0 0 25 16" fill="none" aria-hidden="true">
              <path d="M16.1328 0.21875C16.4062 0 16.7891 0 17.0625 0.21875L24.2812 7.4375C24.5 7.71094 24.5 8.09375 24.2812 8.36719L17.0625 15.5859C16.7891 15.8047 16.4062 15.8047 16.1328 15.5859L15.0391 14.4922C14.8203 14.2188 14.8203 13.8359 15.0938 13.5625L19.4688 9.29688H0.65625C0.273438 9.29688 0 9.02344 0 8.64062V7.10938C0 6.78125 0.273438 6.45312 0.65625 6.45312H19.4688L15.0938 2.24219C14.8203 1.96875 14.8203 1.58594 15.0391 1.3125L16.1328 0.21875Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
