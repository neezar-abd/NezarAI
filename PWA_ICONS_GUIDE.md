# NezarAI PWA Icon Generation

## Option 1: Use Online Tool (Easiest)

1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/
2. Upload your logo/icon image (preferably 512x512 PNG)
3. Download the generated icons
4. Place them in `public/icons/` folder

## Option 2: Use Sharp (Node.js)

Install sharp:
```bash
npm install sharp --save-dev
```

Create `scripts/generate-icons.js`:
```javascript
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons();
```

Run:
```bash
node scripts/generate-icons.js
```

## Option 3: Use ImageMagick

If you have ImageMagick installed:
```bash
cd public/icons
convert icon.svg -resize 72x72 icon-72x72.png
convert icon.svg -resize 96x96 icon-96x96.png
convert icon.svg -resize 128x128 icon-128x128.png
convert icon.svg -resize 144x144 icon-144x144.png
convert icon.svg -resize 152x152 icon-152x152.png
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 384x384 icon-384x384.png
convert icon.svg -resize 512x512 icon-512x512.png
```

## Required Icon Sizes

- 72x72 - Android Chrome
- 96x96 - Android Chrome
- 128x128 - Chrome Web Store
- 144x144 - Windows 8/10 tiles
- 152x152 - iOS Safari
- 192x192 - Android Chrome
- 384x384 - Android Chrome
- 512x512 - Android Chrome (splash screen)

## After Generating Icons

1. Make sure all PNG files are in `public/icons/`
2. Test PWA by running the app and checking:
   - Chrome DevTools > Application > Manifest
   - Should show "Installable" status
