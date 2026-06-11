/**
 * CTA Form — single-step React island
 * Fields: Name, Company, Email, Phone, Company Size, Timing, Needs textarea
 * Replaces Gatsby's FormCTALayout from Forms.js
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

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

  const borderColor = textColor === 'rm-white' || textColor === 'white' ? 'border-white' : 'border-black';
  const txtColor = textColor === 'rm-white' || textColor === 'white' ? 'text-white' : 'text-black';
  const placeholderColor = textColor === 'rm-white' || textColor === 'white' ? 'placeholder:text-white' : 'placeholder:text-black';

  const inputClasses = `font-basic-sans border-b border-solid ${borderColor} min-h-[30px] w-full py-2 bg-transparent ${txtColor} text-[21px] font-light leading-[28px] focus:outline-none ${placeholderColor} placeholder:font-light`;

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

      <span className="mb-6 block md:col-span-1">
        <input {...register('name', { required: true })} type="text" placeholder="Name" className={inputClasses} />
      </span>
      <span className="mb-6 block md:col-span-1">
        <input {...register('company', { required: true })} type="text" placeholder="Company" className={inputClasses} />
      </span>
      <span className="mb-6 block md:col-span-1">
        <input {...register('email', { required: true })} type="email" placeholder="Email" className={inputClasses} />
      </span>
      <span className="mb-6 block md:col-span-1">
        <input {...register('phone', { required: true })} type="tel" placeholder="Phone" className={inputClasses} />
      </span>
      <span className="mb-6 block md:col-span-1">
        <input {...register('companySize', { required: true })} type="text" placeholder="Company Size" className={inputClasses} />
      </span>
      <span className="mb-6 block md:col-span-1">
        <input {...register('timing', { required: true })} type="text" placeholder="Timing for Start" className={inputClasses} />
      </span>
      <span className="block md:col-span-2">
        <textarea {...register('message', { required: true })} placeholder="Tell us about your marketing needs" className={`${inputClasses} min-h-[100px]`} rows={4} />
      </span>

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
