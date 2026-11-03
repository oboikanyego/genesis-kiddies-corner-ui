import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const photos=read('src/app/core/service-photos.ts');
const demo=read('src/app/core/demo-data.ts');
const api=read('src/app/core/booking-api.service.ts');
const home=read('src/app/pages/home.page.ts');
const detail=read('src/app/pages/detail.page.ts');

test('every service (including the stall service) has a real image URL rather than SVG artwork', () => {
  const matches=[...photos.matchAll(/'([a-z-]+)': '(https:\/\/[^']+\.jpg)'/g)];
  assert.equal(matches.length,8);
  assert.equal(new Set(matches.map(m=>m[1])).size,8);
  assert.ok(matches.some(m=>m[1]==='stall-sales-service'),'the Stall & Sales Service needs a photo');
  for(const [,slug,url] of matches){
    assert.ok(url.startsWith('https://res.cloudinary.com/dv2hhefed/image/upload/'),slug);
    assert.ok(!url.endsWith('.svg'));
  }
});
test('offline demo and stale API records resolve the new photographs', () => {
  assert.ok(demo.includes('image: servicePhotoFor('));
  assert.ok(api.includes('image: servicePhotoFor(item)'));
  assert.ok(api.includes('image: servicePhotoFor(i.service)'));
  assert.ok(photos.includes("service.image.startsWith('/assets/illustrations/')"));
  assert.ok(photos.includes('return service.image;'));
});
test('homepage and detail pages use photography and identify representative equipment', () => {
  assert.ok(home.includes('class="hero-photo"'));
  assert.ok(!home.includes('src="/assets/illustrations/hero.svg"'));
  assert.ok(detail.includes('Reference photo — exact equipment confirmed by the owner'));
});
