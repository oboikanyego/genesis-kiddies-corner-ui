# Site images

| Folder | What | File names |
|---|---|---|
| `services/` | One picture per service | `<service-slug>-lg.webp` (1448 px wide, details page), `-md.webp` (720 px, cards), `-sm.webp` (320 px, thumbnails) |
| `icons/` | Round shortcut icons on the homepage | `<service-slug>.webp` (160 × 160, shown in a circle) |
| `brand/` | The logo and icon | `logo-md.webp` (240 px wide, header) and `logo-lg.webp` (480 px, phone homepage / sharper screens); `icon-120.webp`, `favicon-64.png`, `icon-192.png`, `icon-512.png`. The favicon, iPhone icon and manifest are in `public/` |
| `hero/` | Homepage banner | `hero-1448.webp` (computers), `hero-800.webp` (phones) |
| `occasions/` | *Perfect for Every Occasion* tiles and the gallery | `<name>-md.webp` (720 px), `<name>-sm.webp` (320 px); names: `kiddies-parties`, `family-days`, `graduations`, `school-events`, `community-events` (`church-events` still to come) |

To replace a picture, overwrite the file with the same name (keep the 4:3 shape for `services/` and `occasions/`, and keep each file under the size limits checked by `npm run test:photos`).

These pictures are AI-generated illustrations supplied with the design, not photos of the owner's own equipment. See `SERVICE_PHOTO_SOURCES.md` in the project root.
