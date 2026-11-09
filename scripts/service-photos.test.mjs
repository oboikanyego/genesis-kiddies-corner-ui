import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const kb = path => statSync(new URL(path, root)).size / 1024;
const photos=read('src/app/core/service-photos.ts');
const demo=read('src/app/core/demo-data.ts');
const api=read('src/app/core/booking-api.service.ts');
const home=read('src/app/pages/home.page.ts');
const detail=read('src/app/pages/detail.page.ts');

// service-photos.ts is TypeScript: Node runs it directly from 22.18 (older Node skips the behaviour tests instead of failing).
const supported = Boolean(process.features?.typescript);
const mod = supported ? await import('../src/app/core/service-photos.ts') : {};
const behaviour = (name, fn) => test(name, supported ? {} : { skip: 'needs Node 22.18+ (built-in TypeScript support)' }, fn);

const SLUGS = ['mascot-characters','jumping-castles','slush-machine','ice-cream-machine','face-painting','popcorn-machine','candy-floss-machine','stall-sales-service'];

test('every service has the design image in three sizes plus a round icon, and every file stays light', () => {
  const declared = [...photos.matchAll(/^  '([a-z-]+)': designPhoto\('([a-z-]+)'\)/gm)];
  assert.deepEqual(declared.map(m => m[1]).sort(), [...SLUGS].sort());
  for (const slug of SLUGS) {
    for (const [size, limit] of [['lg', 300], ['md', 120], ['sm', 40]]) {
      const file = `src/assets/images/services/${slug}-${size}.webp`;
      assert.ok(existsSync(new URL(file, root)), `missing ${file}`);
      assert.ok(kb(file) < limit, `${file} is ${Math.round(kb(file))} KB (limit ${limit} KB)`);
    }
    const icon = `src/assets/images/icons/${slug}.webp`;
    assert.ok(existsSync(new URL(icon, root)), `missing ${icon}`);
    assert.ok(kb(icon) < 40, `${icon} is too large`);
  }
});

test('the homepage banner and the occasion pictures exist and are light', () => {
  for (const [file, limit] of [['hero/hero-1448.webp', 300], ['hero/hero-800.webp', 150], ['occasions/kiddies-parties-md.webp', 150], ['occasions/kiddies-parties-sm.webp', 60], ['occasions/family-days-md.webp', 150], ['occasions/family-days-sm.webp', 60],
    ['occasions/graduations-md.webp', 150], ['occasions/graduations-sm.webp', 60], ['occasions/school-events-md.webp', 150], ['occasions/school-events-sm.webp', 60],
    ['occasions/community-events-md.webp', 150], ['occasions/community-events-sm.webp', 60],
    ['occasions/church-events-md.webp', 150], ['occasions/church-events-sm.webp', 60]]) {
    const path = `src/assets/images/${file}`;
    assert.ok(existsSync(new URL(path, root)), `missing ${path}`);
    assert.ok(kb(path) < limit, `${path} is ${Math.round(kb(path))} KB (limit ${limit} KB)`);
  }
});

test('the earlier stock photos are still recognised, so they can be replaced by the design images', () => {
  const stock = [...photos.matchAll(/'([a-z-]+)': '(https:\/\/res\.cloudinary\.com\/dv2hhefed\/image\/upload\/[^']+\.jpg)'/g)];
  assert.equal(stock.length, 8);
  assert.equal(new Set(stock.map(m => m[1])).size, 8);
  assert.ok(photos.includes("image.startsWith('/assets/illustrations/')"));
  assert.ok(photos.includes('STOCK_URLS.has(image)'));
});

test('offline demo and stale API records resolve the design images', () => {
  assert.ok(demo.includes('image: servicePhotoFor('));
  assert.ok(api.includes('image: servicePhotoFor(item)'));
  assert.ok(api.includes('image: servicePhotoFor(i.service)'));
});

test('pages pick the right image size and say the pictures are illustrations', () => {
  assert.ok(home.includes('class="hero-photo"'));
  assert.ok(home.includes('srcset'));
  assert.ok(home.includes('icons[s.slug]'));
  assert.ok(!home.includes('src="/assets/illustrations/hero.svg"'));
  assert.ok(detail.includes("service.image | photo:'lg'"));
  assert.ok(detail.includes('Illustrative image — exact equipment confirmed by the owner'));
  assert.ok(read('src/app/components/service-card.component.ts').includes("photo:'md'"));
  assert.ok(read('src/app/pages/cart.page.ts').includes("photo:'sm'"));
});

behaviour('design images replace stand-ins but NEVER an image the owner chose', () => {
  const { servicePhotoFor, DESIGN_PHOTOS, STOCK_PHOTOS } = mod;
  const castles = DESIGN_PHOTOS['jumping-castles'];
  assert.equal(servicePhotoFor({ slug: 'jumping-castles', image: '/assets/illustrations/castle.svg' }), castles);
  assert.equal(servicePhotoFor({ slug: 'jumping-castles', image: STOCK_PHOTOS['jumping-castles'] }), castles);
  assert.equal(servicePhotoFor({ slug: 'jumping-castles', image: '' }), castles);
  assert.equal(servicePhotoFor({ slug: 'jumping-castles', image: '/assets/images/services/jumping-castles-sm.webp' }), castles);
  // the owner's own picture always wins
  assert.equal(servicePhotoFor({ slug: 'jumping-castles', image: 'https://photos.example.com/my-castle.jpg' }), 'https://photos.example.com/my-castle.jpg');
  // the stall service was stored with the candy floss stock photo until now
  assert.equal(servicePhotoFor({ slug: 'stall-sales-service', image: STOCK_PHOTOS['candy-floss-machine'] }), DESIGN_PHOTOS['stall-sales-service']);
  // a service the owner added themselves is left alone
  assert.equal(servicePhotoFor({ slug: 'my-new-service', image: 'https://photos.example.com/x.jpg' }), 'https://photos.example.com/x.jpg');
  assert.equal(servicePhotoFor({ slug: 'my-new-service', image: '/assets/illustrations/x.svg' }), '/assets/illustrations/x.svg');
});

behaviour('only our own images change size', () => {
  const { photoSized } = mod;
  assert.equal(photoSized('/assets/images/services/jumping-castles-lg.webp', 'sm'), '/assets/images/services/jumping-castles-sm.webp');
  assert.equal(photoSized('/assets/images/services/jumping-castles-sm.webp', 'md'), '/assets/images/services/jumping-castles-md.webp');
  assert.equal(photoSized('https://photos.example.com/my-castle.jpg', 'sm'), 'https://photos.example.com/my-castle.jpg');
});

test('owner service photo picker is connected to the admin and API',()=>{
 const admin=read('src/app/pages/admin.page.ts');
 const apiSource=read('src/app/core/booking-api.service.ts');
 assert.ok(admin.includes('onServicePhotoSelected($event,item)'));
 assert.ok(admin.includes('prepareServicePhoto(selected)'));
 assert.ok(admin.includes('this.api.adminUploadServicePhoto('));
 assert.ok(apiSource.includes('/photo'));
});
behaviour('photo picker only accepts JPG PNG WebP and has a size limit',async()=>{
 const {servicePhotoValidation}=await import('../src/app/core/photo-upload.ts');
 assert.equal(servicePhotoValidation({type:'image/jpeg',size:1000}),null);
 assert.equal(servicePhotoValidation({type:'image/svg+xml',size:1000}), 'Choose a JPG, PNG or WebP image.');
 assert.match(servicePhotoValidation({type:'image/png',size:20*1024*1024})||'',/15 MB/);
});
