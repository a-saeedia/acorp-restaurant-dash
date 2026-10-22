#!/usr/bin/env node
/**
 * Inlines the built Vite dashboard (dist/) into one portable .html file.
 *
 *   node scripts/bundle-single-html.mjs [outFile]
 *
 * JS, CSS, the icon and every woff2 font become part of the document, so the
 * result opens straight from disk (file://) with no server and no network.
 */
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const outFile = resolve(process.argv[2] ?? join(root, 'acorp-dashboard.html'));

const MIME = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

const readDist = (p) => readFile(join(dist, p.replace(/^\//, '')), 'utf8');
const dataUri = async (p) => {
  const rel = p.replace(/^\//, '').replace(/^\.\//, '');
  const ext = rel.slice(rel.lastIndexOf('.')).toLowerCase();
  const buf = await readFile(join(dist, rel));
  return `data:${MIME[ext] ?? 'application/octet-stream'};base64,${buf.toString('base64')}`;
};

let html = await readDist('index.html');

/** Inline every url(...) in CSS: fonts, images, anything the build emitted. */
async function inlineCssUrls(css) {
  const urls = new Set(
    [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)]
      .map((m) => m[1])
      .filter((u) => !/^(data:|https?:|#)/i.test(u)),
  );
  for (const url of urls) {
    const uri = await dataUri(url);
    css = css.split(`url(${url})`).join(`url("${uri}")`);
    css = css.split(`url("${url}")`).join(`url("${uri}")`);
    css = css.split(`url('${url}')`).join(`url("${uri}")`);
  }
  return css;
}

// 1. Stylesheet -> <style>
for (const m of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]) {
  const href = /href="([^"]+)"/.exec(m[0])?.[1];
  if (!href) continue;
  const css = await inlineCssUrls(await readDist(href));
  // Function form: `$&`/`` $` `` in the payload must never be read as a
  // replacement pattern.
  html = html.replace(m[0], () => `    <style>\n${css}\n    </style>`);
}

// 2. Module script -> <script type="module">
for (const m of [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)]) {
  const [, src] = m;
  // A literal </script> inside the bundle would close the tag early.
  const js = (await readDist(src))
    .replace(/\n?\/\/# sourceMappingURL=.*$/m, '')
    .replace(/<\/script/gi, '<\\/script');
  html = html.replace(m[0], () => `    <script type="module">\n${js}\n    </script>`);
}

// 3. Favicon -> data URI
const favicon = await dataUri('favicon.svg');
html = html.replace(
  /<link[^>]+rel="icon"[^>]*>/g,
  () => `    <link rel="icon" type="image/svg+xml" href="${favicon}" />`,
);

// 4. Any leftover asset reference in the markup means the inliner missed
// something. Bundle-internal strings (modulepreload maps) are not references.
const markup = html
  .replace(/<script\b[\s\S]*?<\/script>/gi, '<script></script>')
  .replace(/<style\b[\s\S]*?<\/style>/gi, '<style></style>');
const leftovers = [...markup.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
if (leftovers.length) {
  throw new Error(`un-inlined asset references: ${leftovers.join(', ')}`);
}

await writeFile(outFile, html, 'utf8');

// 5. Self-check: nothing may still reach for the network.
const remote = [...html.matchAll(/(?:src|href)="(?:https?:)?\/\//g)].length;
if (remote) throw new Error(`${remote} remote reference(s) survived inlining`);

const { size } = await stat(outFile);
console.log(`single-file dashboard -> ${outFile} (${(size / 1024).toFixed(0)} KB)`);
