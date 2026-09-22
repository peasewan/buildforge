// Enable only reviewed batches. Do not replace this with a global kind switch.
export const EXPERIENCE_PATHS: readonly string[] = [
  "/wow-forever-warrior-builds",
  "/wow-forever-fury-warrior-build",
  "/wow-forever-fury-warrior-leveling-build",
  "/wow-forever-arms-warrior-pvp-build",
  "/wow-forever-protection-warrior-dungeon-build",
  "/wow-forever-warrior-talents",
  "/wow-forever-arms-vs-fury-warrior-leveling",
  "/warrior",
  "/wow-forever-warrior-leveling-build",
  "/wow-forever-arms-warrior-build",
  "/wow-forever-protection-warrior-build",
  "/wow-forever-arms-warrior-leveling-build",
  "/wow-forever-protection-warrior-leveling-build",
  "/wow-forever-warrior-pvp-build",
  "/wow-forever-fury-warrior-pvp-build",
  "/wow-forever-protection-warrior-pvp-build",
  "/wow-forever-warrior-dungeon-build",
  "/wow-forever-warrior-level-20-build",
  "/wow-forever-arms-warrior-talents",
  "/wow-forever-protection-warrior-talents",
  "/mage"
]
const enabled = new Set(EXPERIENCE_PATHS)
export const experienceEnabled = (pathname: string): boolean => enabled.has(pathname.replace(/\/$/, "") || "/")

// Date of this UI release; data verification dates remain unchanged.
export const EXPERIENCE_RELEASE_DATE = '2026-09-23'
export const experienceLastmod = (pathname: string, previous: string): string =>
  experienceEnabled(pathname) && previous < EXPERIENCE_RELEASE_DATE ? EXPERIENCE_RELEASE_DATE : previous
