import { readFileSync } from 'node:fs';

const t = readFileSync('src/video/timeline.ts', 'utf8');
console.log('--- timeline ---');
console.log(
  t
    .split('\n')
    .filter((line) => /frames:|TOTAL/.test(line))
    .join('\n'),
);

const r = readFileSync('src/video/Root.tsx', 'utf8');
console.log('--- root ---');
console.log({
  filmOverlay: r.includes('FilmOverlay'),
  score: r.includes('score.wav'),
  bed: r.includes('bed.wav'),
});

const p = readFileSync('src/video/scenes/Problem.tsx', 'utf8');
console.log('--- problem ---', {
  center: p.includes("textAlign: 'center'"),
  minHeight: p.includes('minHeight: 322'),
  len: p.length,
});

const o = readFileSync('src/video/scenes/OrderFlow.tsx', 'utf8');
console.log('--- orderflow ---', {
  stages: o.includes('const STAGES'),
  stageProgress: o.includes('stageProgress'),
  qr: o.includes('QrGlyph'),
  len: o.length,
});

const k = readFileSync('src/video/components/kit.tsx', 'utf8');
const exported = [...k.matchAll(/export (?:function|const) (\w+)/g)].map((match) => match[1]);
console.log('--- kit exports ---', exported.join(', '));
