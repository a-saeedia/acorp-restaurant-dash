/**
 * Renders a handful of stills from the commercial so layout, Persian shaping
 * and font loading can be checked without paying for a full 2,640-frame render.
 *
 *   node scripts/render-stills.mjs            # frames 0, 200, 500, 900, ...
 *   node scripts/render-stills.mjs 0 900 2100
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'out/stills');
const DEFAULT_FRAMES = [30, 210, 420, 700, 980, 1240, 1500, 1720, 1960, 2320];

const frames = process.argv
  .slice(2)
  .map(Number)
  .filter((value) => Number.isFinite(value));
const targets = frames.length > 0 ? frames : DEFAULT_FRAMES;

mkdirSync(OUT_DIR, { recursive: true });

console.log('bundling src/video/index.ts …');
const serveUrl = await bundle({
  entryPoint: resolve(ROOT, 'src/video/index.ts'),
  publicDir: resolve(ROOT, 'public'),
});

const composition = await selectComposition({
  serveUrl,
  id: 'ACorpCommercial',
  inputProps: {},
  port: 3055,
});

console.log(
  `composition: ${composition.width}×${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames`,
);

for (const frame of targets) {
  const output = resolve(OUT_DIR, `frame-${String(frame).padStart(4, '0')}.png`);
  const started = Date.now();
  await renderStill({
    composition,
    serveUrl,
    output,
    frame,
    imageFormat: 'png',
    port: 3055,
    overwrite: true,
  });
  console.log(`✓ ${output} (${Date.now() - started}ms)`);
}
