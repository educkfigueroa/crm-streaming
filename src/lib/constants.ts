export const PLATAFORMAS = [
  { value: "netflix", label: "Netflix", icon: "Tv", maxPerfiles: 5, color: "red" },
  { value: "disney", label: "Disney+", icon: "Tv", maxPerfiles: 6, color: "blue" },
  { value: "hbo_standard", label: "HBO Max Standard", icon: "Tv", maxPerfiles: 3, color: "purple" },
  { value: "hbo_platinum", label: "HBO Max Platinum", icon: "Tv", maxPerfiles: 5, color: "purple" },
  { value: "amazon", label: "Amazon Prime", icon: "Tv", maxPerfiles: 5, color: "cyan" },
  { value: "paramount", label: "Paramount+", icon: "Tv", maxPerfiles: 5, color: "sky" },
  { value: "vix", label: "Vix", icon: "Tv", maxPerfiles: 4, color: "pink" },
  { value: "crunchyroll", label: "Crunchyroll", icon: "Tv", maxPerfiles: 5, color: "orange" },
  { value: "spotify", label: "Spotify Familiar", icon: "Music", maxPerfiles: 6, color: "green" },
  { value: "apple_music", label: "Apple Music", icon: "Music", maxPerfiles: 5, color: "rose" },
  { value: "otro", label: "Otro", icon: "MoreHorizontal", maxPerfiles: null, color: "slate" },
] as const;

export const PLATAFORMA_IPTV = { value: "iptv", label: "IPTV (Xtream Code)", icon: "Radio", maxPerfiles: 3, color: "teal" } as const;

export type PlataformaValue = (typeof PLATAFORMAS)[number]["value"];

export const MONEDA = "S/";

export function getPlataformaByValue(value: string) {
  return PLATAFORMAS.find((p) => p.value === value);
}

export function getMaxPerfiles(value: string): number | null {
  const plataforma = getPlataformaByValue(value);
  return plataforma?.maxPerfiles ?? null;
}

export function isIptv(value: string): boolean {
  return value === "iptv";
}

const PLATFORMS_WITHOUT_PIN = ["crunchyroll"];

export function hasPin(value: string): boolean {
  return !PLATFORMS_WITHOUT_PIN.includes(value);
}

const PLATFORM_COLORS: Record<string, { badge: string; dot: string }> = {
  red:    { badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",    dot: "bg-red-500 dark:bg-red-400" },
  blue:   { badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",  dot: "bg-blue-500 dark:bg-blue-400" },
  purple: { badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", dot: "bg-purple-500 dark:bg-purple-400" },
  cyan:   { badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",  dot: "bg-cyan-500 dark:bg-cyan-400" },
  sky:    { badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",     dot: "bg-sky-500 dark:bg-sky-400" },
  pink:   { badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",   dot: "bg-pink-500 dark:bg-pink-400" },
  orange: { badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", dot: "bg-orange-500 dark:bg-orange-400" },
  green:  { badge: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", dot: "bg-green-500 dark:bg-green-400" },
  rose:   { badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",   dot: "bg-rose-500 dark:bg-rose-400" },
  slate:  { badge: "bg-muted text-muted-foreground border-border",                           dot: "bg-muted-foreground/50" },
  teal:   { badge: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",  dot: "bg-teal-500 dark:bg-teal-400" },
};

export function getPlatformColorClasses(color: string) {
  return PLATFORM_COLORS[color] ?? PLATFORM_COLORS.slate;
}

export const ESTADOS_SUSCRIPCION = [
  { value: "Activo", label: "Activo", color: "green" },
  { value: "Por Vencer", label: "Por Vencer", color: "yellow" },
  { value: "Vencido", label: "Vencido", color: "red" },
  { value: "Suspendido", label: "Suspendido", color: "gray" },
] as const;

export const PLATAFORMA_URLS: Record<string, string> = {
  netflix: "https://netflix.com",
  disney: "https://disneyplus.com",
  hbo_standard: "https://max.com",
  hbo_platinum: "https://max.com",
  amazon: "https://primevideo.com",
  paramount: "https://paramountplus.com",
  vix: "https://vix.com",
  crunchyroll: "https://crunchyroll.com",
  spotify: "https://spotify.com",
  apple_music: "https://music.apple.com",
};

export function getPlataformaUrl(plataforma: string): string | null {
  return PLATAFORMA_URLS[plataforma] ?? null;
}
