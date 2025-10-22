import sharp from 'sharp';
import toIco from 'to-ico';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = resolve('packages/assets/goldshore');
const src = resolve(base, 'logo-wordmark-on-light.svg');
const out = resolve(base, 'dist');

await mkdir(out, { recursive: true });

const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512];

for (const size of sizes) {
  const file = resolve(out, `icon-${size}.png`);
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: '#ffffff00' })
    .png()
    .toFile(file);
}

const icoSources = await Promise.all(
  [16, 32, 48].map((size) => sharp(resolve(out, `icon-${size}.png`)).toBuffer())
);
const ico = await toIco(icoSources);

await writeFile(resolve(out, 'favicon.ico'), ico);

console.log('✅ PNG + ICO icons ready in packages/assets/goldshore/dist (manifest served from apps/web/public)');
