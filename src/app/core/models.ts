export type BookingMode = 'rental' | 'staffed' | 'stall';
export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
export interface ServiceItem {
  _id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number | null;
  unit: string;
  modes: BookingMode[];
  stock: number;
  active: boolean;
  featured: boolean;
  includes: string[];
  blockedDates: string[];
}
export interface CartItem { service: ServiceItem; quantity: number; mode: BookingMode; }
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
export const EVENT_TYPES = ['Kiddies Party','Family Day','Graduation','School Event','Community Event','Church Event','Other'];
export const MODE_LABELS: Record<BookingMode, string> = { rental: 'Equipment rental', staffed: 'Staffed service', stall: 'Set up a stall' };
