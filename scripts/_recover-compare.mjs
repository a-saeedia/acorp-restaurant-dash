import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

const base = join('out', 'recovered');
for (const file of walk(base)) {
  const rel = file.slice(base.length + 1);
  const target = join(...rel.split(sep));
  const recovered = readFileSync(file, 'utf8');
  const onDisk = existsSync(target) ? readFileSync(target, 'utf8') : null;
  const state =
    onDisk === null ? 'MISSING' : onDisk === recovered ? 'same' : `diff(${statSync(target).size})`;
  const markers = [
    recovered.includes('components/kit') ? 'KIT' : '',
    recovered.includes('score.wav') ? 'SCORE' : '',
    recovered.includes('stageProgress') ? 'PIPE' : '',
    recovered.includes("textAlign: 'center'") ? 'CENTER' : '',
  ]
    .filter(Boolean)
    .join(',');
  console.log(state.padEnd(12), String(recovered.length).padStart(6), rel, markers);
}
