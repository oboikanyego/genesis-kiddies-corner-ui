/**
 * Business details shown on the website.
 * Fill in the contact details below to show them on the Contact page; leave a value empty to hide it.
 */
export const SITE = {
  name: 'The Genesis Kiddies Corner',
  contact: {
    phone: '',     // e.g. '082 123 4567'
    whatsapp: '',  // e.g. '27821234567' (international format, no + or spaces)
    email: '',     // e.g. 'hello@example.com'
    area: ''       // e.g. 'Johannesburg and surrounds'
  }
};

/** The six "Perfect for Every Occasion" tiles. Add a `photo` URL to show a photograph instead of the colourful tile. */
export interface Occasion { label: string; emoji: string; tint: string; photo?: string; }
export const OCCASIONS: Occasion[] = [
  { label: 'Kiddies Parties', emoji: '🎂', tint: 'linear-gradient(135deg,#ffd1e6,#ffe9a8)' },
  { label: 'Family Days', emoji: '👨‍👩‍👧', tint: 'linear-gradient(135deg,#c9e6ff,#d7ffe9)' },
  { label: 'Graduations', emoji: '🎓', tint: 'linear-gradient(135deg,#d9d4ff,#c6ecff)' },
  { label: 'School Events', emoji: '🏫', tint: 'linear-gradient(135deg,#ffe2c2,#ffd1d1)' },
  { label: 'Community Events', emoji: '🎪', tint: 'linear-gradient(135deg,#ffd6f0,#d5e1ff)' },
  { label: 'Church Events', emoji: '⛪', tint: 'linear-gradient(135deg,#d2f4e4,#e9e0ff)' }
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
