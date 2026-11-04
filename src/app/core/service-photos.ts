import type { ServiceItem } from './models';

/**
 * The design's own images, one per service. Each exists in three sizes: -lg (detail page), -md (cards) and -sm (thumbnails).
 * They live in src/assets/images/services and are illustrations, not photographs of the owner's own equipment.
 */
const designPhoto = (slug: string) => `/assets/images/services/${slug}-lg.webp`;
export const DESIGN_PHOTOS: Record<string, string> = {
  'mascot-characters': designPhoto('mascot-characters'),
  'jumping-castles': designPhoto('jumping-castles'),
  'slush-machine': designPhoto('slush-machine'),
  'ice-cream-machine': designPhoto('ice-cream-machine'),
  'face-painting': designPhoto('face-painting'),
  'popcorn-machine': designPhoto('popcorn-machine'),
  'candy-floss-machine': designPhoto('candy-floss-machine'),
  // Stall & Sales Service: stand-in (a crop of the popcorn stall) until the owner supplies an image of their own.
  'stall-sales-service': designPhoto('stall-sales-service')
};

/** Round icons for the homepage shortcuts (src/assets/images/icons). */
export const SERVICE_ICONS: Record<string, string> = Object.fromEntries(
  Object.keys(DESIGN_PHOTOS).map(slug => [slug, `/assets/images/icons/${slug}.webp`])
);

/** Homepage banner: a wide version for computers and a smaller one for phones. */
export const HERO_IMAGES = { desktop: '/assets/images/hero/hero-1448.webp', phone: '/assets/images/hero/hero-800.webp' };

// Earlier stand-in photos (licensed stock photography hosted on Cloudinary). The API may still store one of these as a
// service's image. They are replaced by the design's images above, but any other image chosen by the owner is kept.
export const STOCK_PHOTOS: Record<string, string> = {
  'mascot-characters': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713425/genesis-kiddies-corner/services/mascot-characters.jpg',
  'jumping-castles': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713430/genesis-kiddies-corner/services/jumping-castles.jpg',
  'slush-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713435/genesis-kiddies-corner/services/slush-machine.jpg',
  'ice-cream-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713441/genesis-kiddies-corner/services/ice-cream-machine.jpg',
  'popcorn-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713446/genesis-kiddies-corner/services/popcorn-machine.jpg',
  'candy-floss-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713308/genesis-kiddies-corner/services/candy-floss.jpg',
  'face-painting': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713453/genesis-kiddies-corner/services/face-painting.jpg',
  'stall-sales-service': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713308/genesis-kiddies-corner/services/candy-floss.jpg'
};
const STOCK_URLS = new Set(Object.values(STOCK_PHOTOS));

export type PhotoSize = 'sm' | 'md' | 'lg';
/** Picks the right size of one of our own images (…-lg.webp → …-sm.webp). Any other address is returned unchanged. */
export function photoSized(url: string, size: PhotoSize): string {
  return url.replace(/-(sm|md|lg)\.webp$/, `-${size}.webp`);
}

/**
 * The image to show for a service:
 *  - the design's image, when the API holds nothing, the original demo artwork or one of the earlier stock photos;
 *  - otherwise the image the owner chose, which is NEVER overwritten.
 */
export function servicePhotoFor(service: Pick<ServiceItem,'slug'|'image'>): string {
  const own = DESIGN_PHOTOS[service.slug];
  const image = service.image;
  const standIn = !image || image.startsWith('/assets/illustrations/') || image.startsWith('/assets/images/') || STOCK_URLS.has(image);
  if (own && standIn) return own;
  if (!image || image.startsWith('/assets/illustrations/')) return STOCK_PHOTOS[service.slug] ?? image;
  return image;
}
