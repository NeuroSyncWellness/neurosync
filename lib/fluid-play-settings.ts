import {
  readChildProfile,
  saveChildProfile,
  type FluidPlaySettings,
} from "@/lib/child-profile";

export const DEFAULT_FLUID_PLAY_SETTINGS: FluidPlaySettings = {
  quality: 1024,
  simulationResolution: 128,
  densityDiffusion: 1,
  velocityDiffusion: 0.2,
  pressure: 0.8,
  vorticity: 30,
  splatRadius: 0.25,
  shading: true,
  bloom: true,
  sunrays: true,
  colorful: true,
  moving: true,
};

export function readFluidPlaySettings(): FluidPlaySettings {
  const stored = readChildProfile()?.fluidPlaySettings;
  if (!stored) return { ...DEFAULT_FLUID_PLAY_SETTINGS };

  return {
    quality: [128, 256, 512, 1024].includes(stored.quality)
      ? stored.quality
      : DEFAULT_FLUID_PLAY_SETTINGS.quality,
    simulationResolution: [32, 64, 128, 256].includes(stored.simulationResolution)
      ? stored.simulationResolution
      : DEFAULT_FLUID_PLAY_SETTINGS.simulationResolution,
    densityDiffusion: isInRange(stored.densityDiffusion, 0, 4)
      ? stored.densityDiffusion
      : DEFAULT_FLUID_PLAY_SETTINGS.densityDiffusion,
    velocityDiffusion: isInRange(stored.velocityDiffusion, 0, 4)
      ? stored.velocityDiffusion
      : DEFAULT_FLUID_PLAY_SETTINGS.velocityDiffusion,
    pressure: isInRange(stored.pressure, 0, 1)
      ? stored.pressure
      : DEFAULT_FLUID_PLAY_SETTINGS.pressure,
    vorticity: isInRange(stored.vorticity, 0, 50)
      ? stored.vorticity
      : DEFAULT_FLUID_PLAY_SETTINGS.vorticity,
    splatRadius: isInRange(stored.splatRadius, 0.01, 1)
      ? stored.splatRadius
      : DEFAULT_FLUID_PLAY_SETTINGS.splatRadius,
    shading: typeof stored.shading === "boolean" ? stored.shading : DEFAULT_FLUID_PLAY_SETTINGS.shading,
    bloom: typeof stored.bloom === "boolean" ? stored.bloom : DEFAULT_FLUID_PLAY_SETTINGS.bloom,
    sunrays: typeof stored.sunrays === "boolean" ? stored.sunrays : DEFAULT_FLUID_PLAY_SETTINGS.sunrays,
    colorful: typeof stored.colorful === "boolean" ? stored.colorful : DEFAULT_FLUID_PLAY_SETTINGS.colorful,
    moving: typeof stored.moving === "boolean" ? stored.moving : DEFAULT_FLUID_PLAY_SETTINGS.moving,
  };
}

export function saveFluidPlaySettings(settings: FluidPlaySettings): boolean {
  const profile = readChildProfile();
  if (!profile) return false;

  saveChildProfile({ ...profile, fluidPlaySettings: settings });
  return true;
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
