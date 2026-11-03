# The Genesis Kiddies Corner — Ionic + Angular UI

Responsive **desktop + mobile customer booking website and owner dashboard**, matching the supplied bright pink/blue/yellow concepts. The backend lives separately in `genesis-kiddies-corner-api`.

## Included screens
1. Homepage with illustrated hero, seven service shortcuts, popular services, event types
2. Services catalogue with categories and search
3. Service details with rental / staffed / stall modes and quantity selection
4. Booking cart: combine multiple items, adjust quantities
5. Booking form: event type, date/time, venue, guest count, notes, name, email and phone
6. Confirmation screen with unique booking reference
7. Booking tracker (reference + customer email, no login needed)
8. Admin login, dashboard, event calendar, booking approvals and service pricing/stock/blocked dates

## Run locally
1. `npm install` (requires Node.js >=20.19; Angular 20 and Ionic 8).
2. Update `src/environments/environment.ts` only if your API isn't on `http://localhost:10000/api`.
3. `npm start` → `http://localhost:4200`.
4. Run the separate backend and its `npm run seed` command against MongoDB Atlas.
5. Admin area: `/admin`. The credentials are `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured on the backend. They are never hardcoded in frontend.

## Netlify deployment
1. Set the real Render backend address in `src/environments/environment.production.ts`: `https://YOUR-RENDER-SERVICE.onrender.com/api`.
2. Commit that change, then connect this repo to Netlify.
3. Build command: `npm run build`; publish directory: `dist/genesis-kiddies-corner-ui/browser`.
4. Add your exact Netlify URL to API `CORS_ORIGINS` (comma-separated if multiple origins).
5. `netlify.toml` includes SPA fallback navigation. Deploy to Netlify Free within its usage limits.

## How booking works
- The user can browse services and add several choices to the cart, then submit one booking request.
- Requests initially remain **pending** and do not reserve availability until manually confirmed by the owner.
- The admin approves or declines the request. Confirmation verifies whether confirmed bookings already occupy equipment/stock for overlapping time windows.
- `price: null` is deliberate until the business owner sets real prices; the UI shows **Price on request**. No card payments or WhatsApp integration.
- The UI will display a **catalogue preview** if the API is offline; submitting bookings requires a running backend.

## Assets
All seven service illustrations are original SVG graphics in `src/assets/illustrations`, so no third-party image service or paid asset licence is required. Replace them with client-provided photos later if desired.

## Scope
MVP deliberately excludes online payments, customer sign-ups, messaging, analytics, invoicing and unnecessary integrations. Admin is a single owner account configured by environment variables.
