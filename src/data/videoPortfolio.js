// ============================================================
// AI Video Production — portfolio data source.
//
// Single source of truth for the AI Video Production section.
// Components NEVER hardcode videos — they map over this data.
//
// To add a future project:
//   1. Drop the assets into /public/videos/<category>/ as
//      <slug>-desktop.mp4, <slug>-mobile.mp4, <slug>-poster.webp
//   2. Add one object to VIDEO_PORTFOLIO below.
// No component changes are required.
//
// Responsive split mirrors the Hero: ResponsiveVideo resolves
// EXACTLY ONE source per device via matchMedia, so a phone only
// ever downloads *-mobile.mp4 and desktop only *-desktop.mp4.
// Until the real files exist, the section degrades to an elegant
// studio placeholder (poster first when present) — never a broken
// player, zero layout shift.
// ============================================================

// Column-level copy + destination. Fixed per the section design;
// the scalable, growable part is VIDEO_PORTFOLIO below.
export const VIDEO_CATEGORIES = [
  {
    key: 'advertisements',
    label: 'AI Advertisements',
    heading: 'AI Advertisements That Convert.',
    description:
      'Create ultra-realistic AI commercials, product launches, social media advertisements and performance marketing videos designed to increase attention and conversions.',
    cta: 'View Advertisement Portfolio',
    portfolioUrl: '/portfolio/ai-advertisements',
  },
  {
    key: 'cinematic',
    label: 'AI Cinematic Videos',
    heading: 'Cinematic Stories That Build Brands.',
    description:
      'Create luxury brand films, launch videos, storytelling content, corporate films and social media campaigns that make businesses unforgettable.',
    cta: 'View Cinematic Portfolio',
    portfolioUrl: '/portfolio/ai-cinematic',
  },
];

// The growable portfolio. Each object is one project. The section
// shows the first item per category as its hero; every other item
// feeds the dedicated portfolio pages (portfolioUrl) as they grow.
export const VIDEO_PORTFOLIO = [
  {
    id: 'ad-01',
    title: 'Product Launch Spot',
    category: 'advertisements',
    desktopVideo: '/videos/ai-advertisements/ad-01-desktop.mp4',
    mobileVideo: '/videos/ai-advertisements/ad-01-mobile.mp4',
    poster: '/videos/ai-advertisements/ad-01-poster.webp',
    portfolioUrl: '/portfolio/ai-advertisements',
  },
  {
    id: 'film-01',
    title: 'Luxury Brand Film',
    category: 'cinematic',
    desktopVideo: '/videos/ai-cinematic/film-01-desktop.mp4',
    mobileVideo: '/videos/ai-cinematic/film-01-mobile.mp4',
    poster: '/videos/ai-cinematic/film-01-poster.webp',
    portfolioUrl: '/portfolio/ai-cinematic',
  },
];

// Hero (featured) video for a column = first item in that category.
export const getFeaturedVideo = (categoryKey) =>
  VIDEO_PORTFOLIO.find((v) => v.category === categoryKey) ?? null;
