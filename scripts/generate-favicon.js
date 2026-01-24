const sharp = require('sharp');
const path = require('path');

async function generateFavicon() {
  const logoPath = path.join(__dirname, '../public/images/logos/logo.png');
  const outputPath = path.join(__dirname, '../public/favicon.png');
  const output192Path = path.join(__dirname, '../public/images/logos/logo-favicon.png');

  // Create 32x32 favicon with black circle background and white logo
  const size = 32;
  const padding = 4;
  const logoSize = size - (padding * 2);

  // Create black circle background
  const background = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#1e3a5f"/>
    </svg>`
  );

  // Load and process the logo - make it white
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .negate({ alpha: false }) // Invert colors to make it white
    .toBuffer();

  // Composite logo on background
  await sharp(background)
    .composite([
      {
        input: logo,
        top: padding,
        left: padding,
      }
    ])
    .png()
    .toFile(outputPath);

  console.log(`✓ Created ${outputPath}`);

  // Create 192x192 version for larger icons
  const size192 = 192;
  const padding192 = 24;
  const logoSize192 = size192 - (padding192 * 2);

  const background192 = Buffer.from(
    `<svg width="${size192}" height="${size192}">
      <circle cx="${size192/2}" cy="${size192/2}" r="${size192/2}" fill="#1e3a5f"/>
    </svg>`
  );

  const logo192 = await sharp(logoPath)
    .resize(logoSize192, logoSize192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .negate({ alpha: false })
    .toBuffer();

  await sharp(background192)
    .composite([
      {
        input: logo192,
        top: padding192,
        left: padding192,
      }
    ])
    .png()
    .toFile(output192Path);

  console.log(`✓ Created ${output192Path}`);
}

generateFavicon().catch(console.error);
