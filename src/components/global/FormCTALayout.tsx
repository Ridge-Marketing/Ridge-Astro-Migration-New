/**
 * CTA Form — single-step React island
 * Fields: Name, Company, Email, Phone, Company Size, Timing, Needs textarea
 * Replaces Gatsby's FormCTALayout from Forms.js
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, TextArea } from './FormFields';

interface FormCTALayoutProps {
  classes?: string;
  submitLabel?: string;
  btnStyle?: string;
  textColor?: string;
  bgColor?: string;
}

const btnBase =
  'inline-block text-21px font-stratos uppercase py-3 px-16 text-center font-normal border-2 border-solid transition-all ease-in-out cursor-pointer min-w-[210px]';

const btnStyles: Record<string, string> = {
  SOLID_GREEN_HOVER_DARK: 'text-rm-black border-rm-green bg-rm-green hover:bg-rm-black hover:text-rm-white hover:border-rm-black',
  SOLID_GREEN_HOVER_LIGHT: 'text-rm-black border-rm-green bg-rm-green hover:bg-rm-white hover:text-rm-black hover:border-rm-white',
};

export default function FormCTALayout({
  classes = '',
  submitLabel = 'Submit',
  btnStyle = 'SOLID_GREEN_HOVER_DARK',
  textColor = 'black',
  bgColor = 'white',
}: FormCTALayoutProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [status, setStatus] = useState<string | false>(false);

  const fieldColor = textColor === 'rm-white' || textColor === 'white' ? 'white' : 'black';

  const onSubmit = async (data: any) => {
    setStatus('processing');
    const message   = JSON.stringify(data);
    const sheetData = { ...data, source: 'CTA Form' };

    try {
      try {
        await fetch('/api/google-sheet.json', {
          body: JSON.stringify({ message: JSON.stringify(sheetData) }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch (sheetErr) {
        console.warn('[FormCTALayout] google-sheet logging failed', sheetErr);
      }

      const res = await fetch('/api/sendgrid-cta-contact.json', {
        body: JSON.stringify({ email: data.email, subject: 'New CTA Form Submission', message }),
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
        (window as any).dataLayer.push({ event: 'CTA Form Submission' });
      }
    } catch {
      setStatus('fail-email');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes}>
      <div className="md:col-span-2">
        {Object.keys(errors).length > 0 && (
          <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
            {errors.name && <p className="font-bold">Name is required</p>}
            {errors.company && <p className="font-bold">Company is required</p>}
            {errors.email && <p className="font-bold">Email is required</p>}
            {errors.phone && <p className="font-bold">Phone is required</p>}
            {errors.companySize && <p className="font-bold">Company Size is required</p>}
            {errors.timing && <p className="font-bold">Timing is required</p>}
            {errors.message && <p className="font-bold">Message is required</p>}
          </div>
        )}

        {status === 'fail-email' && (
          <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
            <p className="font-bold">
              There was an error when emailing your submission. Please try again. If the issue persists, let us know at{' '}
              <a href="tel:908-340-4480">908-340-4480</a>.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-rm-aqua text-white py-3 px-6 mt-3 mb-6">
            <p className="font-bold">Thank you for your submission. We will be in touch with you soon.</p>
          </div>
        )}
      </div>

      {/* Sliding-label fields (Gatsby FormFields) */}
      <span className="mb-6 block md:col-span-1"><Input register={register} errors={errors} required type="text" name="name" label="Name" textColor={fieldColor} /></span>
      <span className="mb-6 block md:col-span-1"><Input register={register} errors={errors} required type="text" name="company" label="Company" textColor={fieldColor} /></span>
      <span className="mb-6 block md:col-span-1"><Input register={register} errors={errors} required type="email" name="email" label="Email" textColor={fieldColor} /></span>
      <span className="mb-6 block md:col-span-1"><Input register={register} errors={errors} required type="tel" name="phone" label="Phone" textColor={fieldColor} /></span>
      <span className="mb-6 block md:col-span-1"><Input register={register} errors={errors} required type="text" name="companySize" label="Company Size" textColor={fieldColor} /></span>
      <span className="mb-6 block md:col-span-1"><Input register={register} errors={errors} required type="text" name="timing" label="Timing for Start" textColor={fieldColor} /></span>
      <span className="block md:col-span-2"><TextArea register={register} errors={errors} required name="message" label="Tell us about your marketing needs" textColor={fieldColor} /></span>

      <div className={`mt-6 md:col-span-2 text-center`}>
        <button
          className={`${status === 'processing' ? 'opacity-50' : ''} ${btnBase} ${btnStyles[btnStyle] || btnStyles['SOLID_GREEN_HOVER_DARK']}`}
          type="submit"
          disabled={status === 'processing'}
        >
          {status === 'processing' ? 'Sending...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
