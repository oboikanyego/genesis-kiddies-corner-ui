import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The helpers are TypeScript; Node runs them directly from 22.18 (older Node skips those tests instead of failing).
const supported = Boolean(process.features?.typescript);
const { bookingErrorMessage, isRetryableTokenError } = supported ? await import('../src/app/core/booking-guard.ts') : {};
const check = (name, fn) => test(name, supported ? {} : { skip: 'needs Node 22.18+ (built-in TypeScript support)' }, fn);

const read = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');
const has = (source, texts) => { for (const t of texts) assert.ok(source.includes(t), `missing "${t}"`); };
const FALLBACK = 'Could not submit your request. Please try again once the booking service is available.';

check('a refused booking shows the API\'s own words, or the first problem it found with a box', () => {
  const slow = 'You are sending booking requests too quickly. Please wait a minute and try again.';
  assert.equal(bookingErrorMessage({ status: 429, error: { message: slow, code: 'too_many_requests' } }), slow);
  assert.equal(bookingErrorMessage({ status: 429, error: { message: 'You already have 5 booking requests waiting for review.', code: 'too_many_pending' } }), 'You already have 5 booking requests waiting for review.');
  const phone = 'Please enter a valid mobile number, for example 082 123 4567';
  assert.equal(bookingErrorMessage({ status: 400, error: { message: 'Validation failed', errors: { fieldErrors: { customer: [phone, 'second'] } } } }), phone);
  assert.equal(bookingErrorMessage({ status: 409, error: { message: 'Jumping Castles is unavailable on this date' } }), 'Jumping Castles is unavailable on this date');
});

check('when the API says nothing useful, the customer gets the standard message (never just "Validation failed")', () => {
  assert.equal(bookingErrorMessage({ status: 400, error: { message: 'Validation failed', errors: { fieldErrors: {} } } }), FALLBACK);
  assert.equal(bookingErrorMessage({ status: 400, error: { message: 'Validation failed' } }), FALLBACK);
  assert.equal(bookingErrorMessage({ status: 0, error: {} }), FALLBACK);
  assert.equal(bookingErrorMessage({ status: 500 }), FALLBACK);
  assert.equal(bookingErrorMessage(null), FALLBACK);
  assert.equal(bookingErrorMessage(undefined), FALLBACK);
});

check('only a form-token problem is retried, and only when the API answered 400', () => {
  for (const code of ['form_token_required', 'form_token_too_fast', 'form_token_expired']) assert.equal(isRetryableTokenError({ status: 400, error: { code } }), true, code);
  const notRetried = [{ status: 400, error: { code: 'request_rejected' } }, { status: 429, error: { code: 'too_many_requests' } }, { status: 429, error: { code: 'too_many_pending' } },
    { status: 429, error: { code: 'form_token_expired' } }, { status: 400, error: {} }, { status: 500 }, { status: 0 }, null, undefined];
  for (const error of notRetried) assert.equal(isRetryableTokenError(error), false, JSON.stringify(error));
});

test('the booking form has a hidden box that people, screen readers and the Tab key never reach', () => {
  const page = read('app/pages/booking.page.ts');
  has(page, ['<div class="hp-field" aria-hidden="true">', '<input id="f-website" formControlName="website" type="text" tabindex="-1" autocomplete="off"/>', "website:['']"]);
  assert.match(read('styles.scss'), /\.hp-field\{position:absolute;left:-10000px;[^}]*overflow:hidden\}/);
});

test('the booking page asks for a form token when it opens, sends it back, and retries with a fresh one once, never in a loop', () => {
  const page = read('app/pages/booking.page.ts');
  has(page, ['constructor(){if(this.api.cart().length)this.tokenInfo=this.requestToken();}', 'this.api.bookingFormToken()', '...(token?{formToken:token}:{})', 'website:this.v.website',
    'if(mayRetry&&isRetryableTokenError(e)){this.tokenInfo=this.requestToken();return this.send(body,cart,false);}', 'bookingErrorMessage(e)']);
  assert.equal((page.match(/this\.send\(body,cart,/g) || []).length, 2, 'one first try and one retry');
  assert.ok(page.includes('if(this.busy())return;'), 'pressing Enter twice must not send two requests');
  has(read('app/core/booking-api.service.ts'), ['`${this.url}/bookings/form-token`']);
  has(read('app/core/models.ts'), ['formToken?: string;', 'website?: string;']);
});

test('the phone number box uses the same rule as the API', () => {
  has(read('app/pages/booking.page.ts'), ["phone:['',[Validators.required,phoneValid]]", 'isValidPhoneNumber(String(c.value).trim())']);
  assert.ok(!read('app/pages/booking.page.ts').includes('Validators.minLength(9)'), 'the old length-only check should be gone');
});
