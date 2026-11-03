import { ServiceItem } from './models';

// Licensed stock photography, hosted for stable delivery. These are reference
// photos, not photographs of the owner's exact inventory.
export const SERVICE_PHOTOS: Record<string, string> = {
  'mascot-characters': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713425/genesis-kiddies-corner/services/mascot-characters.jpg',
  'jumping-castles': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713430/genesis-kiddies-corner/services/jumping-castles.jpg',
  'slush-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713435/genesis-kiddies-corner/services/slush-machine.jpg',
  'ice-cream-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713441/genesis-kiddies-corner/services/ice-cream-machine.jpg',
  'popcorn-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713446/genesis-kiddies-corner/services/popcorn-machine.jpg',
  'candy-floss-machine': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713308/genesis-kiddies-corner/services/candy-floss.jpg',
  'face-painting': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713453/genesis-kiddies-corner/services/face-painting.jpg',
  // Stall & Sales Service: stand-in photo (a colourful party stall) until the owner supplies their own.
  'stall-sales-service': 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713308/genesis-kiddies-corner/services/candy-floss.jpg'
};

/** Homepage banner photo (a decorated party setup). */
export const HERO_PHOTO = 'https://res.cloudinary.com/dv2hhefed/image/upload/v1793713618/genesis-kiddies-corner/hero/party-setup.jpg';

// Protects legacy carts and API records that still contain the original demo SVGs,
// but NEVER overwrites a custom image URL selected by the owner.
export function servicePhotoFor(service: Pick<ServiceItem,'slug'|'image'>): string {
  const photo = SERVICE_PHOTOS[service.slug];
  if (!service.image || service.image.startsWith('/assets/illustrations/')) {
    return photo ?? service.image;
  }
  return service.image;
}
