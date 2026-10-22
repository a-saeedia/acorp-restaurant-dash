import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SCENES, TOTAL_FRAMES, VIDEO_FPS } from '../video/timeline';

/**
 * The soundtrack is generated outside the bundler, so it hard-codes the film
 * length and scene boundaries. These tests are the guard against the two
 * drifting apart (which silently truncates the audio or shifts every swell).
 */
const root = resolve(__dirname, '../..');
const audioScript = readFileSync(resolve(root, 'scripts/generate-audio.mjs'), 'utf8');
const readme = readFileSync(resolve(root, 'README.md'), 'utf8');

const durationSeconds = TOTAL_FRAMES / VIDEO_FPS;

function audioConstant(name: string): number {
  const match = audioScript.match(new RegExp(`const ${name} = (\\d+);`));
  if (!match) throw new Error(`${name} not found in scripts/generate-audio.mjs`);
  return Number(match[1]);
}

function audioCuts(): number[] {
  const match = audioScript.match(/const CUTS = \[([^\]]+)\];/);
  const body = match?.[1];
  if (!body) throw new Error('CUTS not found in scripts/generate-audio.mjs');
  return body.split(',').map((value) => Number(value.trim()));
}

describe('film timeline', () => {
  it('is 88 seconds at 30fps', () => {
    expect(VIDEO_FPS).toBe(30);
    expect(durationSeconds).toBe(88);
  });

  it('keeps the soundtrack the same length as the film', () => {
    expect(audioConstant('DURATION')).toBe(durationSeconds);
  });

  it('places every audio cut on a real scene boundary', () => {
    const expected: number[] = [0];
    let frames = 0;
    for (const scene of SCENES) {
      frames += scene.frames;
      expected.push(frames / VIDEO_FPS);
    }
    expect(audioCuts()).toEqual(expected);
  });

  it('documents the real duration in the README', () => {
    const seconds = `${durationSeconds} seconds`;
    const frames = `${TOTAL_FRAMES.toLocaleString('en-US')} frames`;
    expect(readme).toContain(frames);
    expect(readme).toContain(seconds);
    expect(readme).not.toContain('90-second');
    expect(readme).not.toContain('2,700 frames');
  });
});
