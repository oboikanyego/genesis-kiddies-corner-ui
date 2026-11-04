export type BookingMode = 'rental' | 'staffed' | 'stall';
export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
export interface ServiceItem {
  _id: string;
  slug: string;
  name: string;
  /** Short text for the services list cards (falls back to the description). */
  summary?: string;
  description: string;
  category: string;
  image: string;
  /** Extra photos for the details page gallery. */
  gallery?: string[];
  price: number | null;
  unit: string;
  modes: BookingMode[];
  stock: number;
  active: boolean;
  featured: boolean;
  /** Only shown when the owner has entered a real rating and review count. */
  rating?: number | null;
  reviewCount?: number;
  sortOrder?: number;
  includes: string[];
  blockedDates: string[];
}
export interface CartItem { service: ServiceItem; quantity: number; mode: BookingMode; }
/** The event the customer is booking for. One booking = one event, shared by every item in the cart. */
export interface EventDraft { type: string; date: string; startTime: string; endTime: string; guestCount: number; location: string; notes: string; }
export interface BookingRequest {
  customer: { name: string; email: string; phone: string };
  event: { type: string; date: string; startTime: string; endTime: string; location: string; guestCount: number; notes: string };
  items: { serviceId: string; quantity: number; mode: BookingMode }[];
}
export interface Booking {
  _id: string;
  reference: string;
  customer?: { name: string; email: string; phone: string };
  event: BookingRequest['event'];
  items: { serviceId: string; name: string; quantity: number; mode: BookingMode; unitPrice: number | null }[];
  amount: number | null;
  status: BookingStatus;
  adminNotes?: string;
  createdAt: string;
}
export interface BookingPage { items: Booking[]; total: number; page: number; pages: number; }
/** A booking this device made (or looked up), remembered so "My Bookings" works without a login. */
export interface SavedBooking { reference: string; email: string; snapshot?: Booking; }
export interface AdminStats {
  total: number; pending: number; confirmed: number; completed: number; declined: number;
  /** Missing when talking to an older API version. */
  cancelled?: number;
  recent: Booking[];
  upcoming?: Booking[];
}
/** The contact details the owner enters in Admin > Settings. An empty string means "not set", and it is not shown on the website. */
export interface ContactDetails { phone: string; whatsapp: string; email: string; area: string; }
export const EMPTY_CONTACT: ContactDetails = { phone: '', whatsapp: '', email: '', area: '' };
export const EVENT_TYPES = ['Kiddies Party','Family Day','Graduation','School Event','Community Event','Church Event','Other'];
export const MODE_LABELS: Record<BookingMode, string> = { rental: 'Equipment rental', staffed: 'Staffed service', stall: 'Set up a stall' };
/** Every half hour from 06:00 to 22:00, for the start/end time drop-downs. */
export const TIME_SLOTS: string[] = Array.from({ length: 33 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});
