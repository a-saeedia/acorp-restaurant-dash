/**
 * Single source of truth for the commercial's timing.
 *
 * 2,640 frames at 30fps = 88 seconds. Scenes are sequenced in Root.tsx from
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
  { id: 'ColdOpen', frames: 180, labelFa: 'ورود برند' },
  { id: 'Problem', frames: 240, labelFa: 'مسئله' },
  { id: 'OrderFlow', frames: 420, labelFa: 'چرخهٔ سفارش' },
  { id: 'Kitchen', frames: 300, labelFa: 'آشپزخانه' },
  { id: 'Inventory', frames: 360, labelFa: 'موجودی' },
  { id: 'Analytics', frames: 390, labelFa: 'تحلیل' },
  { id: 'Marketing', frames: 240, labelFa: 'بازاریابی' },
  { id: 'Product', frames: 300, labelFa: 'محصول' },
  { id: 'Outro', frames: 210, labelFa: 'پایان' },
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
