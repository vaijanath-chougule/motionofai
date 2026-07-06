const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

// Every asset lives under the MotionOfAI/ root folder on Cloudinary, e.g.
//   MotionOfAI/Hero/Desktop/frame001.webp
//   MotionOfAI/AIVideoProduction/desktop/<file>.mp4
// f_auto,q_auto lets Cloudinary pick the best format (AVIF/WebP/JPG) and
// compression per browser + device from a single upload — the core speed win.
const ROOT = 'MotionOfAI';
const clean = (path) => String(path).replace(/^\/+/, '');

export const cdnImg = (path, tx = 'f_auto,q_auto') =>
  `${CLOUDINARY_BASE}/image/upload/${tx}/${ROOT}/${clean(path)}`;

export const cdnVid = (path, tx = 'f_auto,q_auto') =>
  `${CLOUDINARY_BASE}/video/upload/${tx}/${ROOT}/${clean(path)}`;

// For assets referenced by their FULL Cloudinary public_id (e.g. the hero
// frames). Their ids carry a unique suffix and resolve at the delivery root
// — the Media Library folder is display-only metadata, NOT part of the id —
// so no ROOT prefix here. Ids come from the generated src/data/heroManifest.js.
export const cdnImgId = (publicId, tx = 'f_auto,q_auto') =>
  `${CLOUDINARY_BASE}/image/upload/${tx}/${clean(publicId)}`;
