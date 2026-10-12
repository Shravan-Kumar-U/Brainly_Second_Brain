import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OUT_DIR = fileURLToPath(new URL('../public/icons/', import.meta.url));

// Same "B" mark as the favicon
const GLYPH = 'M22 18h12a8 8 0 0 1 0 14 9 9 0 0 1-2 14H22z';

const buildSvg = (size, { rounded }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7360f6"/>
      <stop offset="1" stop-color="#5232cf"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" ${rounded ? 'rx="14"' : ''} fill="url(#g)"/>
  <g transform="translate(32 32) scale(1.3) translate(-32.5 -32)">
    <path d="${GLYPH}" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  </g>
</svg>`;

// Maskable and Apple icons are full squares: the phone applies its own shape,
// and the logo stays inside the safe zone so no shape can cut it off.
const TARGETS = [
  { file: 'icon-192.png', size: 192, rounded: true },
  { file: 'icon-512.png', size: 512, rounded: true },
  { file: 'maskable-512.png', size: 512, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, rounded: false },
];

await mkdir(OUT_DIR, { recursive: true });

for (const { file, size, rounded } of TARGETS) {
  await sharp(Buffer.from(buildSvg(size, { rounded })))
    .png()
    .toFile(`${OUT_DIR}${file}`);
  console.log(`created public/icons/${file}`);
}

// Monochrome badge for Android's status bar
const badgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 64 64">
  <g transform="translate(32 32) scale(1.5) translate(-32.5 -32)">
    <path d="${GLYPH}" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
  </g>
</svg>`;

await sharp(Buffer.from(badgeSvg)).png().toFile(`${OUT_DIR}badge-96.png`);
console.log('created public/icons/badge-96.png');