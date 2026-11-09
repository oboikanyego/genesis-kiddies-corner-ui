import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { backendHealthUrl } from '../src/app/core/backend-health-url.ts';

const read = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');

test('health URL follows the active Render API, not the developer account', () => {
  assert.equal(backendHealthUrl('https://client-service.onrender.com/api'), 'https://client-service.onrender.com/health');
  assert.equal(backendHealthUrl('https://client-service.onrender.com/api/'), 'https://client-service.onrender.com/health');
  assert.equal(backendHealthUrl('http://localhost:10000/api'), 'http://localhost:10000/health');
});

test('one shared startup request wakes Render with bounded retries', () => {
  const service = read('app/core/backend-connection.service.ts');
  const root = read('app/app.component.ts');
  for (const expression of [
    'this.connection.start()', 'connection.indicatorVisible()', 'connection.retryConnection()'
  ]) assert.ok(root.includes(expression), expression);
  for (const expression of [
    'private activeRequest?: Observable<void>', 'if (this.activeRequest) return this.activeRequest',
    'shareReplay({ bufferSize: 1, refCount: false })',
    'backendHealthUrl(environment.apiUrl)', 'timeout({ first: 30000 })',
    'retry({ count: 2', "this.changeStatus('offline')", "this.changeStatus('ready')"
  ]) assert.ok(service.includes(expression), expression);
});

test('slow startup loader does not hide the website or block navigation', () => {
  const root = read('app/app.component.ts');
  const css = read('styles.scss');
  assert.ok(root.includes('Connecting to our booking service'));
  assert.ok(root.includes('You can browse while we get everything ready.'));
  assert.ok(root.includes('Booking service unavailable'));
  assert.ok(root.includes('Try again'));
  assert.ok(root.includes('<router-outlet></router-outlet>'), 'routing must remain active during warm-up');
  assert.ok(css.includes('.backend-connection-status{position:fixed') || css.includes('.backend-connection-status{\n  position:fixed'), 'small status card should not replace page content');
  assert.ok(css.includes('@media(max-width:899px)'), 'status indicator should have mobile styling');
});

test('API interceptor delays backend requests but never intercepts Render health', () => {
  const interceptor = read('app/core/backend-wakeup.interceptor.ts');
  const bootstrap = read('main.ts');
  const client = read('app/core/booking-api.service.ts');
  for (const expression of [
    'req.url.startsWith(apiRoot', 'return next(req)', 'switchMap(() => next(req))'
  ]) assert.ok(interceptor.includes(expression), expression);
  assert.ok(bootstrap.includes('withInterceptors([backendWakeupInterceptor])'));
  assert.ok(client.includes('this.connection.status$.pipe('), 'catalogue refreshes after reconnect');
  assert.ok(client.includes("filter(status => status === 'ready' || status === 'offline')"));
});
