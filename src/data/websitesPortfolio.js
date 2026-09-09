/**
 * 3D Websites Portfolio Data
 *
 * This is the single source of truth for all 3D website projects.
 * Add new projects here and they will automatically appear in the portfolio grid.
 *
 * Each project requires:
 * - id: unique identifier
 * - number: display number (e.g., "01", "02", "03") or null to hide
 * - category: typically "3D WEBSITE"
 * - title: project name
 * - description: brief project description
 * - video: URL to the project preview video
 * - url: URL to the live website
 */

export const WEBSITES_PORTFOLIO = [
  {
    id: 'alta-yacht',
    number: null,
    category: '3D WEBSITE',
    title: 'Alta Yacht',
    description: 'Luxury yacht experience brought to life through an immersive 3D website.',
    video: 'https://assets.wenilo.com/3d-websites/alta/0831.mp4',
    url: 'https://alta-luxury-yacht.wenilo.workers.dev/',
  },
  {
    id: 'elvora',
    number: null,
    category: '3D WEBSITE',
    title: 'ELVARA — Fit Out Services',
    description: 'Premium fit-out services brought to life through an immersive digital experience.',
    video: 'https://assets.wenilo.com/3d-websites/elvora/elvora-web.mp4',
    url: 'https://elvara-website-beta.vercel.app/',
  },
  {
    id: 'swag',
    number: null,
    category: '3D WEBSITE',
    title: 'SWAG — Clothing Brand',
    description: 'Contemporary streetwear built for everyday movement.',
    video: 'https://assets.wenilo.com/3d-websites/swag/desktop/swag-web.mp4',
    url: 'https://swag-website.wenilo.workers.dev/',
  },
  {
    id: 'forma',
    number: null,
    category: '3D WEBSITE',
    title: 'Forma — Commercial Interior Contractor',
    description: 'Precision-built commercial interiors designed to elevate every space.',
    video: 'https://assets.wenilo.com/3d-websites/forma/forma-web.mp4',
    url: 'https://forma-dubai.wenilo.workers.dev/',
  },
];
