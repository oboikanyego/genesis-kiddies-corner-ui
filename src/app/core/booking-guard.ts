/**
 * Spam protection on the booking form (the API's side is in genesis-kiddies-corner-api, src/lib/formToken.ts):
 * the API hands out a form token when the booking page opens and wants it back with the request. These helpers read its answers.
 */

/** Answers that mean "get a fresh form token and try once more": the token was missing, too new or too old. */
const RETRY_CODES = ['form_token_required', 'form_token_too_fast', 'form_token_expired'];
export const isRetryableTokenError = (error: any): boolean => error?.status === 400 && RETRY_CODES.includes(error?.error?.code);

/** What to tell the customer when a booking request is refused: the API's own words, or the first problem it found with a box. */
export function bookingErrorMessage(error: any): string {
  const body = error?.error;
  const fields = body?.errors?.fieldErrors;
  if (fields && typeof fields === 'object') {
    for (const messages of Object.values(fields)) {
      if (Array.isArray(messages) && typeof messages[0] === 'string' && messages[0]) return messages[0];
    }
  }
  if (typeof body?.message === 'string' && body.message && body.message !== 'Validation failed') return body.message;
  return 'Could not submit your request. Please try again once the booking service is available.';
}
