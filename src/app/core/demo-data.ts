import { ServiceItem } from './models';
import { servicePhotoFor } from './service-photos';
// Display-only fallback when the API is offline. Booking submission still requires the API.
const defs: [string,string,string,string,string,('rental'|'staffed'|'stall')[]][] = [
  ['mascot-characters','Mascot Characters','Playful character visits, dancing and photo moments.','Entertainment','mascot',['staffed']],
  ['jumping-castles','Jumping Castles','Bright, fun jumping castles for unforgettable parties.','Equipment','castle',['rental','staffed']],
  ['slush-machine','Slush Machine','Colourful icy slush drinks to cool down the fun.','Treats','slush',['rental','staffed','stall']],
  ['ice-cream-machine','Ice Cream Machine','Sweet soft-serve moments for kids and grown-ups.','Treats','ice-cream',['rental','staffed','stall']],
  ['popcorn-machine','Popcorn Machine','Fresh popcorn for that festive carnival feeling.','Treats','popcorn',['rental','staffed','stall']],
  ['candy-floss-machine','Candy Floss Machine','Fluffy clouds of sugar in your favourite colours.','Treats','candy-floss',['rental','staffed','stall']],
  ['face-painting','Face Painting','Beautiful face painting to bring imaginations to life.','Entertainment','face-paint',['staffed']]
];
export const DEMO_SERVICES: ServiceItem[] = defs.map(([slug,name,description,category,img,modes],i)=>({ _id: `demo-${i}`, slug, name, description, category, image: servicePhotoFor({slug, image: `/assets/illustrations/${img}.svg`}), price:null, unit:'event', modes, stock:1, active:true, featured:true, blockedDates:[], includes: ['Fun for special occasions','Suitable for school and community events','Professional event arrangements'] }));
