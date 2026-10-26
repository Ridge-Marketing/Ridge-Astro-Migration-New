/**
 * SEO Popup modal — 3-step flow: info → form → thank you
 * Replaces Gatsby's SeoPopup.js
 * Loaded via client-side script on the seo-vs-aeo-vs-geo post only
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  firstName : string;
  lastName  : string;
  email     : string;
  website   : string;
}

export default function SeoPopup() {
  const [isClient, setIsClient] = useState(false);
  const [viewed, setViewed]     = useState(false);
  const [step, setStep]         = useState(1);
  const [status, setStatus]     = useState<'idle' | 'processing' | 'success' | 'fail'>('idle');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
      if (typeof localStorage !== 'undefined') {
        const hasViewed = localStorage.getItem('SeoPopup_VIEWED');
        if (hasViewed === 'true') {
          setViewed(true);
        }
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: FormData) => {
    setStatus('processing');
    try {
      const message = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        website: data.website,
      };

      // name + source follow the PpcHeroCmo quick-form convention so the
      // row is identifiable in the sheet's main columns
      const sheetData = {
        ...message,
        name:   `${data.firstName} ${data.lastName}`.trim(),
        source: 'SEO Popup',
      };
      try {
        await fetch('/api/google-sheet.json', {
          body: JSON.stringify({ message: JSON.stringify(sheetData) }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch (sheetErr) {
        console.warn('[SeoPopup] google-sheet logging failed', sheetErr);
      }

      const res = await fetch('/api/sendgrid-seo-popup.json', {
        body: JSON.stringify({
          email: data.email,
          message: JSON.stringify(message),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (res.ok) {
        setStatus('success');
        setStep(3);
      } else {
        setStatus('fail');
      }
    } catch (error) {
      console.log('Error:', error);
      setStatus('fail');
    }
  };

  const closeModal = () => {
    localStorage.setItem('SeoPopup_VIEWED', 'true');
    setViewed(true);
  };

  if (!isClient || viewed) return null;

  const inputClasses =
    "w-full border border-gray-300 border-b-black px-4 py-3 text-black font-basic-sans text-[21px] font-normal leading-[28px] focus:outline-none focus:border-[#1F9DA5] placeholder:text-black placeholder:font-basic-sans placeholder:text-[21px] placeholder:font-normal placeholder:leading-[28px]";

  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center p-8 z-[9999]">
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30" />

      <div className="sm:h-auto md:h-full md:max-h-[576px] overflow-y-auto relative bg-white w-full max-w-prose rounded shadow flex flex-col gap-4 justify-start">
        <button
          type="button"
          onClick={closeModal}
          className="px-1.5 py-[0.5] absolute top-4 right-4 z-10 text-white border-2 border-white text-xl font-bold"
        >
          x
        </button>

        {step === 1 && (
          <>
            <div className="bg-[#1F9DA5] py-8 px-[3.5rem] flex items-center justify-center md:justify-start">
              <h2 className="text-[26px] text-white text-center">
                How Does Your Website Perform?
              </h2>
            </div>
            <div className="px-[3.5rem] text-center md:text-left">
              <p className="text-black font-basic text-[26px] font-semibold leading-[30px]">
                Book a low-cost
              </p>
              <p className="text-black font-['Stratos'] text-[50px] font-semibold leading-[99.5%] uppercase">
                SEO/AEO Website Audit
              </p>
              <p className="text-black font-basic-sans text-[26px] font-semibold leading-[30px]">
                and find out...
              </p>
              <ul className="flex flex-col gap-1 items-center md:items-start">
                {[
                  'How does your site perform in search?',
                  'Which AI platforms reference your site?',
                  'What questions do prospects ask to find you?',
                  'How can you raise your visibility in AI search?',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 pt-4">
                    <span className="text-[#A9CF38] text-[22px]">&rarr;</span>
                    <span className="text-[21px] leading-[34px] font-light text-left">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="border-2 border-[#A9CF38] bg-transparent text-black font-['Stratos'] text-[21px] font-normal leading-[28px] uppercase px-6 py-3 mt-8 hover:bg-[#A9CF38] hover:bg-opacity-10 w-full md:w-[44%]"
              >
                Yes, I'm interested
              </button>
            </div>
            <div className="flex justify-center md:block">
              <img
                src="/wp-content/uploads/2026/01/Dashboard-Edited-FULL.png"
                alt=""
                className="w-72 pb-8 block md:hidden"
              />
              <img
                src="/wp-content/uploads/2026/01/AI-Dashboard-Cropped.webp"
                alt=""
                className="w-72 hidden md:block md:absolute md:bottom-0 md:right-0"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="bg-[#1F9DA5] py-8 px-[3.5rem] flex items-center justify-center md:justify-start">
              <h2 className="text-[26px] text-white text-center">
                How Does Your Website Perform?
              </h2>
            </div>
            <div className="px-[3.5rem] text-center md:text-left">
              <p className="text-black font-basic text-[26px] font-semibold leading-[30px]">
                Book a low-cost
              </p>
              <p className="text-black font-['Stratos'] text-[50px] font-semibold leading-[99.5%] uppercase">
                SEO/AEO Website Audit
              </p>
              <p className="text-black font-basic-sans text-[21px] font-light leading-[24px] pt-4">
                Give us some basic information and we'll reach out to customize our audit
                to your goals.
              </p>
              <form className="mt-6 space-y-4 sm:pb-8 md:pb-0" onSubmit={handleSubmit(onSubmit)}>
                {errors && Object.keys(errors).length > 0 && (
                  <div className="bg-[#E10000] text-white py-3 px-6 mb-4 text-left">
                    {errors.firstName && <p className="font-semibold">First Name is required</p>}
                    {errors.lastName && <p className="font-semibold">Last Name is required</p>}
                    {errors.email && <p className="font-semibold">Email is required</p>}
                    {errors.website && <p className="font-semibold">Website URL is required</p>}
                  </div>
                )}
                {status === 'fail' && (
                  <div className="bg-[#E10000] text-white py-3 px-6 mb-4 text-left">
                    <p className="font-semibold">
                      There was an error submitting the form. Please try again.
                    </p>
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                  <input
                    type="text"
                    {...register('firstName', { required: true })}
                    className={inputClasses}
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    {...register('lastName', { required: true })}
                    className={inputClasses}
                    placeholder="Last Name"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                  <input
                    type="email"
                    {...register('email', { required: true })}
                    className={`${inputClasses} md:w-1/2`}
                    placeholder="Business Email"
                  />
                  <input
                    type="text"
                    {...register('website', { required: true })}
                    className={`${inputClasses} md:w-1/2`}
                    placeholder="Website URL"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'processing'}
                  className={`${status === 'processing' ? 'opacity-80' : ''} bg-[#A9CF38] text-black font-['Stratos'] text-[21px] font-normal leading-[28px] uppercase px-6 py-4 mt-4 hover:bg-[#A9CF38] hover:bg-opacity-10 w-full md:w-1/3`}
                >
                  {status === 'processing' ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="bg-[#1F9DA5] py-8 px-[3.5rem] flex items-center justify-start">
              <h2 className="text-[26px] text-white text-center">
                How Does Your Website Perform?
              </h2>
            </div>
            <div className="px-[3.5rem]">
              <p className="text-black font-basic-sans text-[21px] font-light leading-[24px] pt-8">
                Thanks... we'll reach out to set up your SEO-AEO audit very soon!
              </p>
              <button
                type="button"
                onClick={closeModal}
                className="mb-12 md:mb-0 border-2 border-[#A9CF38] bg-transparent text-black font-['Stratos'] text-[21px] font-normal leading-[28px] uppercase px-6 py-3 mt-10 hover:bg-[#A9CF38] hover:bg-opacity-10 w-[44%]"
              >
                Back to the blog
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
