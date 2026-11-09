import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('owner sees Resend setup status and test button in admin Settings',()=>{
 const admin=read('src/app/pages/admin.page.ts');
 assert.ok(admin.includes('Booking email alerts'));
 assert.ok(admin.includes('emailStatus()'));
 assert.ok(admin.includes('sendEmailTest()'));
 assert.ok(admin.includes('Send test email'));
 assert.ok(admin.includes('Customers are not emailed'));
 assert.ok(admin.includes('[disabled]="!status.configured||emailTestBusy()"'));
});
test('email status and test requests use admin JWT authentication, not frontend API keys',()=>{
 const api=read('src/app/core/booking-api.service.ts');
 assert.ok(api.includes('/admin/email/status'));
 assert.ok(api.includes('/admin/email/test'));
 assert.ok(api.includes('this.auth()'));
 assert.ok(!api.includes('RESEND_API_KEY'));
 assert.ok(!read('src/app/pages/admin.page.ts').includes('re_'));
});
