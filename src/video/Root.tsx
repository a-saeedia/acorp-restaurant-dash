import type { ComponentType } from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from 'remotion';
import '../design/index.css';
import { SCENES, TOTAL_FRAMES, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from './timeline';
import { ColdOpen } from './scenes/ColdOpen';
import { Problem } from './scenes/Problem';
import { OrderFlow } from './scenes/OrderFlow';
import { Kitchen } from './scenes/Kitchen';
import { Inventory } from './scenes/Inventory';
import { Analytics } from './scenes/Analytics';
import { Marketing } from './scenes/Marketing';
import { Product } from './scenes/Product';
import { Outro } from './scenes/Outro';

const REGISTRY: Record<string, ComponentType> = {
  ColdOpen,
  Problem,
  OrderFlow,
  Kitchen,
  Inventory,
  Analytics,
  Marketing,
  Product,
  Outro,
};

/**
 * The film, assembled from the timeline table. Each scene is a plain
 * frame-driven component, so any scene can be re-rendered in isolation from
 * the Studio sidebar.
 */
function Commercial() {
  let offset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050208' }}>
      <Audio src={staticFile('audio/bed.wav')} volume={0.55} />
      {SCENES.map((scene) => {
        const Scene = REGISTRY[scene.id];
        const from = offset;
        offset += scene.frames;
        if (!Scene) return null;
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.frames}
            premountFor={30}
            name={`${scene.id} â€” ${scene.labelFa}`}
          >
            <Scene />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export function RemotionRoot() {
  return (
    <Composition
      id="ACorpCommercial"
      component={Commercial}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO_FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
}
