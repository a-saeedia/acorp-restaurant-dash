import { Config } from '@remotion/cli/config';

// 1920x1080 @ 30fps H.264 is the delivery target of the A-Corp commercial.
// Frames are rendered deterministically: no wall-clock timers, no network fetches.
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(18);
Config.setConcurrency(null);
Config.setChromiumOpenGlRenderer('angle');
Config.setOverwriteOutput(true);
