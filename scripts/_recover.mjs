import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const bundleDir = join(tmpdir(), 'remotion-webpack-bundle-lCRpeC');
const map = JSON.parse(readFileSync(join(bundleDir, 'bundle.js.map'), 'utf8'));

let written = 0;
map.sources.forEach((source, index) => {
  const clean = String(source).split('?')[0].replace(/\\/g, '/');
  const match = clean.match(/src\/(video|lib|simulation|design)\/(.+)$/);
  if (!match) return;
  const content = map.sourcesContent?.[index];
  if (!content) return;
  const target = join('out/recovered', 'src', match[1], match[2]);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  written += 1;
  console.log(clean.split('src/')[1], content.length);
});
console.log('total', written);
