/**
 * Single source of truth for the commercial's timing.
 *
 * 2,100 frames at 30fps = 70 seconds. Scenes are sequenced in Root.tsx from
 * this table, so adding or retiming a scene never requires touching the others.
 */

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

export interface SceneSpec {
  id: string;
  frames: number;
  /** Shown in the Remotion Studio timeline. */
  labelFa: string;
}

export const SCENES: SceneSpec[] = [
  { id: 'ColdOpen', frames: 180, labelFa: 'ورود کریستال' },
  { id: 'Problem', frames: 240, labelFa: 'بی‌نظمی' },
  { id: 'OrderFlow', frames: 300, labelFa: 'چرخهٔ سفارش' },
  { id: 'Kitchen', frames: 240, labelFa: 'آشپزخانه' },
  { id: 'Inventory', frames: 240, labelFa: 'موجودی' },
  { id: 'Analytics', frames: 300, labelFa: 'سود' },
  { id: 'Marketing', frames: 240, labelFa: 'بازاریابی' },
  { id: 'Product', frames: 240, labelFa: 'کابین' },
  { id: 'Outro', frames: 120, labelFa: 'پایان' },
];

export const TOTAL_FRAMES = SCENES.reduce((sum, scene) => sum + scene.frames, 0);

export function sceneOffset(id: string): number {
  let offset = 0;
  for (const scene of SCENES) {
    if (scene.id === id) return offset;
    offset += scene.frames;
  }
  return 0;
}

export function sceneFrames(id: string): number {
  return SCENES.find((scene) => scene.id === id)?.frames ?? 0;
}
