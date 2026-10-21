/**
 * Generates the film's soundtrack locally — no samples, no downloads, no
 * licensing questions. Output: public/audio/bed.wav (88s, 44.1kHz, mono).
 *
 * The bed is three slow pads that change chord at every scene boundary, plus
 * a filtered noise swell and a sub thump on each cut. Deterministic: same
 * numbers in, same WAV out.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/audio/bed.wav');

const SR = 44100;
const DURATION = 88;
const TOTAL = SR * DURATION;

/** Cumulative scene boundaries in seconds, mirroring src/video/timeline.ts. */
const CUTS = [0, 6, 14, 28, 38, 50, 63, 71, 81, 88];

/** A minor-ish pad voicings, one per scene. Frequencies in Hz. */
const CHORDS = [
  [55.0, 82.41, 110.0, 164.81],
  [49.0, 73.42, 98.0, 146.83],
  [55.0, 82.41, 130.81, 164.81],
  [43.65, 65.41, 87.31, 130.81],
  [49.0, 73.42, 110.0, 146.83],
  [55.0, 82.41, 110.0, 164.81],
  [46.25, 69.3, 92.5, 138.59],
  [49.0, 73.42, 98.0, 146.83],
  [55.0, 82.41, 110.0, 164.81],
];

const samples = new Float32Array(TOTAL);

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smooth = (t) => t * t * (3 - 2 * t);

/** Slow amplitude movement so the pad never sounds static. */
function lfo(t, rate, phase = 0) {
  return 0.5 + 0.5 * Math.sin(2 * Math.PI * rate * t + phase);
}

for (let scene = 0; scene < CHORDS.length; scene += 1) {
  const start = CUTS[scene] ?? 0;
  const end = CUTS[scene + 1] ?? DURATION;
  const from = Math.floor(start * SR);
  const to = Math.min(TOTAL, Math.floor(end * SR));
  const chord = CHORDS[scene] ?? CHORDS[0];
  const fade = 1.6;

  for (let i = from; i < to; i += 1) {
    const t = i / SR;
    const local = t - start;
    const remaining = end - t;
    const envelope =
      smooth(clamp01(local / fade)) * smooth(clamp01(remaining / fade + 0.15));

    let value = 0;
    for (let v = 0; v < chord.length; v += 1) {
      const freq = chord[v];
      const detune = 1 + (v % 2 === 0 ? 0.0015 : -0.0015);
      value +=
        Math.sin(2 * Math.PI * freq * detune * t) * (0.055 / (v + 1)) *
        (0.65 + 0.35 * lfo(t, 0.06 + v * 0.017, v));
    }

    // Sub pulse on the bar, very quiet — felt more than heard.
    const beat = 0.5; // 120bpm
    const phase = (t % beat) / beat;
    value += Math.sin(2 * Math.PI * 48 * t) * 0.028 * Math.exp(-phase * 9);

    samples[i] += value * envelope;
  }
}

/** Noise swell + thump on each scene cut. */
let noiseState = 0;
for (let cutIndex = 1; cutIndex < CUTS.length; cutIndex += 1) {
  const cut = CUTS[cutIndex];
  const from = Math.floor((cut - 0.9) * SR);
  const to = Math.min(TOTAL, Math.floor((cut + 0.5) * SR));

  for (let i = from; i < to; i += 1) {
    const t = i / SR;
    const local = t - (cut - 0.9);
    const swell = Math.pow(clamp01(local / 1.4), 2.2) * Math.exp(-Math.max(0, local - 1.05) * 6);
    const white = Math.random() * 2 - 1;
    noiseState += (white - noiseState) * 0.08; // one-pole lowpass → airy swell
    const thump = Math.sin(2 * Math.PI * 62 * t) * Math.exp(-Math.max(0, local - 1.0) * 16);
    samples[i] += noiseState * 0.16 * swell + thump * 0.05 * swell;
  }
}

/** Land the last hit exactly on the final cut. */
for (let i = Math.floor((DURATION - 2.2) * SR); i < TOTAL; i += 1) {
  const t = i / SR;
  const fade = Math.pow(clamp01((DURATION - t) / 2.2), 1.6);
  samples[i] *= fade;
}

// Normalise to -3 dBFS.
let peak = 0;
for (let i = 0; i < TOTAL; i += 1) peak = Math.max(peak, Math.abs(samples[i]));
const gain = peak > 0 ? 0.707 / peak : 1;

const bytes = Buffer.alloc(44 + TOTAL * 2);
bytes.write('RIFF', 0);
bytes.writeUInt32LE(36 + TOTAL * 2, 4);
bytes.write('WAVE', 8);
bytes.write('fmt ', 12);
bytes.writeUInt32LE(16, 16);
bytes.writeUInt16LE(1, 20); // PCM
bytes.writeUInt16LE(1, 22); // mono
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
console.log(`wrote ${OUT} — ${DURATION}s, ${(bytes.length / 1024 / 1024).toFixed(1)} MB`);
