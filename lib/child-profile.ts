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

export type ChildProfile = {
  diagnosisStatus: DiagnosisStatus;
  disorders: Array<{ id: DisorderId; severity: Severity }>;
  recommendedTheme: ChildTheme;
  activeTheme: ChildTheme;
  onboardingCompleted: boolean;
};

const disorderOrder: DisorderId[] = ["ocd", "adhd", "asd"];

export function getChildTheme(
  diagnosisStatus: DiagnosisStatus,
  disorders: Array<{ id: DisorderId; severity: Severity }>,
): ChildTheme {
  if (diagnosisStatus === "undiagnosed" || disorders.length === 3) return "universal";
  if (disorders.length === 1) return disorders[0].id;

  const meaningful = disorders
    .filter((disorder) => disorder.severity > 1)
    .map((disorder) => disorder.id)
    .sort((a, b) => disorderOrder.indexOf(a) - disorderOrder.indexOf(b));

  if (meaningful.length === 0) return "universal";
  if (meaningful.length === 1) return meaningful[0];

  return `${meaningful[0]}_${meaningful[1]}` as Extract<ChildTheme, `${DisorderId}_${DisorderId}`>;
}

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
  const palette = {
    universal: dark ? "parent-purple-dark" : "parent-purple-light",
    ocd: dark ? "parent-plum-dark" : "parent-plum-light",
    adhd: dark ? "adhd-sea-dark" : "adhd-sea-light",
    asd: dark ? "asd-sage-dark" : "asd-sage-light",
    ocd_adhd: dark ? "parent-plum-dark" : "parent-plum-light",
    ocd_asd: dark ? "parent-plum-dark" : "parent-plum-light",
    adhd_asd: dark ? "adhd-sea-dark" : "adhd-sea-light",
  } satisfies Record<ChildTheme, string>;

  document.documentElement.setAttribute("data-theme", palette[theme]);
  document.documentElement.setAttribute("data-child-theme", theme);
}

export function applyFamilyTheme(dark: boolean, palette: string) {
  const theme = palette === "plum-contrast"
    ? "parent-plum-contrast"
    : palette === "plum"
      ? dark ? "parent-plum-dark" : "parent-plum-light"
      : dark ? "parent-purple-dark" : "parent-purple-light";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.removeAttribute("data-child-theme");
}
