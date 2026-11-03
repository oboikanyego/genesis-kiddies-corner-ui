import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';
import { ServicesPage } from './pages/services.page';
import { DetailPage } from './pages/detail.page';
import { CartPage } from './pages/cart.page';
import { BookingPageComponent } from './pages/booking.page';
import { SuccessPage } from './pages/success.page';
import { TrackPage } from './pages/track.page';
import { AdminPage } from './pages/admin.page';
export const routes: Routes = [
  { path: '', component: HomePage, title: 'Home | The Genesis Kiddies Corner' },
  { path: 'services', component: ServicesPage, title: 'Our Services | Genesis Kiddies Corner' },
  { path: 'services/:slug', component: DetailPage, title: 'Service Details | Genesis Kiddies Corner' },
  { path: 'cart', component: CartPage, title: 'Your Booking | Genesis Kiddies Corner' },
  { path: 'book', component: BookingPageComponent, title: 'Complete Your Booking | Genesis Kiddies Corner' },
  { path: 'confirmation/:reference', component: SuccessPage, title: 'Booking Received | Genesis Kiddies Corner' },
  { path: 'my-bookings', component: TrackPage, title: 'Track Booking | Genesis Kiddies Corner' },
  { path: 'admin', component: AdminPage, title: 'Admin | Genesis Kiddies Corner' },
  { path: '**', redirectTo: '' }
];
