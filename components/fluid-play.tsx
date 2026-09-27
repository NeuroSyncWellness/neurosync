"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Camera, Palette, Pause, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_FLUID_PLAY_SETTINGS,
  readFluidPlaySettings,
  saveFluidPlaySettings,
} from "@/lib/fluid-play-settings";
import type { FluidPlaySettings } from "@/lib/child-profile";

type FluidSimulationWindow = Window & {
  captureScreenshot?: () => void;
};

export function FluidPlay({ onBack }: { onBack: () => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<FluidPlaySettings>(() =>
    typeof window === "undefined" ? DEFAULT_FLUID_PLAY_SETTINGS : readFluidPlaySettings(),
  );
  const [saveMessage, setSaveMessage] = useState("");
  const frameRef = useRef<HTMLIFrameElement>(null);

  function updateSetting<K extends keyof FluidPlaySettings>(setting: K, value: FluidPlaySettings[K]) {
    setSaveMessage("");
    setSettings((current) => ({ ...current, [setting]: value }));
    frameRef.current?.contentWindow?.postMessage(
      { type: "fluid-play-setting", setting, value },
      window.location.origin,
    );
  }

  function syncSettings() {
    for (const [setting, value] of Object.entries(settings)) {
      frameRef.current?.contentWindow?.postMessage(
        { type: "fluid-play-setting", setting, value },
        window.location.origin,
      );
    }
  }

  function capturePicture() {
    const simulationWindow = frameRef.current?.contentWindow as FluidSimulationWindow | null;
    simulationWindow?.captureScreenshot?.();
  }

  function saveCustomization() {
    try {
      if (!saveFluidPlaySettings(settings)) {
        setSaveMessage("Your settings could not be saved because the child profile is missing.");
        return;
      }
      setSaveMessage("Your settings are saved to your profile.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? `Your settings could not be saved: ${error.message}`
          : "Your settings could not be saved. Please try again.",
      );
    }
  }

  return (
    <main className="fixed inset-0 z-50 overflow-hidden bg-black" aria-label="Fluid Play">
      <iframe
        ref={frameRef}
        title="Fluid Play simulation"
        src="/fluid-simulation/index.html"
        className="absolute inset-0 size-full border-0"
        referrerPolicy="no-referrer"
        onLoad={syncSettings}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="icon-lg"
          className="pointer-events-auto size-12 rounded-2xl bg-background/90 text-foreground shadow-lg backdrop-blur hover:bg-background"
          aria-label="Back to Sensory Room"
          title="Back to Sensory Room"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <Button
            onClick={() => setSettingsOpen((open) => !open)}
            variant="outline"
            size="icon-lg"
            className="size-12 rounded-2xl bg-background/90 text-foreground shadow-lg backdrop-blur hover:bg-background"
            aria-expanded={settingsOpen}
            aria-controls="fluid-play-settings"
            aria-label={settingsOpen ? "Close settings" : "Open settings"}
            title={settingsOpen ? "Close settings" : "Settings"}
          >
            {settingsOpen ? <X aria-hidden="true" /> : <Settings2 aria-hidden="true" />}
          </Button>
          {settingsOpen && (
            <section
              id="fluid-play-settings"
              aria-label="Fluid Play settings"
              className="grid max-h-[calc(100dvh-7rem)] w-[min(22rem,calc(100vw-2rem))] gap-4 overflow-y-auto rounded-2xl bg-background/95 p-4 text-foreground shadow-xl backdrop-blur"
            >
              <h2 className="text-base font-semibold">Make it feel right</h2>
              <SettingsSelect
                id="fluid-quality"
                label="Quality"
                value={settings.quality}
                options={[
                  [1024, "High"],
                  [512, "Medium"],
                  [256, "Low"],
                  [128, "Very low"],
                ]}
                onChange={(value) => updateSetting("quality", value)}
              />
              <SettingsSelect
                id="fluid-simulation-resolution"
                label="Simulation resolution"
                value={settings.simulationResolution}
                options={[[32, "32"], [64, "64"], [128, "128"], [256, "256"]]}
                onChange={(value) => updateSetting("simulationResolution", value)}
              />
              <SettingsRange
                id="fluid-density-diffusion"
                label="Density diffusion"
                value={settings.densityDiffusion}
                min={0}
                max={4}
                step={0.1}
                onChange={(value) => updateSetting("densityDiffusion", value)}
              />
              <SettingsRange
                id="fluid-velocity-diffusion"
                label="Velocity diffusion"
                value={settings.velocityDiffusion}
                min={0}
                max={4}
                step={0.1}
                onChange={(value) => updateSetting("velocityDiffusion", value)}
              />
              <SettingsRange
                id="fluid-pressure"
                label="Pressure"
                value={settings.pressure}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateSetting("pressure", value)}
              />
              <SettingsRange
                id="fluid-vorticity"
                label="Vorticity"
                value={settings.vorticity}
                min={0}
                max={50}
                step={1}
                onChange={(value) => updateSetting("vorticity", value)}
              />
              <SettingsRange
                id="fluid-splat-radius"
                label="Splat radius"
                value={settings.splatRadius}
                min={0.01}
                max={1}
                step={0.01}
                onChange={(value) => updateSetting("splatRadius", value)}
              />
              <SettingsToggle
                icon={<Pause aria-hidden="true" />}
                label="Motion"
                enabled={settings.moving}
                onToggle={() => updateSetting("moving", !settings.moving)}
              />
              <SettingsToggle
                icon={<Palette aria-hidden="true" />}
                label="Shading"
                enabled={settings.shading}
                onToggle={() => updateSetting("shading", !settings.shading)}
              />
              <SettingsToggle
                icon={<Palette aria-hidden="true" />}
                label="Bloom glow"
                enabled={settings.bloom}
                onToggle={() => updateSetting("bloom", !settings.bloom)}
              />
              <SettingsToggle
                icon={<Palette aria-hidden="true" />}
                label="Sunrays"
                enabled={settings.sunrays}
                onToggle={() => updateSetting("sunrays", !settings.sunrays)}
              />
              <SettingsToggle
                icon={<Palette aria-hidden="true" />}
                label="Colorful"
                enabled={settings.colorful}
                onToggle={() => updateSetting("colorful", !settings.colorful)}
              />
              <Button
                variant="outline"
                className="h-11 justify-start rounded-xl"
                onClick={capturePicture}
              >
                <Camera aria-hidden="true" />
                Save a picture
              </Button>
              <Button className="h-11 rounded-xl" onClick={saveCustomization}>
                Save changes to my profile
              </Button>
              {saveMessage && <p role="status" className="text-sm text-muted-foreground">{saveMessage}</p>}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function SettingsSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  options: Array<[number, string]>;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="grid gap-1 text-sm font-medium">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 rounded-lg border border-input bg-background px-3"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function SettingsRange({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="grid gap-1 text-sm font-medium">
      <span className="flex items-center justify-between gap-3">
        {label}
        <output htmlFor={id} className="font-normal tabular-nums text-muted-foreground">
          {value.toFixed(step < 1 ? 2 : 0)}
        </output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-6 w-full cursor-pointer accent-primary"
      />
    </label>
  );
}

function SettingsToggle({
  icon,
  label,
  enabled,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-11 justify-start rounded-xl"
      aria-pressed={enabled}
      onClick={onToggle}
    >
      {icon}
      {label}: {enabled ? "On" : "Off"}
    </Button>
  );
}
