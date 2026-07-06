// Central content + config source. Keeping copy here makes the
// storytelling easy to tune without touching component logic.

export const BRAND = {
  name: 'MotionOfAI',
  promise: 'Get More Customers',
  email: 'hello@motionofai.com',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com' },
    { label: 'Instagram', href: 'https://www.instagram.com' },
    { label: 'Email', href: 'mailto:hello@motionofai.com' },
  ],
};

export const NAV_LINKS = [
  { label: '3D Websites', to: '/#3d-websites', section: '3d-websites' },
  { label: 'AI Voice Agents', to: '/voice-agents', section: 'voice-agents' },
  { label: 'AI Video Production', to: '/ai-video-production', section: 'ai-video' },
  { label: 'Contact', to: '/#contact', section: 'contact' },
];

export const CTA = {
  primary: 'Book Strategy Call',
  secondary: 'View Our Work',
};

// Scroll-driven hero image sequence (Apple-style). Frames live in
// /public/hero-frames as WebP (optimised) with JPG as a safety fallback.
// The loader tries .webp first and falls back to .jpg per frame if the
// browser can't decode WebP. Swap count / paths to drop in a new
// sequence later; regenerate WebP with `npm run frames:webp`.
//
// Device split: desktop/tablet play the landscape set; phones play a
// dedicated portrait (9:16) set from /hero-frames/mobile. HeroSequence
// picks one at load via matchMedia, so a phone only ever downloads the
// portrait frames. Same 1-based numbering + count for both.
const frameName = (i) => `ezgif-frame-${String(i).padStart(3, '0')}`;

export const HERO_SEQUENCE = {
  count: 152,
  desktop: {
    getUrl: (i) => `/hero-frames/${frameName(i)}.webp`,
    getFallbackUrl: (i) => `/hero-frames/${frameName(i)}.jpg`,
  },
  mobile: {
    getUrl: (i) => `/hero-frames/mobile/${frameName(i)}.webp`,
    getFallbackUrl: (i) => `/hero-frames/mobile/${frameName(i)}.jpg`,
  },
};

// Shared id used by GSAP Flip to morph the home circle into the
// Voice Agents hero object across the route change.
export const VOICE_FLIP_ID = 'voice-sphere';

// Responsive media sources for the ServiceShowcase cards. Desktop/tablet
// use the landscape asset; mobile uses a dedicated portrait (9:16) cut.
// ResponsiveVideo resolves exactly one per device (no double download)
// and degrades to an elegant placeholder until these files exist. Drop
// them into /public/media/{desktop,mobile}/ to go live — paths are
// already wired, so no code change is needed.
export const MEDIA = {
  website: {
    desktop: '/media/desktop/website.mp4',
    mobile: '/media/mobile/website.mp4',
  },
  videoProduction: {
    desktop: '/media/desktop/video-production.mp4',
    mobile: '/media/mobile/video-production.mp4',
  },
  // Optional fullscreen hero-video variant (see components/hero/HeroMedia).
  hero: {
    desktop: '/media/desktop/hero.mp4',
    mobile: '/media/mobile/hero.mp4',
    posterDesktop: '/media/desktop/hero.webp',
    posterMobile: '/media/mobile/hero.webp',
  },
};

export const WORK_ITEMS = [
  { id: 'w1', title: 'Helios Commerce', tag: '3D Website', span: 'tall' },
  { id: 'w2', title: 'Nova Voice', tag: 'AI Voice Agent', span: 'wide' },
  { id: 'w3', title: 'Atlas Studio', tag: 'AI Video', span: 'normal' },
  { id: 'w4', title: 'Vanta Labs', tag: '3D Website', span: 'normal' },
  { id: 'w5', title: 'Lumen Retail', tag: 'AI Video', span: 'tall' },
  { id: 'w6', title: 'Orbit Health', tag: 'AI Voice Agent', span: 'wide' },
];

export const PROCESS_STEPS = [
  { n: '01', title: 'Discover', copy: 'We map the fastest path from stranger to customer.' },
  { n: '02', title: 'Design', copy: 'Cinematic direction, engineered to convert.' },
  { n: '03', title: 'Build', copy: 'Award-winning craft. 60fps. Zero compromise.' },
  { n: '04', title: 'Launch', copy: 'We ship, measure and refine in the real world.' },
  { n: '05', title: 'Get More Customers', copy: 'The only metric that matters. Growth.' },
];
