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
    id: 'website-02',
    number: '02',
    category: '3D WEBSITE',
    title: 'Placeholder Project Two',
    description: 'Interactive 3D website pushing the boundaries of web technology.',
    video: 'https://assets.wenilo.com/website/desktop-assets/3d-project-02.mp4',
    url: 'https://example.com/project-02',
  },
];
