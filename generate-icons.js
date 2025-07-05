// Simple icon generator for PWA - creates colored squares as placeholders
import fs from 'fs';

// Create a simple SVG icon
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="24"/>
  <circle cx="${size/2}" cy="${size/2 - 20}" r="30" fill="white" opacity="0.9"/>
  <rect x="${size/2 - 15}" y="${size/2 + 5}" width="30" height="25" fill="white" opacity="0.9" rx="4"/>
  <text x="${size/2}" y="${size - 30}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">QTA</text>
</svg>
`;

// Create icons in different sizes
const sizes = [192, 512];

sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  fs.writeFileSync(`public/pwa-${size}x${size}.svg`, svgContent);
  console.log(`Created pwa-${size}x${size}.svg`);
});

console.log('Icon generation complete!');