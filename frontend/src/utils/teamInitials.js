/**
 * Automatic Team Initials Generator.
 *
 * Derives a short (max 3-letter) representation for ANY team name without
 * relying on hardcoded abbreviations, so all current and future tournaments
 * and teams work out of the box. This is the single source of truth used
 * everywhere a short team representation or logo fallback is required.
 *
 *   ISANGO                 -> ISA
 *   MIGUTU                 -> MIG
 *   KWITONYI               -> KWI
 *   SIMBA SPORTS CLUB      -> SSC
 *   YOUNG AFRICANS SC      -> YAS
 *   MANCHESTER UNITED      -> MAU
 *   REAL MADRID CF         -> RMC
 *   KWITONYI YOUNG STARS   -> KYS
 *   KINESI VILLAGE FC      -> KVF
 */
export function getTeamInitials(teamName) {
  if (!teamName) return 'N/A';

  const words = teamName
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'N/A';

  // Single-word teams: first three letters.
  if (words.length === 1) {
    return words[0].slice(0, 3);
  }

  // Two-word teams: two letters from the first word + one from the second.
  if (words.length === 2) {
    return (words[0].slice(0, 2) + words[1].slice(0, 1)).substring(0, 3);
  }

  // Three or more words: first letter of the first three words.
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .substring(0, 3);
}

// Distinct, deterministic gradient palette for generated team avatars.
const AVATAR_GRADIENTS = [
  ['#ef4444', '#7f1d1d'],
  ['#f97316', '#7c2d12'],
  ['#f59e0b', '#78350f'],
  ['#10b981', '#064e3b'],
  ['#14b8a6', '#134e4a'],
  ['#06b6d4', '#155e75'],
  ['#3b82f6', '#1e3a8a'],
  ['#6366f1', '#312e81'],
  ['#8b5cf6', '#4c1d95'],
  ['#a855f7', '#581c87'],
  ['#ec4899', '#831843'],
  ['#e11d48', '#881337'],
];

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #475569 0%, #1e293b 100%)';

/**
 * Returns a stable CSS gradient for a team based on its name, so the same team
 * always renders the same color across the app while different teams stay
 * visually distinct. Used as the background for generated initial avatars.
 */
export function getTeamGradient(teamName) {
  if (!teamName) return DEFAULT_GRADIENT;

  const key = teamName.trim().toUpperCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  const [from, to] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}
