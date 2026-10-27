/**
 * Contact Page Form — 2-step React island
 * Step 1: Name, Company, Email, Phone, Marketing Goals
 * Step 2: Company Size, Company Revenue, Budget
 * Replaces Gatsby's FormContactPage from Forms.js
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, PhoneInput, TextArea, Select } from './FormFields';

interface FormContactPageProps {
  classes?: string;
  submitLabel?: string;
}

const btnBase =
  'inline-block text-21px font-stratos uppercase py-3 px-16 text-center font-normal border-2 border-solid transition-all ease-in-out cursor-pointer min-w-[210px]';
const btnStyle =
  'SOLID_GREEN_HOVER_DARK text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black';

export default function FormContactPage({ classes = '', submitLabel = 'Submit' }: FormContactPageProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [status, setStatus]       = useState<string | false>(false);
  const [step, setStep]           = useState(1);
  const [savedData, setSavedData] = useState<any>({});

  const saveData = (data: any) => {
    console.log('[FormContactPage] saveData called — step 1 valid', { data });
    setStatus('processing');
    setSavedData(data);
    setStep(2);
    setStatus(false);
    console.log('[FormContactPage] advanced to step 2');
  };

  const onSubmit = async (data: any) => {
    console.log('[FormContactPage] onSubmit called — step 2 valid', { data });
    setStatus('processing');
    const allData = { ...savedData, ...data };
    const message = JSON.stringify(allData);
    console.log('[FormContactPage] merged payload', { allData });

    const sheetData = { ...allData, source: 'Contact Page Form' };

    try {
      try {
        await fetch('/api/google-sheet.json', {
          body: JSON.stringify({ message: JSON.stringify(sheetData) }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch (sheetErr) {
        console.warn('[FormContactPage] google-sheet logging failed', sheetErr);
      }

      console.log('[FormContactPage] POST /api/sendgrid-basic-contact.json …');
      const res = await fetch('/api/sendgrid-basic-contact.json', {
        body: JSON.stringify(
          {
            email   : allData.email,
            subject : 'New Contact Form Submission',
            message : message
          }
        ),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
      });
      console.log('[FormContactPage] fetch response', { ok: res.ok, status: res.status });

      const json = await res.json();
      console.log('[FormContactPage] response body', json);
      const { error } = json;
      if (error) {
        console.warn('[FormContactPage] API returned error', error);
        setStatus('fail-email');
        return;
      }

      console.log('[FormContactPage] success — resetting form');
      setStatus('success');
      reset();
      setStep(1);

      if (typeof window !== 'undefined' && (window as any).dataLayer?.push) {
        console.log('[FormContactPage] pushing dataLayer event');
        (window as any).dataLayer.push({ event: 'Contact Form Submission' });
      }
    } catch (err) {
      console.error('[FormContactPage] fetch threw', err);
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
        <form
          onSubmit={handleSubmit(
            saveData,
            (errs) => console.warn('[FormContactPage] step 1 validation blocked submit', errs)
          )}
          className={classes}
        >
          {Object.keys(errors).length > 0 && (
            <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
              {errors.name && <p className="font-bold">Name is required</p>}
              {errors.company && <p className="font-bold">Company is required</p>}
              {errors.email && <p className="font-bold">Email is required</p>}
              {errors.phone && <p className="font-bold">Phone is required</p>}
              {errors.message && <p className="font-bold">Marketing goals is required</p>}
            </div>
          )}
          {/* Sliding-label fields (Gatsby FormFields) */}
          <span className="mb-6 block"><Input register={register} errors={errors} required type="text" name="name" label="Name" textColor="black" /></span>
          <span className="mb-6 block"><Input register={register} errors={errors} required type="text" name="company" label="Company" textColor="black" /></span>
          <span className="mb-6 block"><Input register={register} errors={errors} required type="email" name="email" label="Email" textColor="black" /></span>
          <span className="mb-6 block"><PhoneInput register={register} errors={errors} required name="phone" label="Phone" textColor="black" /></span>
          <span className="mb-6 block"><TextArea register={register} errors={errors} required name="message" label="What are your marketing goals?" textColor="black" /></span>
          <div className="mt-6">
            <button
              className={`${status === 'processing' ? 'opacity-80' : ''} ${btnBase} ${btnStyle}`}
              type="submit"
              disabled={status === 'processing'}
            >
              {status === 'processing' ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleSubmit(
            onSubmit,
            (errs) => console.warn('[FormContactPage] step 2 validation blocked submit', errs)
          )}
          className={classes}
        >
          {Object.keys(errors).length > 0 && (
            <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
              {errors.companySize && <p className="font-bold">Company Size is required</p>}
              {errors.companyRevenue && <p className="font-bold">Company Revenue is required</p>}
              {errors.budget && <p className="font-bold">Budget is required</p>}
            </div>
          )}
          <span className="mb-6 block"><Select register={register} errors={errors} required name="companySize" label="Company Size" options={['< 10 Employees', '10-50 Employees', '50-250 Employees', '250+ Employees']} textColor="black" fontWeight="light" /></span>
          <span className="mb-6 block"><Select register={register} errors={errors} required name="companyRevenue" label="Company Revenue" options={['Less than $5M', '$5M-$50M', '$50M-250M', '$250M-$1B', '$1B+']} textColor="black" fontWeight="light" /></span>
          <span className="mb-6 block"><Input register={register} errors={errors} required type="text" name="budget" label="Budget" textColor="black" /></span>
          <div className="mt-6">
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
