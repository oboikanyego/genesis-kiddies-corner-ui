import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const admin=read('src/app/pages/admin.page.ts');
const manager=read('src/app/components/occasion-manager.component.ts');
const api=read('src/app/core/booking-api.service.ts');
const home=read('src/app/pages/home.page.ts');
const gallery=read('src/app/pages/info.pages.ts');
const booking=read('src/app/pages/booking.page.ts');
const detail=read('src/app/pages/detail.page.ts');
test('owner can switch between Services and Occasions without a sixth mobile tab',()=>{
 assert.ok(admin.includes("catalogView.set('occasions')"));
 assert.ok(admin.includes('<app-occasion-manager/>'));
 assert.equal((admin.match(/<button type="button" class="admin-tab"/g)||[]).length,5);
});
test('owner can add/edit/hide/reorder occasions, and upload an image',()=>{
 for(const text of ["adminCreateOccasion","adminSaveOccasion","adminUploadOccasionPhoto","item.active","item.sortOrder","choosePhoto($event,item)","prepareServicePhoto(file)"]){
  assert.ok(manager.includes(text),'missing '+text);
 }
 assert.ok(api.includes('/admin/occasions'));
});
test('homepage and gallery use live visible occasions, not fixed arrays',()=>{
 assert.ok(home.includes('api.occasions$ | async'));
 assert.ok(gallery.includes('api.occasions$ | async'));
 assert.ok(!gallery.includes('@for (e of extras'));
});
test('booking form reflects active configured occasion types',()=>{
 assert.ok(booking.includes('this.api.occasions$.subscribe'));
 assert.ok(booking.includes('occasions.map(o=>o.name)'));
 assert.ok(booking.includes("'Other'"));
 assert.ok(detail.includes('this.api.occasions$.subscribe'));
 assert.ok(detail.includes('occasions.map(o=>o.name)'));
});

test('occasion save sends only editable fields, not MongoDB metadata',()=>{
 assert.match(api,/const \{_id,name,label,emoji,theme,photo,active,sortOrder\}=occasion/);
 assert.ok(api.includes('{name,label,emoji,theme,photo,active,sortOrder},this.auth()'));
});
