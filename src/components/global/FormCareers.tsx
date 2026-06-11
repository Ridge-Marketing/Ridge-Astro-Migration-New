/**
 * Careers Form — React island
 * Fields: Name, Email, Phone, Position Sought, Portfolio/LinkedIn, Message
 * Replaces Gatsby's FormCareers from Forms.js
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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

  const isLight = textColor === 'white' || textColor === 'rm-white';
  const borderCol = isLight ? 'border-white' : 'border-black';
  const txtCol = isLight ? 'text-white' : 'text-black';
  const placeholderCol = isLight ? 'placeholder:text-white' : 'placeholder:text-black';

  const inputClasses = `font-basic-sans border-b border-solid ${borderCol} min-h-[30px] w-full py-2 bg-transparent ${txtCol} text-[21px] font-light leading-[28px] focus:outline-none ${placeholderCol} placeholder:font-light`;

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

      <span className="block mb-6">
        <input
          {...register('name', { required: true })}
          type="text"
          placeholder="Name"
          className={inputClasses}
        />
      </span>
      <span className="block mb-6">
        <input
          {...register('email', { required: true })}
          type="email"
          placeholder="Email"
          className={inputClasses}
        />
      </span>
      <span className="block mb-6">
        <input
          {...register('phone', { required: true })}
          type="tel"
          placeholder="Phone"
          className={inputClasses}
        />
      </span>
      <span className="block mb-6">
        <input
          {...register('position', { required: true })}
          type="text"
          placeholder="Position Sought"
          className={inputClasses}
        />
      </span>
      <span className="block mb-6">
        <input
          {...register('portfolio')}
          type="text"
          placeholder="Portfolio or LinkedIn"
          className={inputClasses}
        />
      </span>
      <span className="block mb-6">
        <textarea
          {...register('message')}
          placeholder="What would you bring to the Barn of Brands?"
          className={`${inputClasses} min-h-[100px]`}
          rows={4}
        />
      </span>

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
