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
- **My Bookings** has no login: bookings made on a device are remembered in that browser (reference + email) and their status is refreshed from the API. A booking made elsewhere can be added with *Find a booking made on another device*: either with the **email address and mobile number** the customer booked with (both must match; it finds every booking made that way, however the number was written) or with the booking reference and email.
- **Owner's search**: in Admin → Bookings, the search box above the list finds bookings by customer name, email, phone number (typed any way: `082 123 4567`, `+27 82 123 4567`, ...) or booking reference. It works together with the status filter, waits for a pause in typing, and shows how many bookings match. `npm run test:booking-search` covers it.
- Booking references look like `GKC-20261115-001` (event date + running number).
- **Spam protection** on the booking form: when the booking page opens it asks the API for a short-lived form token and sends it back with the request, together with a hidden "website" box that people never see or reach with the keyboard (`.hp-field`). If a form is filled in faster than about 3 seconds the page waits out the rest by itself, and an old or missing token is replaced automatically, once. A refused request shows the API's own message, for example when too many requests came from one connection. The mobile number must look like a phone number. Pressing Submit twice sends only one request. See **Spam protection** in the API README; `npm run test:booking-guard` covers the form side.
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
`npm run test:env`, `test:scroll`, `test:admin-mobile`, `test:admin-login`, `test:blocked-dates`, `test:photos`, `test:design`, `test:format`, `test:brand`, `test:contact`, `test:booking-guard`, `test:booking-search`, `test:touch-zoom` and `npm run typecheck` all run in CI (`.github/workflows/verify.yml`).

## Scrolling and page layout

Ionic's base stylesheet fixes the document body. The application therefore uses an
explicit `.site-scroll` viewport-sized native scrolling container inside `ion-app`.
The bottom mobile navigation is a sibling outside that container. Route transitions
reset the scroll host to the top, including the service detail page at
`/services/jumping-castles`. Check scrolling with both a mouse wheel and touch gestures
on mobile; `npm run test:scroll` protects the required DOM and CSS invariants.

## Zooming on phones and tablets

Two rules in `src/styles.scss` keep the page from zooming in and getting stuck:

- **Text boxes are 16px on touch screens.** iPhone and iPad Safari zoom the whole page in when
  a text box with text smaller than 16px is tapped, and do not zoom back out. Section 18 of the
  stylesheet sets `font-size: 16px` on every text box, select and text area on any touch screen
  (`any-pointer: coarse`, which includes a phone held sideways and an iPad) and in narrow windows
  (up to 899px). Computers with a mouse keep the compact sizes. Do not work around it per field,
  and never "fix" the zoom with `user-scalable=no` or `maximum-scale` in `index.html`: that takes
  pinch zoom away from people who need it.
- **Pinch zoom is never blocked.** The page and the scroll area use `touch-action: manipulation`
  (scroll, pinch and pan work; only double-tap zoom is off). `touch-action: pan-y` (or `none`)
  forbids pinching, so a page the phone had zoomed in could not be zoomed back out.

`npm run test:touch-zoom` protects both. It cannot run an iPhone: after changing form styles,
tap a field on a real iPhone or iPad as well.


## Configure occasions in the admin dashboard
Sign in at `/admin` → **Services** → **Occasions we cater for**. Click **+ Add occasion** to provide a public title, booking event type, emoji, colour theme and order. After creating, upload a JPG/PNG/WebP picture using **Change picture**, preview it and press **Save changes**. Edit any existing tile, change its display order, or uncheck **Show on homepage and booking form** to hide it. Hiding does not delete past booking records. The homepage, Gallery and booking event-type dropdown are connected to the same active occasions in the API, rather than static lists. `Other` remains available for special events. Images are resized on the device and stored by the API in MongoDB, with no new paid integration.

## Brand logo from the client's own MongoDB
The header, homepage, owner sidebar and admin login now fetch the **primary logo** from `<API_URL>/branding/logo` (a public PNG served by the backend's MongoDB `brandassets` collection). The original static logo is retained in the repository only as a build-time/hand-over asset, not as the displayed source. Browser favicons and PWA icons remain static files, as they must be available before Angular starts.

For the client's own Netlify account, set `API_URL=https://YOUR_CLIENT_RENDER_SERVICE.onrender.com/api` in Netlify Environment and redeploy. This automatically changes logo requests and other API calls to the client's backend and MongoDB. The matching backend must have already seeded its `primary-logo` asset. Avoid hardcoding the previous Netlify or Cloudinary asset URLs.


### Business-owner logo management

**Admin → Settings → Business logo** now lets the client upload their own transparent PNG (less than 1 MB). The upload uses the admin's token and the Render endpoint `PUT /api/admin/branding/logo`, which stores the image in the MongoDB `brandassets` record already used by the website and email notices. The UI refreshes the branded image after saving, without relying on Cloudinary or deploying new Netlify assets.

Client handover: use the client's Netlify site with `API_URL` set to their new Render endpoint (including `/api`), point Render at the client's MongoDB, set `PUBLIC_SITE_URL` and `CORS_ORIGINS` for the client domain, and set the client's own Resend credentials. The backend bundles the initial official logo for fresh databases. Existing bookings, photos, prices, owner settings and other database data need to be migrated separately. Static favicons/PWA icons still live in the UI repository.
