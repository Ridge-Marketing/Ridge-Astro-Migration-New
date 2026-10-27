/**
 * Careers Form — React island
 * Fields: Name, Email, Phone, Position Sought, Portfolio/LinkedIn, Message
 * Replaces Gatsby's FormCareers from Forms.js
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, TextArea } from './FormFields';

interface FormCareersProps {
  classes?: string;
  submitLabel?: string;
  textColor?: string;
}

const btnBase =
  'inline-block text-21px font-stratos uppercase py-3 px-16 text-center font-normal border-2 border-solid transition-all ease-in-out cursor-pointer min-w-[210px]';
const btnStyle =
  'text-rm-black border-rm-green bg-rm-green hover:bg-rm-white hover:text-rm-black hover:border-rm-white';

export default function FormCareers({
  classes = '',
  submitLabel = 'Submit',
  textColor = 'white',
}: FormCareersProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [status, setStatus] = useState<string | false>(false);

  const fieldColor = textColor === 'black' || textColor === 'rm-black' ? 'black' : 'white';

  const onSubmit = async (data: any) => {
    setStatus('processing');
    const message = JSON.stringify(data);

    // type: 'careers' routes the row to the careers tab of the sheet;
    // the resume (if the field ever returns) must not be logged
    const sheetData = { ...data, type: 'careers', source: 'Careers Form' };
    delete sheetData.resume;

    try {
      try {
        await fetch('/api/google-sheet.json', {
          body: JSON.stringify({ message: JSON.stringify(sheetData) }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch (sheetErr) {
        console.warn('[FormCareers] google-sheet logging failed', sheetErr);
      }

      const res = await fetch('/api/sendgrid-careers.json', {
        body: JSON.stringify({
          email: data.email,
          subject: 'New Careers Form Submission',
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
        (window as any).dataLayer.push({ event: 'Careers Form Submission' });
      }
    } catch {
      setStatus('fail-email');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes}>
      {/* Validation errors */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
          {errors.name && <p className="font-basic-sans font-bold text-[21px]">Name is required</p>}
          {errors.email && <p className="font-basic-sans font-bold text-[21px]">Email is required</p>}
          {errors.phone && <p className="font-basic-sans font-bold text-[21px]">Phone is required</p>}
          {errors.position && <p className="font-basic-sans font-bold text-[21px]">Position sought is required</p>}
        </div>
      )}

      {/* Submission error */}
      {status === 'fail-email' && (
        <div className="bg-[#E10000] text-white py-3 px-6 mt-3 mb-6">
          <p className="font-basic-sans font-bold text-[21px]">
            There was an error sending your submission. Please try again. If the issue persists, call us at{' '}
            <a href="tel:908-340-4480" className="underline">908-340-4480</a>.
          </p>
        </div>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="bg-rm-aqua text-white py-3 px-6 mt-3 mb-6">
          <p className="font-basic-sans font-bold text-[21px]">
            Thank you for your submission. We will be in touch with you soon.
          </p>
        </div>
      )}

      {/* Sliding-label fields (Gatsby FormFields); Gatsby wraps each in mb-2 */}
      <span className="block mb-2"><Input register={register} errors={errors} required type="text" name="name" label="Name" textColor={fieldColor} /></span>
      <span className="block mb-2"><Input register={register} errors={errors} required type="email" name="email" label="Email" textColor={fieldColor} /></span>
      <span className="block mb-2"><Input register={register} errors={errors} required type="tel" name="phone" label="Phone" textColor={fieldColor} /></span>
      <span className="block mb-2"><Input register={register} errors={errors} required type="text" name="position" label="Position Sought" textColor={fieldColor} /></span>
      <span className="block mb-2"><Input register={register} errors={errors} type="text" name="portfolio" label="Portfolio or LinkedIn" textColor={fieldColor} /></span>
      <span className="block"><TextArea register={register} errors={errors} name="message" label="What would you bring to the Barn of Brands" textColor={fieldColor} /></span>

      <div className="mt-6">
        <button
          type="submit"
          disabled={status === 'processing'}
          className={`${status === 'processing' ? 'opacity-50' : ''} ${btnBase} ${btnStyle}`}
        >
          {status === 'processing' ? 'Sending...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
