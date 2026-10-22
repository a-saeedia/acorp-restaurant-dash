/**
 * Renders the full commercial programmatically (same pipeline as render-stills).
 *
 *   node scripts/render-film.mjs [out/file.mp4]
 *
 * The Remotion CLI refuses to attach while a Studio instance owns port 3000, so
 * this uses the renderer API directly on its own port.
 */
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, process.argv[2] ?? 'out/acorp-commercial.mp4');
const PORT = 3061;

mkdirSync(dirname(OUTPUT), { recursive: true });

console.log('bundling src/video/index.ts …');
const serveUrl = await bundle({
  entryPoint: resolve(ROOT, 'src/video/index.ts'),
  publicDir: resolve(ROOT, 'public'),
});

const composition = await selectComposition({
  serveUrl,
  id: 'ACorpCommercial',
  inputProps: {},
  port: PORT,
});

console.log(
  `composition: ${composition.width}×${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames`,
);

let lastLogged = -10;
const started = Date.now();

await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  pixelFormat: 'yuv420p',
  crf: 18,
  imageFormat: 'jpeg',
  outputLocation: OUTPUT,
  port: PORT,
  overwrite: true,
  onProgress: ({ progress }) => {
    const percent = Math.floor(progress * 100);
    if (percent >= lastLogged + 10) {
      lastLogged = percent;
      console.log(`${percent}% · ${Math.round((Date.now() - started) / 1000)}s`);
    }
  },
});

console.log(`done: ${OUTPUT} in ${Math.round((Date.now() - started) / 1000)}s`);
