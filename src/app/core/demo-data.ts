import { BookingMode, ServiceItem } from './models';
import { servicePhotoFor } from './service-photos';

// Display-only fallback when the API is offline. Booking submission still requires the API.
// The text and prices are copied word for word from the approved design and must stay in step with
// genesis-kiddies-corner-api/src/lib/serviceContent.ts.
interface DemoDef { slug: string; name: string; summary: string; description: string; category: string; price: number | null; unit: string; modes: BookingMode[]; includes: string[]; }
const defs: DemoDef[] = [
  { slug: 'mascot-characters', name: 'Mascot Characters', summary: 'Popular characters to entertain the kids.', description: 'Bring favourite playful characters to your celebration for photos, dancing and smiles.', category: 'Entertainment', price: 1200, unit: 'event', modes: ['staffed'], includes: ['Costumed entertainer', 'Meet and greet', 'Photo opportunities'] },
  { slug: 'jumping-castles', name: 'Jumping Castles', summary: 'Fun and safe jumping castles for all ages.', description: 'Fun, safe and colourful jumping castles perfect for kiddies parties, school events, family days and more.', category: 'Equipment', price: 1500, unit: 'day', modes: ['rental', 'staffed'], includes: ['Setup and take down', 'Safe and clean equipment', 'Suitable for different age groups', 'Unlimited use during your event'] },
  { slug: 'slush-machine', name: 'Slush Machine', summary: 'Refreshing slush drinks for any event.', description: 'Keep the party cool with refreshing frozen slush treats for children and families.', category: 'Treats', price: 1000, unit: 'event', modes: ['rental', 'staffed', 'stall'], includes: ['Slush machine', 'Serving options on request'] },
  { slug: 'ice-cream-machine', name: 'Ice Cream Machine', summary: 'Delicious soft serve ice cream for your event.', description: 'Serve delicious soft-serve ice cream at school functions and special celebrations.', category: 'Treats', price: 1000, unit: 'event', modes: ['rental', 'staffed', 'stall'], includes: ['Ice cream machine', 'Serving options on request'] },
  { slug: 'face-painting', name: 'Face Painting', summary: 'Creative and colourful face painting.', description: 'Friendly face painters create beautiful, imaginative looks for children.', category: 'Entertainment', price: 800, unit: 'event', modes: ['staffed'], includes: ['Face painter', 'Child-friendly designs', 'Hygienic supplies'] },
  { slug: 'stall-sales-service', name: 'Stall & Sales Service', summary: 'We come to your event and set up a stall (unlimited service options).', description: 'We come to your event and set up a stall (unlimited service options).', category: 'Stalls', price: 2500, unit: 'event', modes: ['stall'], includes: ['We come to your event', 'We set up a stall for you', 'Unlimited service options'] },
  // Not in the approved design, but shown after its six services (no price yet: "Price on request").
  { slug: 'popcorn-machine', name: 'Popcorn Machine', summary: 'Freshly popped popcorn for any event.', description: 'Freshly popped popcorn adds a fun cinema-style touch to any event.', category: 'Treats', price: null, unit: 'event', modes: ['rental', 'staffed', 'stall'], includes: ['Popcorn machine', 'Serving options on request'] },
  { slug: 'candy-floss-machine', name: 'Candy Floss Machine', summary: 'Fluffy and colourful candy floss.', description: 'Fluffy and colourful candy floss for a sweet carnival experience.', category: 'Treats', price: null, unit: 'event', modes: ['rental', 'staffed', 'stall'], includes: ['Candy floss machine', 'Serving options on request'] }
];
export const DEMO_SERVICES: ServiceItem[] = defs.map((d, i) => ({
  _id: `demo-${i}`, slug: d.slug, name: d.name, summary: d.summary, description: d.description, category: d.category,
  image: servicePhotoFor({ slug: d.slug, image: '' }), price: d.price, unit: d.unit, modes: d.modes, stock: 1, active: true, featured: true,
  rating: null, reviewCount: 0, sortOrder: (i + 1) * 10, blockedDates: [], includes: d.includes
}));
