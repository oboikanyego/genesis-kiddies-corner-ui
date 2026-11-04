import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Locks in the texts of the approved design so they cannot be changed by accident.
const read = path => readFileSync(new URL('../src/app/' + path, import.meta.url), 'utf8');
const src = {
  shell: read('app.component.ts'), home: read('pages/home.page.ts'), services: read('pages/services.page.ts'),
  card: read('components/service-card.component.ts'), detail: read('pages/detail.page.ts'), cart: read('pages/cart.page.ts'),
  booking: read('pages/booking.page.ts'), success: read('pages/success.page.ts'), mine: read('pages/my-bookings.page.ts'),
  admin: read('pages/admin.page.ts'), demo: read('core/demo-data.ts')
};
const has = (file, texts) => { for (const t of texts) assert.ok(src[file].includes(t), `${file}: missing "${t}"`); };

test('navigation: Home, Services, About, Gallery, Contact, Book Now and the phone tabs', () => {
  has('shell', ['>Home</a>', '>Services</a>', '>About</a>', '>Gallery</a>', '>Contact</a>', 'Book Now']);
  has('shell', ['name="home" [size]="24"/>Home', '/>Services</a>', '/>Bookings</a>', '/>More']);
});

test('homepage', () => {
  has('home', ['Making Every<br/>Event', 'Extra ', 'Special', 'Kiddies parties · Family days', ' · Graduation days', 'School events · Community events', ' · Church events', 'and more', '>Book Now</a>', 'Services</span></a>', 'Our ', 'Perfect for Every Occasion']);
  const config = read('core/site-config.ts');
  for (const label of ['Kiddies Parties', 'Family Days', 'Graduations', 'School Events', 'Community Events', 'Church Events']) assert.ok(config.includes(`label: '${label}'`), label);
  assert.ok(config.includes("photo: '/assets/images/occasions/kiddies-parties-sm.webp'"));
  assert.ok(config.includes("photo: '/assets/images/occasions/family-days-sm.webp'"));
});

test('services list and cards', () => {
  has('services', ['Our Services', 'Choose from our exciting range of services to make your event unforgettable.']);
  has('card', ['View Details', "'From ' +"]);
});

test('service details page and booking panel', () => {
  has('detail', ['Back to Services', 'Book This Service', 'Event Date', 'Start Time', 'End Time', 'Event Type', 'Number of Kids (approx)', 'Add to Booking', "What's Included", 'per {{service.unit}}']);
});

test('cart', () => {
  has('cart', ['Your Booking', 'Estimated Total', 'Proceed to Booking', 'Continue Shopping']);
  has('cart', ["'item':'items'"]);
});

test('booking form: three steps and the field labels', () => {
  has('booking', ['Booking Details', 'Please provide your event information to complete your booking.', "label:'Event Details'", "label:'Customer Details'", "label:'Review & Submit'",
    'Event Type', 'Event Date', 'Start Time', 'End Time', 'Event Location', 'Number of Kids (approx)', 'Special Instructions (Optional)',
    'Tell us more about your event, venue access, setup requirements, etc.', 'Next: Customer Details', 'Back to Cart']);
});

test('confirmation', () => {
  has('success', ['Booking Request Submitted!', 'Thank you for choosing The Genesis Kiddies Corner.', 'Your booking request has been received and is currently pending confirmation.',
    'We will review the availability and contact you soon.', 'Booking Reference', 'View My Bookings', 'Back to Home']);
});

test('my bookings', () => {
  has('mine', ['My Bookings', 'Track the status of your bookings.', '>Upcoming</button>', '>Past</button>', 'View Details']);
});

test('admin dashboard', () => {
  has('admin', ["dashboard: 'Dashboard'", '<h1>{{title()}}</h1>', '<span>Dashboard</span>', '<span>Bookings</span>', '<span>Calendar</span>', '<span>Services</span>', '<span>Settings</span>', '<span>Logout</span>',
    'Total Bookings', '>Pending</span>', '>Confirmed</span>', '>Cancelled</span>', 'Upcoming Bookings', '>Calendar</h2>', '>View</button>']);
});

test('the offline catalogue uses the design prices and texts', () => {
  has('demo', ["name: 'Mascot Characters', summary: 'Popular characters to entertain the kids.'", "price: 1200",
    "name: 'Jumping Castles', summary: 'Fun and safe jumping castles for all ages.'", "price: 1500", "unit: 'day'",
    'Fun, safe and colourful jumping castles perfect for kiddies parties, school events, family days and more.',
    "name: 'Slush Machine', summary: 'Refreshing slush drinks for any event.'", "name: 'Ice Cream Machine', summary: 'Delicious soft serve ice cream for your event.'",
    "name: 'Face Painting', summary: 'Creative and colourful face painting.'", "price: 800",
    "name: 'Stall & Sales Service', summary: 'We come to your event and set up a stall (unlimited service options).'", "price: 2500",
    "'Setup and take down', 'Safe and clean equipment', 'Suitable for different age groups', 'Unlimited use during your event'"]);
});

test('no review score is shown unless the owner has entered a real one', () => {
  assert.ok(src.detail.includes('@if (service.rating && service.reviewCount)'));
  assert.ok(!src.demo.includes('4.9'));
  assert.ok(!src.demo.includes('28 reviews'));
});
