/**
 * Form fields with Gatsby's sliding labels — port of Gatsby's
 * components/global/FormFields.js, shared by every form island.
 *
 * Input / PhoneInput / TextArea / Select: the label sits inside the empty
 * field; on focus (or once it has a value) it fades out there and slides up
 * into a small label above the field. `bg="white"` gives the boxed white
 * style used on the PPC lander. CheckboxGroup has a static label.
 */
import { useId, useState, type FocusEvent, type ChangeEvent } from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { theme } from '@/lib/theme';

type TextColor = 'black' | 'white' | 'rm-black' | 'rm-white';

interface BaseFieldProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  required?: boolean;
  textColor?: TextColor;
  fontWeight?: 'light';
  bg?: 'white';
  /** Value set programmatically (e.g. setValue prefill) — keeps the label up */
  filled?: boolean;
}

// Literal class names (Tailwind can't see `text-rm-${color}`)
const textClass   = (c: TextColor = 'black') => (c.endsWith('white') ? 'text-rm-white' : 'text-rm-black');
const borderClass = (c: TextColor = 'black') => (c.endsWith('white') ? 'border-rm-white' : 'border-rm-black');

const boxedField = 'pl-4 pt-4 pb-3 border-l border-t border-r border-solid border-l-[#48474730] border-r-[#48474730] border-t-[#48474730]';
const errorText  = 'block text-[#EA0000] text-18px leading-26px';

/** Shared focus/filled state that drives the label slide */
function useFloatingLabel() {
  const [isFocused, setIsFocused] = useState(false);
  return {
    isFocused,
    onFocus: () => setIsFocused(true),
    onBlur : (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setIsFocused(e.target.value !== ''),
  };
}

/** Small label above the field — hidden and shifted down until active */
function TopLabel({ id, label, active, textColor }: { id: string; label: string; active: boolean; textColor?: TextColor }) {
  return (
    <label
      htmlFor={id}
      className={`block mb-2 ${theme.text.FOOTER} ${textClass(textColor)} duration-500 ${active ? 'opacity-100' : 'opacity-0 translate-y-6'}`}
    >
      {label}
    </label>
  );
}

/** Large label sitting inside the field — fades up and out when active */
function InnerLabel({ label, active, fontWeight, bg, extra = '' }: { label: string; active: boolean; fontWeight?: 'light'; bg?: 'white'; extra?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${bg === 'white' ? `bg-white pl-4 pt-4 pb-3 ${extra}` : ''} absolute top-0 left-0 w-full transition-all pointer-events-none ${fontWeight === 'light' ? theme.text.P_STD : theme.text.P_BLD} duration-300 ${active ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}
    >
      {label}
    </span>
  );
}

function fieldClasses(name: string, errors: FieldErrors, textColor?: TextColor, bg?: 'white') {
  return `${bg === 'white' ? boxedField : ''} relative w-full ${theme.forms.INPUT} ${theme.text.P_STD} bg-transparent ${borderClass(textColor)} ${textClass(textColor)} focus:border-rm-green focus:outline-none ${errors[name] ? 'border-b-[#EA0000]' : ''}`;
}

export function Input({ type = 'text', name, label, register, errors, required = false, textColor, fontWeight, bg, filled = false }: BaseFieldProps & { type?: string }) {
  const id                            = `${useId()}-${name}`;
  const { isFocused, onFocus, onBlur } = useFloatingLabel();
  const field                         = register(name, { required, onBlur });
  const active                        = isFocused || filled;

  return (
    <>
      <TopLabel id={id} label={label} active={active} textColor={textColor} />
      <span className="relative block">
        <InnerLabel label={label} active={active} fontWeight={fontWeight} bg={bg} />
        <input id={id} type={type} {...field} onFocus={onFocus} className={fieldClasses(name, errors, textColor, bg)} />
        {errors[name] && <span className={errorText}>This field is required</span>}
      </span>
    </>
  );
}

/** Formats digits as (999) 999-9999 while typing (Gatsby used react-input-mask) */
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function PhoneInput({ name, label, register, errors, required = false, textColor, fontWeight, bg }: BaseFieldProps) {
  const id                            = `${useId()}-${name}`;
  const { isFocused, onFocus, onBlur } = useFloatingLabel();
  const field                         = register(name, { required, onBlur });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatPhone(e.target.value);
    field.onChange(e);
  };

  return (
    <>
      <TopLabel id={id} label={label} active={isFocused} textColor={textColor} />
      <span className="relative block">
        <InnerLabel label={label} active={isFocused} fontWeight={fontWeight} bg={bg} />
        <input id={id} type="tel" inputMode="tel" {...field} onChange={onChange} onFocus={onFocus} className={fieldClasses(name, errors, textColor, bg)} />
        {errors[name] && <span className={errorText}>This field is required</span>}
      </span>
    </>
  );
}

export function TextArea({ name, label, register, errors, required = false, textColor, fontWeight, bg }: BaseFieldProps) {
  const id                            = `${useId()}-${name}`;
  const { isFocused, onFocus, onBlur } = useFloatingLabel();
  const field                         = register(name, { required, onBlur });

  return (
    <>
      <TopLabel id={id} label={label} active={isFocused} textColor={textColor} />
      <span className="relative block">
        <InnerLabel label={label} active={isFocused} fontWeight={fontWeight} bg={bg} extra={`w-full h-full ${boxedField}`} />
        <textarea id={id} rows={4} {...field} onFocus={onFocus} className={fieldClasses(name, errors, textColor, bg)} />
        {errors[name] && <span className={errorText}>This field is required</span>}
      </span>
    </>
  );
}

export function Select({ name, label, options, register, errors, required = false, textColor, fontWeight, bg }: BaseFieldProps & { options: string[] }) {
  const id                            = `${useId()}-${name}`;
  const { isFocused, onFocus, onBlur } = useFloatingLabel();
  const field                         = register(name, { required, onBlur });

  return (
    <>
      <TopLabel id={id} label={label} active={isFocused} textColor={textColor} />
      <span className="relative block">
        <InnerLabel label={label} active={isFocused} fontWeight={fontWeight} bg={bg} />
        <select id={id} defaultValue="" {...field} onFocus={onFocus} className={fieldClasses(name, errors, textColor, bg)}>
          <option value="" disabled></option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors[name] && <span className={errorText}>This field is required</span>}
      </span>
    </>
  );
}

export function CheckboxGroup({ name, label, options, register, errors, required = false, textColor, fontWeight }: BaseFieldProps & { options: string[] }) {
  return (
    <fieldset>
      <legend className={`block mb-4 ${textClass(textColor)} ${fontWeight === 'light' ? theme.text.P_STD : theme.text.P_BLD}`}>{label}</legend>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              value={option}
              {...register(name, { required })}
              className={`w-5 h-5 border-2 ${borderClass(textColor)} accent-rm-green rounded`}
            />
            <span className={`${theme.text.P_STD} ${textClass(textColor)}`}>{option}</span>
          </label>
        ))}
      </div>
      {errors[name] && <span className={`${errorText} mt-2`}>This field is required</span>}
    </fieldset>
  );
}
