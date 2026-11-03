import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';
import { ServicesPage } from './pages/services.page';
import { DetailPage } from './pages/detail.page';
import { CartPage } from './pages/cart.page';
import { BookingPageComponent } from './pages/booking.page';
import { SuccessPage } from './pages/success.page';
import { MyBookingsPage } from './pages/my-bookings.page';
import { AboutPage, ContactPage, GalleryPage, MorePage } from './pages/info.pages';
import { AdminPage } from './pages/admin.page';
export const routes: Routes = [
  { path: '', component: HomePage, title: 'Home | The Genesis Kiddies Corner' },
  { path: 'services', component: ServicesPage, title: 'Our Services | Genesis Kiddies Corner' },
  { path: 'services/:slug', component: DetailPage, title: 'Service Details | Genesis Kiddies Corner' },
  { path: 'cart', component: CartPage, title: 'Your Booking | Genesis Kiddies Corner' },
  { path: 'book', component: BookingPageComponent, title: 'Booking Details | Genesis Kiddies Corner' },
  { path: 'confirmation/:reference', component: SuccessPage, title: 'Booking Request Submitted | Genesis Kiddies Corner' },
  { path: 'my-bookings', component: MyBookingsPage, title: 'My Bookings | Genesis Kiddies Corner' },
  { path: 'about', component: AboutPage, title: 'About | Genesis Kiddies Corner' },
  { path: 'gallery', component: GalleryPage, title: 'Gallery | Genesis Kiddies Corner' },
  { path: 'contact', component: ContactPage, title: 'Contact | Genesis Kiddies Corner' },
  { path: 'more', component: MorePage, title: 'More | Genesis Kiddies Corner' },
  { path: 'admin', component: AdminPage, title: 'Admin | Genesis Kiddies Corner' },
  { path: '**', redirectTo: '' }
];
