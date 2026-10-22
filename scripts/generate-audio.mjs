/**
 * Generates the film's soundtrack locally â€” synthesised, no samples, no
 * downloads, no licensing questions.
 *
 * Output: public/audio/bed.wav (70s, 44.1kHz, mono).
 *
 * Design: a dark pad bed that changes chord at every scene, a 120 BPM pulse,
 * risers into each cut, sub impacts on the cut, UI ticks through the order
 * pipeline, an alarm in the inventory beat, crystal arpeggios under the
 * analytics/marketing/product acts, and a long tail on the final lockup.
 *
 * Deterministic: a seeded LCG replaces Math.random, so the same numbers in
 * always produce the same WAV out.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/audio/bed.wav');

const SR = 44100;
const DURATION = 70;
const TOTAL = SR * DURATION;

/** Cumulative scene boundaries in seconds, mirroring src/video/timeline.ts. */
const CUTS = [0, 6, 14, 24, 32, 40, 50, 58, 66, 70];

/** D minor-ish voicings, one per scene: tense, then gold. */
const CHORDS = [
  [55.0, 82.41, 110.0, 164.81],
  [49.0, 73.42, 98.0, 146.83],
  [55.0, 82.41, 130.81, 164.81],
  [43.65, 65.41, 87.31, 130.81],
  [49.0, 73.42, 110.0, 146.83],
  [55.0, 82.41, 110.0, 164.81],
  [46.25, 69.3, 92.5, 138.59],
  [49.0, 73.42, 98.0, 146.83],
  [58.27, 87.31, 116.54, 174.61],
];

const samples = new Float32Array(TOTAL);

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smooth = (t) => t * t * (3 - 2 * t);
const lfo = (t, rate, phase = 0) => 0.5 + 0.5 * Math.sin(2 * Math.PI * rate * t + phase);

/* Deterministic noise. */
let seed = 0x9e3779b9;
function noise() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff - 0.5;
}

/* -------------------------------------------------------------------------- */
/* 1. Pad bed                                                                 */
/* -------------------------------------------------------------------------- */
for (let scene = 0; scene < CHORDS.length; scene += 1) {
  const start = CUTS[scene] ?? 0;
  const end = CUTS[scene + 1] ?? DURATION;
  const from = Math.floor(start * SR);
  const to = Math.min(TOTAL, Math.floor(end * SR));
  const chord = CHORDS[scene] ?? CHORDS[0];
  const fade = scene === 0 ? 0.9 : 0.42;

  for (let i = from; i < to; i += 1) {
    const t = i / SR;
    const local = t - start;
    const remaining = end - t;
    const envelope = smooth(clamp01(local / fade)) * smooth(clamp01(remaining / 0.5 + 0.1));

    let value = 0;
    for (let v = 0; v < chord.length; v += 1) {
      const freq = chord[v];
      const detune = 1 + (v % 2 === 0 ? 0.0018 : -0.0018);
      value +=
        Math.sin(2 * Math.PI * freq * detune * t) *
        (0.062 / (v + 1)) *
        (0.6 + 0.4 * lfo(t, 0.07 + v * 0.019, v));
    }

    // 120 BPM pulse; decays fast, sits under everything.
    const phase = (t % 0.5) / 0.5;
    value += Math.sin(2 * Math.PI * 46 * t) * 0.032 * Math.exp(-phase * 10);
    // Off-beat crystal ping, very quiet.
    const off = ((t + 0.25) % 0.5) / 0.5;
    value += Math.sin(2 * Math.PI * 1318.5 * t) * 0.0045 * Math.exp(-off * 26);

    samples[i] += value * envelope;
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Risers into cuts + sub impacts on cuts                                  */
/* -------------------------------------------------------------------------- */
for (let cutIndex = 1; cutIndex < CUTS.length; cutIndex += 1) {
  const cut = CUTS[cutIndex];
  const riserFrom = Math.floor((cut - 0.85) * SR);
  const riserTo = Math.floor(cut * SR);

  // Noise riser, high-passed by differencing.
  let prev = 0;
  for (let i = riserFrom; i < riserTo; i += 1) {
    const t = i / SR;
    const local = t - (cut - 0.85);
    const swell = Math.pow(clamp01(local / 0.85), 2.4);
    const white = noise();
    const hp = white - prev;
    prev = white;
    samples[i] += hp * 0.14 * swell;
  }

  // Sub drop + click on the cut.
  const hitFrom = Math.floor(cut * SR);
  const hitTo = Math.min(TOTAL, Math.floor((cut + 0.9) * SR));
  for (let i = hitFrom; i < hitTo; i += 1) {
    const t = i / SR;
    const local = t - cut;
    const sweep = 96 * Math.exp(-local * 7) + 28;
    const body = Math.sin(2 * Math.PI * sweep * local) * Math.exp(-local * 4.2);
    const click = noise() * Math.exp(-local * 90) * 0.5;
    samples[i] += body * 0.16 + click * 0.18;
  }
}

/* -------------------------------------------------------------------------- */
/* 3. UI ticks through the order pipeline (14s â†’ 24s)                         */
/* -------------------------------------------------------------------------- */
for (let step = 0; step < 11; step += 1) {
  const at = 14.45 + step * 0.235;
  const freq = 720 * Math.pow(1.045, step);
  const from = Math.floor(at * SR);
  const to = Math.min(TOTAL, Math.floor((at + 0.09) * SR));
  for (let i = from; i < to; i += 1) {
    const local = i / SR - at;
    const env = Math.exp(-local * 55);
    samples[i] +=
      (Math.sin(2 * Math.PI * freq * local) * 0.09 +
        Math.sin(2 * Math.PI * freq * 2 * local) * 0.02) *
      env;
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Inventory alarm (32s â†’ 35.5s) and purchase confirm (37s)                */
/* -------------------------------------------------------------------------- */
for (let pulse = 0; pulse < 4; pulse += 1) {
  const at = 32.35 + pulse * 0.62;
  const from = Math.floor(at * SR);
  const to = Math.min(TOTAL, Math.floor((at + 0.3) * SR));
  for (let i = from; i < to; i += 1) {
    const local = i / SR - at;
    const env = Math.min(1, local * 60) * Math.exp(-local * 6);
    samples[i] +=
      (Math.sin(2 * Math.PI * 330 * local) * 0.055 + Math.sin(2 * Math.PI * 349 * local) * 0.05) *
      env;
  }
}

{
  const at = 36.9;
  const from = Math.floor(at * SR);
  const to = Math.min(TOTAL, Math.floor((at + 0.5) * SR));
  for (let i = from; i < to; i += 1) {
    const local = i / SR - at;
    const env = Math.exp(-local * 9);
    const bell =
      Math.sin(2 * Math.PI * 880 * local) * 0.07 +
      Math.sin(2 * Math.PI * 1320 * local) * 0.05 +
      Math.sin(2 * Math.PI * 1760 * local) * 0.028;
    samples[i] += bell * env;
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Crystal arpeggios: analytics (40s), marketing (50s), product (58s)      */
/* -------------------------------------------------------------------------- */
const ARPEGGIOS = [
  { at: 40.2, notes: [523.25, 659.25, 783.99, 1046.5], gain: 0.05 },
  { at: 50.2, notes: [587.33, 739.99, 880.0, 1174.66], gain: 0.05 },
  { at: 58.2, notes: [523.25, 622.25, 783.99, 932.33], gain: 0.04 },
];

for (const arp of ARPEGGIOS) {
  for (let n = 0; n < 12; n += 1) {
    const at = arp.at + n * 0.16;
    const freq = arp.notes[n % arp.notes.length];
    const from = Math.floor(at * SR);
    const to = Math.min(TOTAL, Math.floor((at + 0.35) * SR));
    for (let i = from; i < to; i += 1) {
      const local = i / SR - at;
      const env = Math.exp(-local * 13);
      samples[i] += Math.sin(2 * Math.PI * freq * local) * arp.gain * env;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Final hit + shimmer on the lockup (66s), tail to 70s                    */
/* -------------------------------------------------------------------------- */
{
  const from = Math.floor(66 * SR);
  const to = TOTAL;
  for (let i = from; i < to; i += 1) {
    const local = i / SR - 66;
    const decay = Math.exp(-local * 1.15);
    const chord = [58.27, 87.31, 116.54, 174.61, 233.08];
    let value = 0;
    for (let v = 0; v < chord.length; v += 1) {
      value += Math.sin(2 * Math.PI * chord[v] * local) * (0.05 / (v * 0.6 + 1));
    }
    const shimmer = Math.sin(2 * Math.PI * 2093 * local) * 0.012 * Math.exp(-local * 2.2);
    samples[i] += (value + shimmer) * decay;
  }
}

/* Fade the last 1.2s so the file ends cleanly. */
for (let i = Math.floor((DURATION - 1.2) * SR); i < TOTAL; i += 1) {
  const t = i / SR;
  samples[i] *= Math.pow(clamp01((DURATION - t) / 1.2), 1.5);
}

/* Normalise to -3 dBFS. */
let peak = 0;
for (let i = 0; i < TOTAL; i += 1) peak = Math.max(peak, Math.abs(samples[i]));
const gain = peak > 0 ? 0.707 / peak : 1;

/* Write 16-bit mono PCM WAV. */
const bytes = Buffer.alloc(44 + TOTAL * 2);
bytes.write('RIFF', 0);
bytes.writeUInt32LE(36 + TOTAL * 2, 4);
bytes.write('WAVE', 8);
bytes.write('fmt ', 12);
bytes.writeUInt32LE(16, 16);
bytes.writeUInt16LE(1, 20);
bytes.writeUInt16LE(1, 22);
bytes.writeUInt32LE(SR, 24);
bytes.writeUInt32LE(SR * 2, 28);
bytes.writeUInt16LE(2, 32);
bytes.writeUInt16LE(16, 34);
bytes.write('data', 36);
bytes.writeUInt32LE(TOTAL * 2, 40);

for (let i = 0; i < TOTAL; i += 1) {
  const value = Math.tanh(samples[i] * gain * 1.1);
  bytes.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, bytes);
console.log(`wrote ${OUT} â€” ${DURATION}s, ${(bytes.length / 1024 / 1024).toFixed(1)} MB`);
