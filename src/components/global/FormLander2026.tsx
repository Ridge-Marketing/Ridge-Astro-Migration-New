/**
 * 2026 PPC Lander Form — 2-step React island
 * Step 1: Name, Company, Email, Phone
 * Step 2: Company Size, Company Revenue, Interests (checkboxes), Marketing Goals
 * Posts to /api/google-sheet (sheet log) then /api/sendgrid-landers (email),
 * then redirects to the thank-you page.
 * Replaces Gatsby's FormLander2026 from Forms.js
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, PhoneInput, TextArea, Select, CheckboxGroup } from './FormFields';

interface FormLander2026Props {
  classes?: string;
  submitLabel?: string;
  btnContainerClasses?: string;
  redirectForm?: boolean;
}

const INTERESTS = [
  'Branding',
  'Marketing Strategy & Messaging',
  'Website Design & Development',
  'Content Marketing',
  'AI Search Marketing',
  'Digital & PPC Advertising',
  'Social Media Support',
  'Video Production',
];

const btnBase =
  'inline-block text-21px font-stratos uppercase py-3 px-16 text-center font-normal border-2 border-solid transition-all ease-in-out cursor-pointer min-w-[210px]';
const btnStyle =
  'text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black';

export default function FormLander2026({
  classes = '',
  submitLabel = 'Submit',
  btnContainerClasses = '',
  redirectForm = true,
}: FormLander2026Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  // Hero email capture can prefill these; keep their labels lifted when it does
  const prefilledName  = !!watch('name');
  const prefilledEmail = !!watch('email');
  const [status, setStatus]       = useState<string | false>(false);
  const [step, setStep]           = useState(1);
  const [savedData, setSavedData] = useState<any>({});

  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    if (params.get('utm_source')) {
      setValue('urlSource', params.get('utm_source'));
    }
  }, []);

  // Pre-fill from the CMO hero email capture (sessionStorage covers the case
  // where the hero island wrote it before this island hydrated)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ppcPersistEmail');
      if (stored) setValue('email', stored);
    } catch {}

    const onPrefill = (e: Event) => {
      const { email, name } = (e as CustomEvent).detail || {};
      if (email) setValue('email', email);
      if (name) setValue('name', name);
    };
    window.addEventListener('ppc-prefill', onPrefill);
    return () => window.removeEventListener('ppc-prefill', onPrefill);
  }, []);

  const saveData = (data: any) => {
    setStatus('processing');
    setSavedData(data);
    setStep(2);
    setStatus(false);
  };

  const onSubmit = async (data: any) => {
    setStatus('processing');
    const allData   = { ...savedData, ...data };
    const message   = JSON.stringify(allData);
    const sheetData = { ...allData, source: '2026 PPC Lander Form' };

    try {
      // Sheet log first (non-blocking on failure, matching the Gatsby behavior)
      try {
        await fetch('/api/google-sheet.json', {
          body: JSON.stringify({ message: JSON.stringify(sheetData) }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch (sheetErr) {
        console.warn('[FormLander2026] google-sheet logging failed', sheetErr);
      }

      const res = await fetch('/api/sendgrid-landers.json', {
        body: JSON.stringify({
          email:   allData.email,
          subject: 'New 2026 PPC Page Submission',
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
      setStep(1);

      if (typeof window !== 'undefined' && (window as any).dataLayer?.push) {
        (window as any).dataLayer.push({ event: 'PPC 2026 Form Submission' });
      }
      if (redirectForm) {
        window.location.href = '/thank-you-marketing-dream/';
      }
    } catch (err) {
      console.error('[FormLander2026] fetch threw', err);
      setStatus('fail-email');
    }
  };

  return (
    <>
      {status === 'fail-email' && (
        <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
          <p className="font-basic-sans font-bold text-[21px] leading-[28px]">
            There was an error when emailing your submission. Please try again. If the issue persists, let us know at{' '}
            <a href="tel:908-340-4480">908-340-4480</a>.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-rm-aqua text-white py-3 px-6 mt-3 mb-6">
          <p className="font-basic-sans font-bold text-[21px] leading-[28px]">
            Thank you for your submission. We will be in touch with you soon.
          </p>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit(saveData)} className={classes}>
          {Object.keys(errors).length > 0 && (
            <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
              {errors.name && <p className="font-bold">Full Name is required</p>}
              {errors.company && <p className="font-bold">Company is required</p>}
              {errors.email && <p className="font-bold">Email is required</p>}
              {errors.phone && <p className="font-bold">Phone is required</p>}
            </div>
          )}
          <div className="flex flex-wrap xl:gap-x-7">
            {/* Sliding-label fields (Gatsby FormFields, boxed white style) */}
            <span className="block w-full xl:w-[calc(50%-28px)]"><Input bg="white" register={register} errors={errors} required type="text" name="name" label="Full Name" textColor="black" fontWeight="light" filled={prefilledName} /></span>
            <span className="block w-full xl:w-[calc(50%-28px)]"><Input bg="white" register={register} errors={errors} required type="text" name="company" label="Company" textColor="black" fontWeight="light" /></span>
            <span className="block w-full xl:w-[calc(50%-28px)]"><Input bg="white" register={register} errors={errors} required type="email" name="email" label="Email" textColor="black" fontWeight="light" filled={prefilledEmail} /></span>
            <span className="block w-full xl:w-[calc(50%-28px)]"><PhoneInput bg="white" register={register} errors={errors} required name="phone" label="Phone" textColor="black" fontWeight="light" /></span>
            <div className={`mt-10 mx-auto xl:ml-0 ${btnContainerClasses}`}>
              <button
                className={`${status === 'processing' ? 'opacity-80' : ''} ${btnBase} ${btnStyle}`}
                type="submit"
                disabled={status === 'processing'}
              >
                {status === 'processing' ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className={classes}>
          {Object.keys(errors).length > 0 && (
            <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
              {errors.companySize && <p className="font-bold">Company Size is required</p>}
              {errors.companyRevenue && <p className="font-bold">Company Revenue is required</p>}
              {errors.interests && <p className="font-bold">Please select at least one interest</p>}
              {errors.message && <p className="font-bold">Marketing goals is required</p>}
            </div>
          )}
          <span className="mb-6 block"><Select bg="white" register={register} errors={errors} required name="companySize" label="Company Size" options={['< 10 Employees', '10-50 Employees', '50-250 Employees', '250+ Employees']} textColor="black" fontWeight="light" /></span>
          <span className="mb-6 block"><Select bg="white" register={register} errors={errors} required name="companyRevenue" label="Company Revenue" options={['< $10M', '$10M-$50M', '$50M-$1B', '$1B+']} textColor="black" fontWeight="light" /></span>
          <span className="mb-6 block"><CheckboxGroup bg="white" register={register} errors={errors} required name="interests" label="What are you interested in? (Select all that apply)" options={INTERESTS} textColor="black" fontWeight="light" /></span>
          <span className="mb-6 block"><TextArea bg="white" register={register} errors={errors} required name="message" label="Tell us about your marketing goals" textColor="black" fontWeight="light" /></span>
          <input type="hidden" {...register('urlSource')} />
          <div className={`mt-10 ${btnContainerClasses}`}>
            <button
              className={`${status === 'processing' ? 'opacity-80' : ''} ${btnBase} ${btnStyle}`}
              type="submit"
              disabled={status === 'processing'}
            >
              {status === 'processing' ? 'Sending...' : submitLabel}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
