import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The contact helpers are TypeScript; Node runs them directly from 22.18 (older Node skips those tests instead of failing).
const supported = Boolean(process.features?.typescript);
const { CONTACT_KEYS, contactFieldErrors, internationalDigits, isValidPhoneNumber, telHref, whatsappHref } = supported ? await import('../src/app/core/contact.ts') : {};
const check = (name, fn) => test(name, supported ? {} : { skip: 'needs Node 22.18+ (built-in TypeScript support)' }, fn);

const read = path => readFileSync(new URL('../src/app/' + path, import.meta.url), 'utf8');
const has = (source, texts) => { for (const t of texts) assert.ok(source.includes(t), `missing "${t}"`); };

check('a South African number becomes the international digits WhatsApp needs, however it was typed', () => {
  for (const typed of ['082 123 4567', '0821234567', '+27 82 123 4567', '+27 (0)82 123 4567', '27821234567', '0027 82 123 4567', '(082) 123-4567']) {
    assert.equal(internationalDigits(typed), '27821234567', typed);
  }
  assert.equal(internationalDigits('(011) 123-4567'), '27111234567');                              // a Johannesburg landline
  assert.equal(internationalDigits('+44 20 7946 0958'), '442079460958');                           // other countries are left alone
  assert.equal(internationalDigits(''), '');
  assert.equal(internationalDigits('  '), '');
});

check('phone numbers are accepted the way people write them, and junk is not (the same rule as the API)', () => {
  for (const good of ['082 123 4567', '0821234567', '+27 82 123 4567', '+27 (0)82 123 4567', '(011) 123-4567', '082.123.4567']) assert.equal(isValidPhoneNumber(good), true, good);
  for (const bad of ['abcdefghi', '082 123 456a', '12345', '1'.repeat(16), '+++27821234567', '082 123 4567 after 5pm', '<script>alert(1)</script>', '']) assert.equal(isValidPhoneNumber(bad), false, bad);
});

check('phone links dial the number: local as typed, international with a +', () => {
  assert.equal(telHref('082 123 4567'), 'tel:0821234567');
  assert.equal(telHref(' (011) 123-4567 '), 'tel:0111234567');
  assert.equal(telHref('+27 82 123 4567'), 'tel:+27821234567');
  assert.equal(telHref('+27 (0)82 123 4567'), 'tel:+27821234567');
  assert.equal(telHref(''), '');
});

check('WhatsApp links open a chat with the number', () => {
  assert.equal(whatsappHref('082 123 4567'), 'https://wa.me/27821234567');
  assert.equal(whatsappHref('+27 82 123 4567'), 'https://wa.me/27821234567');
  assert.equal(whatsappHref(''), '');
});

check('the first problem the API reports for each box is the one shown, and only for a 400 answer', () => {
  assert.deepEqual(CONTACT_KEYS, ['phone', 'whatsapp', 'email', 'area']);
  const answer = { status: 400, error: { message: 'Validation failed', errors: { fieldErrors: {
    phone: ['Enter a valid phone number, for example 082 123 4567', 'second message'], email: ['Enter a valid email address, for example hello@example.com'], other: ['ignored'] } } } };
  assert.deepEqual(contactFieldErrors(answer), { phone: 'Enter a valid phone number, for example 082 123 4567', email: 'Enter a valid email address, for example hello@example.com' });
  assert.deepEqual(contactFieldErrors({ ...answer, status: 500 }), {});
  assert.deepEqual(contactFieldErrors({ status: 401, error: { message: 'Invalid or expired session' } }), {});
  assert.deepEqual(contactFieldErrors({ status: 0 }), {});
  assert.deepEqual(contactFieldErrors(null), {});
  assert.deepEqual(contactFieldErrors({ status: 400, error: { errors: { fieldErrors: { phone: 'not a list', email: [''] } } } }), {});
});

test('no contact detail is written into the website itself: the owner enters them in the admin area', () => {
  const config = read('core/site-config.ts');
  assert.ok(!/\bSITE\b/.test(config) && !/contact\s*:/.test(config), 'site-config.ts must not hold contact details');
  for (const file of ['core/site-config.ts', 'core/demo-data.ts', 'pages/info.pages.ts', 'app.component.ts']) {
    const source = read(file);
    assert.ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(source.replace(/owner@example\.com/g, '')), `${file} holds an email address`);
    assert.ok(!/\b0[1-9]\d[ -]?\d{3}[ -]?\d{4}\b|\+27[ \d]{9,}/.test(source), `${file} holds a phone number`);
  }
});

test('the Contact page reads the details from the API, and handles loading, empty and failed answers', () => {
  const page = read('pages/info.pages.ts');
  has(page, ['this.api.contactDetails()', "state = signal<'loading' | 'ready' | 'error'>('loading')", 'Loading our contact details…', "We couldn't load our contact details just now.", 'Try again',
    'telHref(c().phone)', 'whatsappHref(c().whatsapp)', "'mailto:' + c().email", '@if (c().area)', 'Ready to book?']);
  assert.ok(!page.includes('SITE'));
});

test('the API service talks to the public and the admin settings endpoints', () => {
  const api = read('core/booking-api.service.ts');
  has(api, ['this.http.get<ContactDetails>(`${this.url}/settings`)', 'this.http.get<ContactDetails>(`${this.url}/admin/settings`, this.auth())', 'this.http.put<ContactDetails>(`${this.url}/admin/settings`, details, this.auth())']);
});

test('Settings has a Contact details form with the four boxes, a Save button and a link to check the Contact page', () => {
  const admin = read('pages/admin.page.ts');
  has(admin, ['Contact details', "label:'Phone number'", "label:'WhatsApp number'", "label:'Email address'", "label:'Area we serve'",
    'Customers see these on the website\'s Contact page. Leave a box empty to hide it.', 'Save contact details', 'routerLink="/contact"', 'View the Contact page',
    'this.api.adminSettings()', 'this.api.adminSaveSettings({...this.contact})', 'contactFieldErrors(e)', "if(tab==='settings')this.loadContact();"]);
  // The form stays locked until the saved details have loaded, so a late answer can never overwrite what the owner typed.
  has(admin, ['[disabled]="!contactLoaded()"', '[disabled]="busy()||!contactLoaded()"']);
  // Accessible errors: each message is tied to its box.
  has(admin, ['[attr.aria-invalid]', 'aria-describedby', 'role="alert"']);
});

test('long contact details wrap inside the card instead of pushing the page sideways on a phone', () => {
  const css = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');
  assert.match(css, /\.contact-list\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css, /\.contact-list li>a,\.contact-list li>span\{[^}]*overflow-wrap:anywhere/);
});

test('after a save, its result is scrolled into view so the phone bottom bar cannot hide it', () => {
  has(read('pages/admin.page.ts'), ["document.querySelector('.contact-note')?.scrollIntoView({block:'nearest'})", 'this.showContactStatus({ok:true', 'this.showContactStatus({ok:false']);
});
