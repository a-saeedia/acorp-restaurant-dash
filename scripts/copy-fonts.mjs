// Copies the locally installed Vazirmatn variable font files into /public/fonts
// so that BOTH the Vite dashboard and the Remotion renderer load the exact same
// local font binaries. No CDN, no network access at render time.
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'node_modules', '@fontsource-variable', 'vazirmatn', 'files');
const target = path.join(root, 'public', 'fonts');

const files = [
  'vazirmatn-arabic-wght-normal.woff2',
  'vazirmatn-latin-wght-normal.woff2',
  'vazirmatn-latin-ext-wght-normal.woff2',
];

if (!existsSync(source)) {
  console.error(`[fonts] Missing ${source}. Run "pnpm install" first.`);
  process.exit(1);
}

await mkdir(target, { recursive: true });

for (const file of files) {
  const from = path.join(source, file);
  if (!existsSync(from)) {
    console.error(`[fonts] Missing font file: ${from}`);
    process.exit(1);
  }
  await copyFile(from, path.join(target, file));
  console.log(`[fonts] copied ${file}`);
}

console.log(`[fonts] done -> ${target}`);
