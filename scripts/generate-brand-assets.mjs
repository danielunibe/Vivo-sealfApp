import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const sourceIcon = process.argv[2];

if (!sourceIcon) {
  console.error('Usage: node scripts/generate-brand-assets.mjs <source-icon.jpeg>');
  process.exit(1);
}

const brandDir = path.join(projectRoot, 'public', 'brand');
const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

const densitySizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const foregroundSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

function squircleMask(size, exponent = 4.8) {
  const half = size / 2;
  const radius = half * 0.9;
  const channels = 4;
  const buffer = Buffer.alloc(size * size * channels);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = Math.abs((x + 0.5 - half) / radius);
      const ny = Math.abs((y + 0.5 - half) / radius);
      const edge = Math.pow(nx, exponent) + Math.pow(ny, exponent);
      const alpha = edge <= 1 ? 255 : 0;
      const index = (y * size + x) * channels;
      buffer[index] = 255;
      buffer[index + 1] = 255;
      buffer[index + 2] = 255;
      buffer[index + 3] = alpha;
    }
  }

  return sharp(buffer, { raw: { width: size, height: size, channels } }).png().toBuffer();
}

async function renderSquircle(size, paddingRatio = 0.07) {
  const mask = await squircleMask(size);
  const innerSize = Math.round(size * (1 - paddingRatio * 2));
  const cornerPad = Math.round(size * paddingRatio);

  const image = await sharp(sourceIcon)
    .rotate()
    .resize(innerSize, innerSize, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: image, left: cornerPad, top: cornerPad },
      { input: mask, blend: 'dest-in' },
    ])
    .png()
    .toBuffer();
}

async function writePng(filePath, buffer) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
}

await fs.mkdir(brandDir, { recursive: true });

const webIcon = await renderSquircle(1024, 0);
await writePng(path.join(brandDir, 'vivo-app-icon-squircle.png'), webIcon);
await writePng(path.join(projectRoot, 'public', 'icon.png'), await renderSquircle(512, 0));
await writePng(path.join(projectRoot, 'public', 'apple-icon.png'), await renderSquircle(180, 0));

for (const [density, size] of Object.entries(densitySizes)) {
  const legacy = await renderSquircle(size, 0);
  await writePng(path.join(androidResDir, density, 'ic_launcher.png'), legacy);
  await writePng(path.join(androidResDir, density, 'ic_launcher_round.png'), legacy);
}

for (const [density, size] of Object.entries(foregroundSizes)) {
  const foreground = await renderSquircle(size, 0.16);
  await writePng(path.join(androidResDir, density, 'ic_launcher_foreground.png'), foreground);
}

console.log('Generated Vivo squircle brand icons.');
