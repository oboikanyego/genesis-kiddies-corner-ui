import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');
const has = (source, texts) => { for (const t of texts) assert.ok(source.includes(t), `missing "${t}"`); };

test('the API service sends the owner\'s search, and asks the look-up for the email AND the phone number', () => {
  const api = read('app/core/booking-api.service.ts');
  has(api, ['adminBookings(status?: string, page = 1, search?: string)', "if (search) params['search'] = search;", "if (status) params['status'] = status;",
    'lookupBookings(email: string, phone: string)', 'this.http.post<{ items: Booking[] }>(`${this.url}/bookings/lookup`, { email, phone })']);
});

test('the owner\'s Bookings tab has a labelled search box with a clear button and a result count', () => {
  const admin = read('app/pages/admin.page.ts');
  has(admin, ['<label class="visually-hidden" for="booking-search">Search bookings</label>', 'id="booking-search" type="search"', 'placeholder="Search by name, email, phone or reference"',
    'aria-label="Clear search"', "{{total()===1?'booking matches':'bookings match'}}", "{{searching()?'No bookings match your search.':'No booking requests found.'}}"]);
});

test('searching waits for a pause in typing, ignores one character, starts again at page 1 and never shows an out-of-date answer', () => {
  const admin = read('app/pages/admin.page.ts');
  has(admin, ["searching=computed(()=>this.searchText().trim().length>=2)", 'this.searchTimer=setTimeout(()=>{this.page.set(1);this.loadBookings();},300)',
    'this.api.adminBookings(this.filter||undefined,this.page(),search)', 'const request=++this.bookingsRequest;', 'if(request!==this.bookingsRequest)return;',
    'clearSearch(){this.searchText.set(\'\');clearTimeout(this.searchTimer);this.page.set(1);this.loadBookings();}']);
});

test('My Bookings can find a customer\'s bookings with their email and phone number, and still offers the booking reference', () => {
  const page = read('app/pages/my-bookings.page.ts');
  has(page, ['id="mode-phone"', 'id="mode-reference"', 'Email &amp; phone', 'Booking reference',
    'Enter the email address and the mobile number you booked with. Both must match.', 'id="f-mail"', 'id="f-phone"', 'Find My Bookings',
    "phone:['',[Validators.required,phoneValidator]]", 'this.api.lookupBookings(v.email.trim(),v.phone.trim())',
    "We couldn't find a booking with that email address and mobile number.", 'bookingErrorMessage(e)',
    'Find My Booking', 'this.api.track(v.reference.trim().toUpperCase(),v.email.trim())']);
});

test('bookings that are found are saved on this device and shown in the right tab', () => {
  const page = read('app/pages/my-bookings.page.ts');
  has(page, ['r.items.forEach(b=>this.api.rememberBooking(b.reference,v.email,b));', "this.tab.set(r.items.some(b=>isUpcoming(b))?'upcoming':'past');",
    "this.open.set(r.items.length===1?r.items[0].reference:null);", 'Found ${r.items.length}']);
  assert.ok(page.includes('this.findForm.markAllAsTouched()'), 'an incomplete form shows what is missing instead of doing nothing');
  // The results are above the form, so after a successful look-up (either kind) they are scrolled into view, clear of the phone's top bar.
  has(page, ["private showResults(){setTimeout(()=>document.querySelector('.tabs')?.scrollIntoView({block:'start'}));}"]);
  assert.equal((page.match(/this\.showResults\(\);/g) || []).length, 2, 'both look-ups scroll to their results');
  assert.ok(read('styles.scss').includes('overflow:hidden;scroll-margin-top:72px}'), 'the tabs leave room for the sticky header');
});

test('the two forms on My Bookings never share an element id', () => {
  const ids = [...read('app/pages/my-bookings.page.ts').matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate ids: ' + ids.filter((id, i) => ids.indexOf(id) !== i).join(', '));
});

test('the styles for the search box, the hidden label and the mode switch are there', () => {
  const css = read('styles.scss');
  for (const rule of ['.booking-search{', '.booking-search-box{', '.search-summary{', '.search-clear{', '.visually-hidden{', '.lookup-modes{', '.lookup-modes button.active{']) assert.ok(css.includes(rule), rule);
});
