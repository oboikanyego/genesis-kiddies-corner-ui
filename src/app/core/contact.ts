import type { ContactDetails } from './models';

/** The boxes of Settings > Contact details, in the order they are shown. */
export const CONTACT_KEYS: (keyof ContactDetails)[] = ['phone', 'whatsapp', 'email', 'area'];

/**
 * The digits to dial or chat to, in international form, from a number typed the usual South African way
 * (082 123 4567), with the country code (+27 82 123 4567, 27821234567, 0027 82 123 4567) or with the optional
 * zero written out (+27 (0)82 123 4567).
 */
export function internationalDigits(number: string): string {
  const typed = number.trim();
  let digits = typed.replace(/\D/g, '');
  if (!digits) return '';
  if (typed.startsWith('+')) { /* already international */ }
  else if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = '27' + digits.slice(1);
  return digits.replace(/^270(?=\d{9}$)/, '27');
}

/**
 * A phone number as people type it: 082 123 4567, 0821234567, +27 82 123 4567, (011) 123-4567. Digits with spaces, dashes,
 * dots and brackets, an optional leading +, and 9 to 15 digits; no letters. The same rule as the API's.
 */
export function isValidPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '').length;
  return /^\+?[\d\s().-]+$/.test(value) && digits >= 9 && digits <= 15;
}

/** A link that dials the number: tel:0821234567 or tel:+27821234567. Empty when there is no number. */
export function telHref(number: string): string {
  const typed = number.trim();
  if (!typed.replace(/\D/g, '')) return '';
  return 'tel:' + (typed.startsWith('+') ? '+' + internationalDigits(typed) : typed.replace(/\D/g, ''));
}

/** A link that opens a WhatsApp chat with the number (wa.me wants the international form, without + or spaces). */
export function whatsappHref(number: string): string {
  const digits = internationalDigits(number);
  return digits ? `https://wa.me/${digits}` : '';
}

/**
 * What is wrong with each box, from a failed save. The API answers 400 with `errors.fieldErrors`, a list of
 * messages per box; the first one is shown beside that box. Anything else (no connection, expired session) gives {}.
 */
export function contactFieldErrors(error: any): Partial<Record<keyof ContactDetails, string>> {
  const fields = error?.status === 400 ? error.error?.errors?.fieldErrors : null;
  const found: Partial<Record<keyof ContactDetails, string>> = {};
  if (fields && typeof fields === 'object') {
    for (const key of CONTACT_KEYS) {
      const first = Array.isArray(fields[key]) ? fields[key][0] : undefined;
      if (typeof first === 'string' && first) found[key] = first;
    }
  }
  return found;
}
