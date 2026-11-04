# The Genesis Kiddies Corner — Ionic + Angular UI

Responsive **desktop + mobile customer booking website and owner dashboard**, built to follow the approved design (17 screens: desktop and phone). The backend lives separately in `genesis-kiddies-corner-api`.

## Included screens
Customer site (desktop and phone):
1. **Homepage** — "Making Every Event Extra Special" hero, service shortcuts, *Perfect for Every Occasion*
2. **Our Services** — the design's six services with "From R…" prices and *View Details*, followed by the Popcorn Machine and the Candy Floss Machine (*Price on request* until you set a price)
3. **Service Details** — photo, price per day/event, *What's Included* and the *Book This Service* panel (event date, start/end time, event type, number of kids → *Add to Booking*). On phones the panel opens as its own *Book This Service* screen
4. **Your Booking** (cart) — items with date/time, quantity, remove, *Estimated Total*, *Proceed to Booking*
5. **Booking Details** — 3 steps: *Event Details*, *Customer Details*, *Review & Submit*
6. **Booking Request Submitted!** — confirmation with the booking reference (copy button)
7. **My Bookings** — *Upcoming* / *Past*, status chips (Pending, Confirmed, Cancelled…) and *View Details*
8. About, Gallery, Contact (and *More* on phones)

Owner area (`/admin`): sign in, **Dashboard** (Total / Pending / Confirmed / Cancelled, Upcoming Bookings, month calendar), **Bookings** (approve / decline / complete / cancel), **Calendar**, **Services** (price, stock, blocked dates, show/hide) and **Settings**.

## Run locally
1. `npm install` (requires Node.js >=20.19; Angular 20 and Ionic 8).
2. Update `src/environments/environment.ts` only if your API isn't on `http://localhost:10000/api`.
3. `npm start` → `http://localhost:4200`.
4. Run the separate backend (it adds the six services by itself when it starts).
5. Admin area: `/admin`. The credentials are `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured on the backend. They are never hardcoded in frontend.

## Netlify deployment
1. Connect this GitHub repository to the existing Netlify site with branch `main`.
2. In Netlify → **Environment variables**, set **`API_URL`** to your Render backend URL (e.g. `https://genesis-kiddies-corner-api.onrender.com/api`), with Build scope. `NG_APP_API_URL` also works as a fallback; `API_URL` wins if both exist.
3. Build command: `npm run build`; publish directory: `dist/genesis-kiddies-corner-ui/browser` (configured in `netlify.toml`).
4. `prebuild` validates the variable and generates `src/environments/generated-environment.production.ts` at build time. The generated file is gitignored; the backend address is no longer hardcoded into the Angular production source.
5. Update the API's `CORS_ORIGINS` to include the exact Netlify domain.
6. **Redeploy after changing API_URL**, because Angular bundles this public value into static JavaScript. Do not put secrets in frontend environment variables.

For a local production build: `API_URL=https://your-backend.onrender.com/api npm run build`. Local `npm start` continues to use `http://localhost:10000/api` from `environment.ts`.
Run `npm run test:env` to test the configuration generator.

## How booking works
- The customer browses services and, on a service page, chooses the event date, times, event type and number of kids, then taps **Add to Booking**. One booking is for **one event**, so the event details are shared by everything in the cart.
- **Booking Details** collects the event details, then the customer's name, mobile number and email, then shows a review before the request is sent.
- Requests initially remain **pending** and do not reserve availability until manually confirmed by the owner.
- The admin approves or declines the request. Confirmation verifies whether confirmed bookings already occupy equipment/stock for overlapping time windows.
- **My Bookings** has no login: bookings made on a device are remembered in that browser (reference + email) and their status is refreshed from the API. A booking made elsewhere can be added with *Find a booking made on another device*.
- Booking references look like `GKC-20261115-001` (event date + running number).
- The UI will display a **catalogue preview** (the same eight services) if the API is offline; submitting bookings requires a running backend.

## Text, prices and photos
- **Service names, texts and prices** come from the API (`genesis-kiddies-corner-api/src/lib/serviceContent.ts`, copied from the design). The offline preview in `src/app/core/demo-data.ts` has the same text. `npm run test:design` fails if the approved texts are changed by accident.
- **Review stars** ("4.9 (28 reviews)") are only shown when the owner has entered a real rating and review count for a service. No invented reviews are shown.
- **Pictures** that came with the design are in `src/assets/images` (homepage banner, the services, all six occasions and the round shortcut icons), each in light WebP sizes: `-lg` for the details page, `-md` for cards, `-sm` for thumbnails. They are AI-generated illustrations, not photographs of your own equipment, so the site labels them *Illustrative image* and says the exact equipment is confirmed by the owner. See `SERVICE_PHOTO_SOURCES.md` and `src/assets/images/README.md`.
- **Using your own photos**: an image you have chosen for a service in the database is never replaced. To change a design picture for everyone, overwrite the files with the same names.
- **Occasion pictures**: all six *Perfect for Every Occasion* tiles have a picture. To use a different one, overwrite its file in `src/assets/images/occasions/` (same name) or change its path in `src/app/core/site-config.ts`. A tile without a picture falls back to a coloured emoji tile.
- **Popcorn Machine and Candy Floss Machine** are shown after the design's six services, with their own pictures, and read *Price on request* until you enter a price in Admin → Services. The homepage keeps the design's six round shortcuts. To hide either one, untick *Show service to customers* in Admin → Services; it then stays hidden.
- **Homepage banner**: `src/assets/images/hero/` (`HERO_IMAGES` in `src/app/core/service-photos.ts`).
- **Contact details** are entered by the owner in the website itself, not in the code: **sign in at `/admin` → Settings → Contact details** (phone number, WhatsApp number, email, area we serve) and press *Save contact details*. They show on the **Contact page** straight away (*View the Contact page* opens it). A box left empty is not shown, the phone and WhatsApp numbers become tap-to-call and tap-to-chat links, and wrong values are refused with a message beside the box. The details are stored by the API (`GET /api/settings`), so nothing needs to be edited or redeployed.
- **Logo and icon**: the official logo, a badge with the tent, two children, the name and "Where The Fun Begins!" (header, phone homepage and owner sidebar), and the icon (browser tab, iPhone home-screen icon, app manifest and the owner sign-in card) are in `src/assets/images/brand/`, with `favicon.ico`, `apple-touch-icon.png` and `manifest.webmanifest` in `public/`. To change them, overwrite the files with the same names. If a new logo has a different shape, also update the `width`/`height` in `src/app/components/logo.component.ts` and the logo heights in `src/styles.scss`; `npm run test:brand` fails when the size attributes and the image files disagree.

## Scope
MVP deliberately excludes online payments, customer sign-ups, messaging, analytics, invoicing and unnecessary integrations. Admin is a single owner account configured by environment variables.

## Tests
`npm run test:env`, `test:scroll`, `test:admin-mobile`, `test:admin-login`, `test:blocked-dates`, `test:photos`, `test:design`, `test:format`, `test:brand` and `npm run typecheck` all run in CI (`.github/workflows/verify.yml`).

## Scrolling and page layout

Ionic's base stylesheet fixes the document body. The application therefore uses an
explicit `.site-scroll` viewport-sized native scrolling container inside `ion-app`.
The bottom mobile navigation is a sibling outside that container. Route transitions
reset the scroll host to the top, including the service detail page at
`/services/jumping-castles`. Check scrolling with both a mouse wheel and touch gestures
on mobile; `npm run test:scroll` protects the required DOM and CSS invariants.
