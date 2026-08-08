export interface ThemeTokens {
  bg: string;
  panel: string;
  panel2: string;
  border: string;
  borderSoft: string;
  text: string;
  muted: string;
}

export interface Palette {
  group: string;
  id: string;
  name: string;
  accent: string;
  accent2: string;
  accentInk: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

export const DEFAULT_THEME_ID = "esmeralda";
export const THEME_STORAGE_KEY = "crm-theme";

export const THEMES: Palette[] = [
  { group: "Elegida", id: "esmeralda", name: "Esmeralda", accent: "#10b981", accent2: "#06b6d4", accentInk: "#047857",
    light: { bg: "#eaf5ef", panel: "#ffffff", panel2: "#e0eee6", border: "#bfd6c9", borderSoft: "#d9e7de", text: "#0c1f16", muted: "#4a5c52" },
    dark: { bg: "#0c1017", panel: "#121722", panel2: "#161d29", border: "#1f2836", borderSoft: "#1a2331", text: "#e6e9ef", muted: "#94a0b3" } },
  { group: "Serias", id: "corporativo", name: "Corporativo", accent: "#2563eb", accent2: "#1e40af", accentInk: "#1d4ed8",
    light: { bg: "#eaf1f8", panel: "#ffffff", panel2: "#dce8f4", border: "#b8cfe4", borderSoft: "#d3e2f1", text: "#0b1e33", muted: "#46607c" },
    dark: { bg: "#0a1120", panel: "#111a2e", panel2: "#162036", border: "#22304c", borderSoft: "#1a2540", text: "#e4edf8", muted: "#8fa1c0" } },
  { group: "Serias", id: "grafito", name: "Grafito", accent: "#475569", accent2: "#334155", accentInk: "#334155",
    light: { bg: "#eef1f4", panel: "#ffffff", panel2: "#e4e8ee", border: "#c7ceda", borderSoft: "#dbe1e9", text: "#10151c", muted: "#55616f" },
    dark: { bg: "#0c0f14", panel: "#13171e", panel2: "#171c25", border: "#262c37", borderSoft: "#1d222c", text: "#e3e8ee", muted: "#8b97a6" } },
  { group: "Casuales", id: "terracota", name: "Terracota", accent: "#ea6a47", accent2: "#f4a261", accentInk: "#c7502e",
    light: { bg: "#fcf0ea", panel: "#ffffff", panel2: "#f8e2d7", border: "#efc9b9", borderSoft: "#f6ddd2", text: "#332012", muted: "#8a6a58" },
    dark: { bg: "#15100b", panel: "#1d1610", panel2: "#231b14", border: "#3a2f23", borderSoft: "#2a221a", text: "#f9e7dc", muted: "#c9ab97" } },
  { group: "Casuales", id: "oliva", name: "Verde Oliva", accent: "#6aa84f", accent2: "#94c47d", accentInk: "#4f7e39",
    light: { bg: "#eef5ea", panel: "#ffffff", panel2: "#e2eedb", border: "#c4dcb8", borderSoft: "#d9e9d0", text: "#1a2b13", muted: "#61775a" },
    dark: { bg: "#0e120b", panel: "#151b11", panel2: "#1a2115", border: "#2c3a24", borderSoft: "#212b1a", text: "#e9f3e2", muted: "#9cb392" } },
  { group: "Informales", id: "pastel", name: "Pastel", accent: "#f9a8d4", accent2: "#a5b4fc", accentInk: "#db2777",
    light: { bg: "#fdf3fa", panel: "#ffffff", panel2: "#fae6f4", border: "#efc8e4", borderSoft: "#f6dcf0", text: "#331b2c", muted: "#7c6172" },
    dark: { bg: "#150f14", panel: "#1c1520", panel2: "#221a27", border: "#3a2c3e", borderSoft: "#2a2130", text: "#fdeaf6", muted: "#c49bb3" } },
  { group: "Informales", id: "chicle", name: "Chicle", accent: "#f472b6", accent2: "#60a5fa", accentInk: "#db2777",
    light: { bg: "#fdf1f6", panel: "#ffffff", panel2: "#f9e3ee", border: "#f0c4d8", borderSoft: "#f7dce8", text: "#331421", muted: "#7d5d6b" },
    dark: { bg: "#150e12", panel: "#1d1520", panel2: "#241a26", border: "#3b2a3e", borderSoft: "#2c1f30", text: "#fde7f2", muted: "#c596ac" } },
  { group: "Modernas", id: "neon", name: "Neón Futurista", accent: "#00e5ff", accent2: "#7c4dff", accentInk: "#0091b3",
    light: { bg: "#eaf7fb", panel: "#ffffff", panel2: "#d9eef7", border: "#b6dcec", borderSoft: "#d0e9f4", text: "#0b2831", muted: "#4a6b77" },
    dark: { bg: "#0a0c12", panel: "#10141f", panel2: "#151a27", border: "#263049", borderSoft: "#1b2133", text: "#e4f3fb", muted: "#92a6bd" } },
  { group: "Modernas", id: "cyberpunk", name: "Cyberpunk", accent: "#ff2d78", accent2: "#00e5ff", accentInk: "#d61f66",
    light: { bg: "#fbeef3", panel: "#ffffff", panel2: "#f6e0ea", border: "#e9c2d2", borderSoft: "#f3d6e1", text: "#2e1220", muted: "#7b5a68" },
    dark: { bg: "#0d0b12", panel: "#151020", panel2: "#1a1327", border: "#2e2440", borderSoft: "#221a30", text: "#fbe4f0", muted: "#b39bb5" } },
  { group: "Avengers", id: "capitan", name: "Capitán América", accent: "#1d63d8", accent2: "#e23636", accentInk: "#1a4ab5",
    light: { bg: "#eaf1fb", panel: "#ffffff", panel2: "#dbe6f6", border: "#b8cdec", borderSoft: "#d3e1f4", text: "#0c1c33", muted: "#486078" },
    dark: { bg: "#0a1018", panel: "#101826", panel2: "#151e2e", border: "#233048", borderSoft: "#1a2436", text: "#e4ecf8", muted: "#8ea2bd" } },
  { group: "Avengers", id: "ironman", name: "Iron Man", accent: "#c8102e", accent2: "#c9a227", accentInk: "#8f0b20",
    light: { bg: "#f4f1ec", panel: "#ffffff", panel2: "#ece7df", border: "#d6cec2", borderSoft: "#e4ddd3", text: "#1f1710", muted: "#6d6358" },
    dark: { bg: "#100d0b", panel: "#191512", panel2: "#1f1a16", border: "#342c25", borderSoft: "#262019", text: "#f0e9e0", muted: "#b3a694" } },
];

export const THEMES_INDEX: Record<string, Palette> = Object.fromEntries(
  THEMES.map((t) => [t.id, t])
);

export const THEME_GROUPS = [
  "Elegida",
  "Serias",
  "Casuales",
  "Informales",
  "Modernas",
  "Avengers",
];

export function getTheme(id: string | null | undefined): Palette {
  return (id && THEMES_INDEX[id]) || THEMES_INDEX[DEFAULT_THEME_ID];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount) / 100;
  const mix = (c: number) => Math.round((target - c) * p + c);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return "#" + toHex(mix(r)) + toHex(mix(g)) + toHex(mix(b));
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function onAccent(hex: string): string {
  return luminance(hex) > 0.55 ? "#0b0b0f" : "#ffffff";
}

export function applyThemeVars(root: HTMLElement, palette: Palette): void {
  const s = root.style;
  const set = (k: string, v: string) => s.setProperty(k, v);
  set("--t-accent", palette.accent);
  set("--t-accent2", palette.accent2);
  set("--t-accent-deep", shade(palette.accent, -14));
  set("--t-accent2-deep", shade(palette.accent2, -12));
  set("--t-on-accent", onAccent(palette.accent));
  set("--t-bg-light", palette.light.bg);
  set("--t-panel-light", palette.light.panel);
  set("--t-panel2-light", palette.light.panel2);
  set("--t-border-light", palette.light.border);
  set("--t-border-soft-light", palette.light.borderSoft);
  set("--t-text-light", palette.light.text);
  set("--t-muted-light", palette.light.muted);
  set("--t-bg-dark", palette.dark.bg);
  set("--t-panel-dark", palette.dark.panel);
  set("--t-panel2-dark", palette.dark.panel2);
  set("--t-border-dark", palette.dark.border);
  set("--t-border-soft-dark", palette.dark.borderSoft);
  set("--t-text-dark", palette.dark.text);
  set("--t-muted-dark", palette.dark.muted);
  root.dataset.palette = palette.id;
}

export function loadThemeId(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (v && THEMES_INDEX[v]) return v;
  } catch {
    // ignore
  }
  return DEFAULT_THEME_ID;
}

export function saveThemeId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

const SCRIPT_BOOTSTRAP = `
window.__THEME_DATA__ = ${JSON.stringify({
  data: THEMES.map((t) => ({
    id: t.id,
    accent: t.accent,
    accent2: t.accent2,
    light: t.light,
    dark: t.dark,
  })),
  defaultId: DEFAULT_THEME_ID,
  key: THEME_STORAGE_KEY,
})};
(function () {
  var C = window.__THEME_DATA__;
  var id = C.defaultId;
  try {
    var stored = localStorage.getItem(C.key);
    if (stored) {
      for (var i = 0; i < C.data.length; i++) {
        if (C.data[i].id === stored) { id = stored; break; }
      }
    }
  } catch (e) {}
  var t = null;
  for (var j = 0; j < C.data.length; j++) {
    if (C.data[j].id === id) { t = C.data[j]; break; }
  }
  if (!t) return;
  function sh(h, a) {
    var r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
    var target = a < 0 ? 0 : 255, p = Math.abs(a) / 100;
    var m = function (c) { return Math.round((target - c) * p + c); };
    var hx = function (n) { return n.toString(16).padStart(2, "0"); };
    return "#" + hx(m(r)) + hx(m(g)) + hx(m(b));
  }
  function lum(h) {
    var r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b);
  }
  var el = document.documentElement;
  var st = el.style;
  st.setProperty("--t-accent", t.accent);
  st.setProperty("--t-accent2", t.accent2);
  st.setProperty("--t-accent-deep", sh(t.accent, -14));
  st.setProperty("--t-accent2-deep", sh(t.accent2, -12));
  st.setProperty("--t-on-accent", lum(t.accent) > 0.55 ? "#0b0b0f" : "#ffffff");
  st.setProperty("--t-bg-light", t.light.bg);
  st.setProperty("--t-panel-light", t.light.panel);
  st.setProperty("--t-panel2-light", t.light.panel2);
  st.setProperty("--t-border-light", t.light.border);
  st.setProperty("--t-border-soft-light", t.light.borderSoft);
  st.setProperty("--t-text-light", t.light.text);
  st.setProperty("--t-muted-light", t.light.muted);
  st.setProperty("--t-bg-dark", t.dark.bg);
  st.setProperty("--t-panel-dark", t.dark.panel);
  st.setProperty("--t-panel2-dark", t.dark.panel2);
  st.setProperty("--t-border-dark", t.dark.border);
  st.setProperty("--t-border-soft-dark", t.dark.borderSoft);
  st.setProperty("--t-text-dark", t.dark.text);
  st.setProperty("--t-muted-dark", t.dark.muted);
  el.setAttribute("data-palette", id);
})();
`;

export function themeScript(): string {
  return SCRIPT_BOOTSTRAP;
}
