/**
 * Fixed website content. The business's contact details are NOT here: the owner enters them in the admin area
 * (Settings > Contact details) and the Contact page reads them from the API.
 */

/**
 * The six "Perfect for Every Occasion" tiles. A tile with a `photo` shows it; one without shows a colourful emoji tile.
 */
export interface Occasion { label: string; emoji: string; tint: string; photo?: string; }
export const OCCASIONS: Occasion[] = [
  { label: 'Kiddies Parties', emoji: '🎂', tint: 'linear-gradient(135deg,#ffd1e6,#ffe9a8)', photo: '/assets/images/occasions/kiddies-parties-sm.webp' },
  { label: 'Family Days', emoji: '👨‍👩‍👧', tint: 'linear-gradient(135deg,#c9e6ff,#d7ffe9)', photo: '/assets/images/occasions/family-days-sm.webp' },
  { label: 'Graduations', emoji: '🎓', tint: 'linear-gradient(135deg,#d9d4ff,#c6ecff)', photo: '/assets/images/occasions/graduations-sm.webp' },
  { label: 'School Events', emoji: '🏫', tint: 'linear-gradient(135deg,#ffe2c2,#ffd1d1)', photo: '/assets/images/occasions/school-events-sm.webp' },
  { label: 'Community Events', emoji: '🎪', tint: 'linear-gradient(135deg,#ffd6f0,#d5e1ff)', photo: '/assets/images/occasions/community-events-sm.webp' },
  { label: 'Church Events', emoji: '⛪', tint: 'linear-gradient(135deg,#d2f4e4,#e9e0ff)', photo: '/assets/images/occasions/church-events-sm.webp' }
];

/** Extra pictures on the Gallery page, after the service photos. */
export const GALLERY_EXTRAS: { label: string; src: string }[] = [
  { label: 'Kiddies Parties', src: '/assets/images/occasions/kiddies-parties-md.webp' },
  { label: 'Family Days', src: '/assets/images/occasions/family-days-md.webp' },
  { label: 'Graduations', src: '/assets/images/occasions/graduations-md.webp' },
  { label: 'School Events', src: '/assets/images/occasions/school-events-md.webp' },
  { label: 'Community Events', src: '/assets/images/occasions/community-events-md.webp' },
  { label: 'Church Events', src: '/assets/images/occasions/church-events-md.webp' }
];

/** Emoji for the round shortcut icons on the homepage, by service slug. */
export const SERVICE_EMOJI: Record<string, string> = {
  'mascot-characters': '🐻',
  'jumping-castles': '🏰',
  'slush-machine': '🥤',
  'ice-cream-machine': '🍦',
  'face-painting': '🎨',
  'stall-sales-service': '🎪',
  'popcorn-machine': '🍿',
  'candy-floss-machine': '🍭'
};

/** Offline fallback only. The live homepage and booking form now read occasions from MongoDB. */
import type { OccasionItem, OccasionTheme } from './models';
export const OCCASION_BACKGROUNDS: Record<OccasionTheme,string> = {
  pink:'linear-gradient(135deg,#ffd1e6,#ffe9a8)',
  blue:'linear-gradient(135deg,#c9e6ff,#d7ffe9)',
  purple:'linear-gradient(135deg,#d9d4ff,#c6ecff)',
  orange:'linear-gradient(135deg,#ffe2c2,#ffd1d1)',
  mint:'linear-gradient(135deg,#d2f4e4,#e9e0ff)',
  yellow:'linear-gradient(135deg,#fff1b5,#ffdcf0)'
};
export const DEFAULT_OCCASIONS:OccasionItem[]=OCCASIONS.map((occasion,index)=>({
  _id:'default-'+index,
  slug:['kiddies-parties','family-days','graduations','school-events','community-events','church-events'][index],
  name:['Kiddies Party','Family Day','Graduation','School Event','Community Event','Church Event'][index],
  label:occasion.label,emoji:occasion.emoji,
  theme:(['pink','blue','purple','orange','pink','mint'] as OccasionTheme[])[index],
  photo:occasion.photo||'', active:true,sortOrder:(index+1)*10
}));
