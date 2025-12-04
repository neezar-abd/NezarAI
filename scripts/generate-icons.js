const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// SVG template for NezarAI icon - Logo text style "nezarai"
const generateSvg = (size) => {
  // Adjust font size based on icon size for better readability
  const isSmall = size <= 96;
  const fontSize = isSmall ? 140 : 110;
  const yPos = isSmall ? 310 : 300;
  
  return `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0a0a0a"/>
  <text x="256" y="${yPos}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" fill="#ffffff" text-anchor="middle">
    <tspan font-weight="400">nezar</tspan><tspan font-weight="700">ai</tspan>
  </text>
</svg>`;
};

// Simple "n" icon for very small sizes
const generateSmallSvg = () => `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0a0a0a"/>
  <text x="256" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="320" font-weight="400" fill="#ffffff" text-anchor="middle">n</text>
</svg>`;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...\n');
  
  for (const size of sizes) {
    // Use simple "n" for very small icons, full logo for larger
    const svg = size <= 72 ? Buffer.from(generateSmallSvg()) : Buffer.from(generateSvg(size));
    
    const filename = `icon-${size}x${size}.png`;
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, filename));
    console.log(`✓ Created ${filename}`);
  }
  
  // Create favicon with simple "n"
  const faviconSvg = Buffer.from(generateSmallSvg());
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));
  console.log(`✓ Created favicon.png`);
  
  // Also create favicon.ico size
  await sharp(faviconSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-16.png'));
  console.log(`✓ Created favicon-16.png`);
  
  console.log('\n✅ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
