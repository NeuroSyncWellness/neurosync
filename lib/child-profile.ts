export const CHILD_PROFILE_STORAGE_KEY = "neurosync-child-profile";
export const CHILD_ACTIVE_THEME_STORAGE_KEY = "neurosync-child-active-theme";

export type DiagnosisStatus = "diagnosed" | "undiagnosed";
export type DisorderId = "ocd" | "adhd" | "asd";
export type Severity = 1 | 2 | 3 | 4 | 5;

export type ChildTheme =
  | "universal"
  | "ocd"
  | "adhd"
  | "asd"
  | "ocd_adhd"
  | "ocd_asd"
  | "adhd_asd";

export type FluidPlaySettings = {
  quality: number;
  simulationResolution: number;
  densityDiffusion: number;
  velocityDiffusion: number;
  pressure: number;
  vorticity: number;
  splatRadius: number;
  shading: boolean;
  bloom: boolean;
  sunrays: boolean;
  colorful: boolean;
  moving: boolean;
};

export type ChildProfile = {
  diagnosisStatus: DiagnosisStatus;
  disorders: Array<{ id: DisorderId; severity: Severity }>;
  recommendedTheme: ChildTheme;
  activeTheme: ChildTheme;
  onboardingCompleted: boolean;
  fluidPlaySettings?: FluidPlaySettings;
};

const disorderOrder: DisorderId[] = ["ocd", "adhd", "asd"];

export function getChildTheme(
  diagnosisStatus: DiagnosisStatus,
  disorders: Array<{ id: DisorderId; severity: Severity }>,
): ChildTheme {
  if (diagnosisStatus === "undiagnosed" || disorders.length === 3) return "universal";

  const meaningful = disorders
    .filter((disorder) => disorder.severity > 1)
    .map((disorder) => disorder.id)
    .sort((a, b) => disorderOrder.indexOf(a) - disorderOrder.indexOf(b));

  if (meaningful.length === 0) return "universal";
  if (meaningful.length === 1) return meaningful[0];

  return `${meaningful[0]}_${meaningful[1]}` as Extract<ChildTheme, `${DisorderId}_${DisorderId}`>;
}

const childThemePalettes = {
  universal: ["parent-purple-light", "parent-purple-dark"],
  ocd: ["parent-plum-light", "parent-plum-dark"],
  adhd: ["adhd-sea-light", "adhd-sea-dark"],
  asd: ["asd-sage-light", "asd-sage-dark"],
  ocd_adhd: ["child-ocd-adhd-light", "child-ocd-adhd-dark"],
  ocd_asd: ["child-ocd-asd-light", "child-ocd-asd-dark"],
  adhd_asd: ["child-adhd-asd-light", "child-adhd-asd-dark"],
} satisfies Record<ChildTheme, [string, string]>;

export function getDisorderLabel(disorder: DisorderId) {
  return disorder.toUpperCase();
}

export function getThemeLabel(theme: ChildTheme) {
  return theme === "universal"
    ? "Universal"
    : theme.split("_").map((part) => part.toUpperCase()).join(" + ");
}

export function readChildProfile(): ChildProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CHILD_PROFILE_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ChildProfile;
  } catch {
    return null;
  }
}

export function saveChildProfile(profile: ChildProfile) {
  localStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  localStorage.setItem(CHILD_ACTIVE_THEME_STORAGE_KEY, profile.activeTheme);
}

export function applyChildTheme(theme: ChildTheme, dark: boolean) {
  document.documentElement.setAttribute("data-theme", childThemePalettes[theme][dark ? 1 : 0]);
  document.documentElement.setAttribute("data-child-theme", theme);
}

export function applyFamilyTheme(dark: boolean, palette: string) {
  const normalizedPalette = palette === "plum" ? "plum-light" : palette;
  const theme = normalizedPalette === "plum-contrast"
    ? "parent-plum-contrast"
    : normalizedPalette === "plum-light"
      ? dark ? "parent-plum-dark" : "parent-plum-light"
      : dark ? "parent-purple-dark" : "parent-purple-light";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.removeAttribute("data-child-theme");
}
