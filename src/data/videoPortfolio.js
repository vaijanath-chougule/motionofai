// ============================================================
// AI Video Production — portfolio data source.
//
// Single source of truth for the AI Video Production section.
// Components NEVER hardcode videos — they map over this data.
//
// To add a future project:
//   1. Upload to Cloudflare R2 under website/{desktop,mobile}-assets/
//      as <slug>.mp4 (+ <slug>-poster.webp for the poster).
//   2. Add one object to VIDEO_PORTFOLIO below via desktopAsset()/mobileAsset().
// No component changes are required.
//
// Responsive split mirrors the Hero: ResponsiveVideo resolves
// EXACTLY ONE source per device via matchMedia, so a phone only
// ever downloads *-mobile.mp4 and desktop only *-desktop.mp4.
// Until the real files exist, the section degrades to an elegant
// studio placeholder (poster first when present) — never a broken
// player, zero layout shift.
// ============================================================

import { desktopAsset, mobileAsset, reelAsset } from '../config/assets';

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
    desktopVideo: desktopAsset('ad-01.mp4'),
    mobileVideo: mobileAsset('ad-01.mp4'),
    poster: desktopAsset('ad-01-poster.webp'),
    portfolioUrl: '/portfolio/ai-advertisements',
  },
  {
    id: 'film-01',
    title: 'Luxury Brand Film',
    category: 'cinematic',
    desktopVideo: desktopAsset('film-01.mp4'),
    mobileVideo: mobileAsset('film-01.mp4'),
    poster: desktopAsset('film-01-poster.webp'),
    portfolioUrl: '/portfolio/ai-cinematic',
  },
];

// Hero (featured) video for a column = first item in that category.
export const getFeaturedVideo = (categoryKey) =>
  VIDEO_PORTFOLIO.find((v) => v.category === categoryKey) ?? null;

// ============================================================
// FEATURED_REEL — the five showcase projects driving the cinematic,
// pinned "film reel" on /ai-video-production. Order = scroll order.
// Each object is one project card. Assets follow the same R2
// convention as VIDEO_PORTFOLIO:
//   website/{desktop,mobile}-assets/reel-0N.mp4
//   website/desktop-assets/reel-0N-poster.webp
// Until the real files exist, each card degrades to the elegant studio
// placeholder (ResponsiveVideo / ReelVideo) — never a broken player.
// ============================================================
export const FEATURED_REEL = [
  {
    id: 'reel-01',
    title: 'Nimantran Stories',
    category: 'Wedding Invitation',
    description:
      'A collection of luxury AI wedding invitations, cut as vertical films.',
    duration: '0:32',
    // `variant: 'reels'` swaps this ONE slot from a single landscape film to
    // the five-up vertical showcase (see ReelShowcase). Every other entry
    // below is untouched and still renders the standard landscape ReelCard.
    // Each child inherits `category` / `title` from the parent unless it
    // overrides them, so renaming the collection is a one-line change.
    variant: 'reels',
    reels: [
      {
        // Live film. The source sits OUTSIDE the website/ prefix that
        // desktopAsset()/mobileAsset() build, so the R2 URL is given in full
        // and used directly — nothing is proxied or re-hosted.
        // The showcase renders no runtimes (ReelCard `showDuration={false}`),
        // so no `duration` is carried here or on any sibling below.
        id: 'nimantran-01',
        title: 'Mahesh & Sakshi',
        desktopVideo: reelAsset('desktop', '01/0404%20(1).mp4'),
        mobileVideo: reelAsset('mobile', '01/0404%20(1).mp4'),
      },
      {
        id: 'nimantran-02',
        title: 'Ethen & Grace',
        desktopVideo: reelAsset('desktop', '02/2k.mp4'),
        mobileVideo: reelAsset('mobile', '02/2k.mp4'),
      },
      {
        id: 'nimantran-03',
        title: 'Arjun & Ananya',
        desktopVideo: reelAsset('desktop', '03/Panjabi.mp4'),
        mobileVideo: reelAsset('mobile', '03/Panjabi.mp4'),
      },
      {
        id: 'nimantran-04',
        title: 'Rakesh & Arpita',
        desktopVideo: reelAsset('desktop', '04/4.mp4'),
        mobileVideo: reelAsset('mobile', '04/4.mp4'),
      },
      {
        id: 'nimantran-05',
        title: 'Rahul & Priya',
        desktopVideo: reelAsset('desktop', '05/Rahul%20%26%20Priya.mp4'),
        mobileVideo: reelAsset('mobile', '05/Rahul%20%26%20Priya.mp4'),
      },
    ],
  },
  {
    id: 'reel-02',
    title: 'Goodies',
    category: 'Product Commercial',
    description:
      'A gold-lit product film where every reflection and highlight is AI-rendered to perfection.',
    desktopVideo: reelAsset('desktop', 'product-add-2/hf_20260729_122036_38a26403-3e7c-4d61-8c05-334b215403c7.mp4'),
    poster: reelAsset('desktop', 'posters/aurum-poster.webp'),
  },
  {
    id: 'reel-03',
    title: 'Rova',
    category: 'Product Ad',
    description:
      "A brand's founding myth retold as cinematic, emotionally-charged AI storytelling.",
    desktopVideo: reelAsset('desktop', 'product-add-3/hf_20260730_042703_b9cf9e99-aa69-43d1-98b6-783a680f285f.mp4'),
    poster: reelAsset('desktop', 'posters/rova-poster.webp'),
  },
  {
    id: 'reel-04',
    title: 'Suvi',
    category: 'AI Product Ad',
    description:
      'A couture campaign styled, shot and lit entirely by generative AI.',
    desktopVideo: reelAsset('desktop', 'product-add-4/hf_20260729_120045_55a10cf8-6358-4899-bf94-a58482a72604.mp4'),
    poster: reelAsset('desktop', 'posters/suvi-card4-poster.webp'),
  },
  {
    id: 'reel-05',
    title: 'Suvi',
    category: 'AI Product Ad',
    description:
      'A short cinematic journey proving generative AI can genuinely move an audience.',
    // Path already percent-encoded — spaces and parentheses preserved as uploaded.
    desktopVideo: reelAsset('desktop', 'product%20add/0808%20(2).mp4'),
    poster: reelAsset('desktop', 'posters/suvi-card5-poster.webp'),
  },
];
