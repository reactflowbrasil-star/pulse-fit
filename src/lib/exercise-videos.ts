import squat from "@/assets/videos/squat.mp4.asset.json";
import pushup from "@/assets/videos/pushup.mp4.asset.json";
import plank from "@/assets/videos/plank.mp4.asset.json";
import jumpingjack from "@/assets/videos/jumpingjack.mp4.asset.json";
import lunge from "@/assets/videos/lunge.mp4.asset.json";
import burpee from "@/assets/videos/burpee.mp4.asset.json";

import type { AnimationId } from "@/lib/exercise-catalog";

/**
 * Photorealistic exercise reference clips, keyed by animation id.
 * When a mapping exists we show the real video instead of the procedural
 * 3D avatar — closer to "true" photorealism than any procedural render.
 */
export const exerciseVideos: Partial<Record<AnimationId, string>> = {
  squat: squat.url,
  pushup: pushup.url,
  plank: plank.url,
  jumpingjack: jumpingjack.url,
  lunge: lunge.url,
  burpee: burpee.url,
};
