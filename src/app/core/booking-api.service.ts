import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminStats, Booking, BookingPage, BookingRequest, BookingStatus, CartItem, EventDraft, SavedBooking, ServiceItem } from './models';
import { DEMO_SERVICES } from './demo-data';
import { servicePhotoFor } from './service-photos';
import { todayIso } from './format';

const CART_KEY = 'gkc_cart';
const EVENT_KEY = 'gkc_event';
const SAVED_KEY = 'gkc_my_bookings';

// Browsers can refuse storage (private windows, blocked cookies): the site must still work without it.
function readJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function writeJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function defaultEvent(): EventDraft {
  return { type: 'Kiddies Party', date: '', startTime: '10:00', endTime: '16:00', guestCount: 20, location: '', notes: '' };
}

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  private cartSubject = new BehaviorSubject<CartItem[]>(this.restoreCart());
  cart$ = this.cartSubject.asObservable();
  cart = signal<CartItem[]>(this.cartSubject.value);
  /** The event (date, time, type, number of kids...) shared by everything in the cart. */
  event = signal<EventDraft>(this.restoreEvent());
  /** Bookings made from this device, remembered for the "My Bookings" page. */
  saved = signal<SavedBooking[]>(readJson<SavedBooking[]>(SAVED_KEY, []).filter(s => s?.reference && s?.email));
  catalogOffline = signal(false);
  services$ = this.http.get<ServiceItem[]>(`${this.url}/services`).pipe(
    map(items => items.map(item => ({ ...item, image: servicePhotoFor(item) }))),
    tap(() => this.catalogOffline.set(false)),
    catchError(() => { this.catalogOffline.set(true); return of(DEMO_SERVICES); })
  );

  private restoreCart(): CartItem[] {
    const arr = readJson<CartItem[]>(CART_KEY, []);
    return Array.isArray(arr) ? arr.filter((i: CartItem) => i?.service?.slug && i.quantity > 0).map((i: CartItem) => ({ ...i, service: { ...i.service, image: servicePhotoFor(i.service) } })) : [];
  }
  private restoreEvent(): EventDraft {
    const saved = { ...defaultEvent(), ...readJson<Partial<EventDraft>>(EVENT_KEY, {}) };
    if (saved.date && saved.date < todayIso()) saved.date = ''; // a date in the past is no use to anyone
    return saved;
  }
  private updateCart(items: CartItem[]) { this.cartSubject.next(items); this.cart.set(items); writeJson(CART_KEY, items); }

  add(service: ServiceItem, mode = service.modes[0], quantity = 1): void {
    if (!mode || !service.modes.includes(mode)) return;
    const items = [...this.cartSubject.value];
    const existing = items.find(x => x.service.slug === service.slug && x.mode === mode);
    if (existing) existing.quantity = Math.min(service.stock, existing.quantity + quantity);
    else items.push({ service, mode, quantity: Math.min(service.stock, quantity) });
    this.updateCart(items);
  }
  quantity(index: number, change: number) {
    const items = [...this.cartSubject.value];
    if (!items[index]) return;
    items[index] = { ...items[index], quantity: Math.max(1, Math.min(items[index].service.stock, items[index].quantity + change)) };
    this.updateCart(items);
  }
  setQuantity(index: number, quantity: number) {
    const items = [...this.cartSubject.value];
    if (!items[index]) return;
    items[index] = { ...items[index], quantity: Math.max(1, Math.min(items[index].service.stock, Math.round(quantity))) };
    this.updateCart(items);
  }
  remove(index: number) { this.updateCart(this.cartSubject.value.filter((_, i) => i !== index)); }
  clear() { this.updateCart([]); }
  totalKnown(items = this.cartSubject.value) { return items.every(i => i.service.price !== null); }
  total(items = this.cartSubject.value) { return items.reduce((s, i) => s + (i.service.price ?? 0) * i.quantity, 0); }

  setEvent(patch: Partial<EventDraft>) {
    const next = { ...this.event(), ...patch };
    this.event.set(next);
    writeJson(EVENT_KEY, next);
  }
  resetEvent() { this.event.set(defaultEvent()); writeJson(EVENT_KEY, defaultEvent()); }

  rememberBooking(reference: string, email: string, snapshot?: Booking) {
    const others = this.saved().filter(s => s.reference !== reference);
    const next = [{ reference, email: email.trim().toLowerCase(), snapshot }, ...others].slice(0, 50);
    this.saved.set(next);
    writeJson(SAVED_KEY, next);
  }
  /** Keeps the latest copy of a booking next to its reference, so it can still be shown if the API is asleep. */
  updateSnapshot(reference: string, snapshot: Booking) {
    const next = this.saved().map(s => s.reference === reference ? { ...s, snapshot } : s);
    this.saved.set(next);
    writeJson(SAVED_KEY, next);
  }
  forgetBooking(reference: string) {
    const next = this.saved().filter(s => s.reference !== reference);
    this.saved.set(next);
    writeJson(SAVED_KEY, next);
  }

  sendBooking(data: BookingRequest) { return this.http.post<{ reference: string; status: string; message: string }>(`${this.url}/bookings`, data); }
  track(reference: string, email: string) { return this.http.get<Booking>(`${this.url}/bookings/track`, { params: { reference, email } }); }

  private auth() { return { headers: new HttpHeaders({ Authorization: `Bearer ${sessionStorage.getItem('gkc_admin_token') || ''}` }) }; }
  login(email: string, password: string) { return this.http.post<{ token: string }>(`${this.url}/admin/login`, { email, password }).pipe(tap(r => sessionStorage.setItem('gkc_admin_token', r.token))); }
  loggedIn() { return !!sessionStorage.getItem('gkc_admin_token'); }
  logout() { sessionStorage.removeItem('gkc_admin_token'); }
  adminStats() { return this.http.get<AdminStats>(`${this.url}/admin/stats`, this.auth()); }
  adminCalendar(month: string) { return this.http.get<{ month: string; items: Booking[] }>(`${this.url}/admin/calendar`, { ...this.auth(), params: { month } }); }
  adminBookings(status?: string, page = 1) { return this.http.get<BookingPage>(`${this.url}/admin/bookings`, { ...this.auth(), params: status ? { status, page } : { page } }); }
  adminUpdate(id: string, status: BookingStatus) { return this.http.patch<Booking>(`${this.url}/admin/bookings/${id}/status`, { status }, this.auth()); }
  adminServices() { return this.http.get<ServiceItem[]>(`${this.url}/admin/services`, this.auth()); }
  adminSave(service: ServiceItem) { return this.http.patch<ServiceItem>(`${this.url}/admin/services/${service._id}`, service, this.auth()); }
}
