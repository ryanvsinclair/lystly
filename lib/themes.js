export const DEFAULT_THEME_ID = "frost";
export const DEFAULT_THEME_MODE = "light";

const FROST = {
  light: {
    page: "#f2f2f7",
    ink: "#111111",
    muted: "rgba(17, 17, 17, 0.62)",
    glass: "#ffffff",
    well: "#3a3a3c",
    wellType: "#ffffff",
    lid: "#ffffff",
    lidType: "#111111",
    line: "rgba(17, 17, 17, 0.12)",
    solid: "#111111",
    solidType: "#ffffff",
    stage: "#ffffff",
    ok: "#111111",
    danger: "#b42318",
    dangerSoft: "rgba(180, 35, 24, 0.12)",
    shadow: "rgba(17, 17, 17, 0.12)",
    barFace: "light",
  },
  dark: {
    page: "#111111",
    ink: "#f2f2f7",
    muted: "rgba(242, 242, 247, 0.68)",
    glass: "#2c2c2e",
    well: "#3a3a3c",
    wellType: "#f2f2f7",
    lid: "#e5e5ea",
    lidType: "#111111",
    line: "rgba(242, 242, 247, 0.14)",
    solid: "#f2f2f7",
    solidType: "#111111",
    stage: "#1c1c1e",
    ok: "#f2f2f7",
    danger: "#ffb4b4",
    dangerSoft: "rgba(255, 180, 180, 0.16)",
    shadow: "rgba(0, 0, 0, 0.4)",
    barFace: "dark",
  },
};

export const APP_MODES = [
  { id: "light", name: "Light", note: "Grey page, white lids, black type." },
  { id: "dark", name: "Dark", note: "Black page, grey lids, white type." },
];

export const APP_PALETTES = [
  { id: "frost", name: "White frost", note: "White, grey, and black." },
];

export const APP_THEMES = APP_PALETTES;

export function isThemeId(id) {
  return typeof id === "string" && id.length > 0;
}

export function isThemeMode(mode) {
  return mode === "light" || mode === "dark";
}

function frostTheme(mode) {
  const tokens = FROST[mode];
  return {
    id: "frost",
    name: "White frost",
    note: "White, grey, and black. Lighter lid on a darker well.",
    mode,
    page: tokens.page,
    pageType: tokens.ink,
    pageMuted: tokens.muted,
    panel: tokens.glass,
    panelType: tokens.ink,
    panelMuted: tokens.muted,
    panelBorder: tokens.line,
    control: tokens.glass,
    controlType: tokens.ink,
    controlMuted: tokens.muted,
    ok: tokens.ok,
    danger: tokens.danger,
    dangerSoft: tokens.dangerSoft,
    shadow: tokens.shadow,
    bar: tokens.glass,
    barType: tokens.ink,
    barFace: tokens.barFace,
    accent: tokens.solid,
    accentType: tokens.solidType,
    accentSoft: mode === "dark" ? "rgba(242, 242, 247, 0.14)" : "rgba(17, 17, 17, 0.08)",
    accentRing: mode === "dark" ? "rgba(242, 242, 247, 0.32)" : "rgba(17, 17, 17, 0.22)",
    card: tokens.glass,
    stage: tokens.stage,
    well: tokens.well,
    wellType: tokens.wellType,
    lid: tokens.lid,
    lidType: tokens.lidType,
  };
}

export function getTheme(_id, mode = DEFAULT_THEME_MODE) {
  return frostTheme(isThemeMode(mode) ? mode : DEFAULT_THEME_MODE);
}

export function themeCssVars(theme, mode) {
  const next = theme?.page ? theme : getTheme(theme, mode);
  return {
    "--app-page": next.page,
    "--app-page-type": next.pageType,
    "--app-page-muted": next.pageMuted,
    "--app-panel": next.panel,
    "--app-panel-type": next.panelType,
    "--app-panel-muted": next.panelMuted,
    "--app-panel-border": next.panelBorder,
    "--app-control": next.control,
    "--app-control-type": next.controlType,
    "--app-control-muted": next.controlMuted,
    "--app-ok": next.ok,
    "--app-danger": next.danger,
    "--app-danger-soft": next.dangerSoft,
    "--app-shadow": next.shadow,
    "--app-bar": next.bar,
    "--app-bar-type": next.barType,
    "--app-accent": next.accent,
    "--app-accent-type": next.accentType,
    "--app-accent-soft": next.accentSoft,
    "--app-accent-ring": next.accentRing,
    "--app-card": next.card,
    "--app-stage": next.stage,
    "--app-well": next.well,
    "--app-well-type": next.wellType,
    "--app-lid": next.lid,
    "--app-lid-type": next.lidType,
  };
}

export function applyThemeToShell(themeId, mode) {
  if (typeof document === "undefined") return;
  const shell = document.querySelector(".app-shell");
  if (!shell) return;
  const theme = getTheme(themeId, mode);
  Object.entries(themeCssVars(theme)).forEach(([key, value]) => {
    shell.style.setProperty(key, value);
    if (key === "--app-page") document.documentElement.style.setProperty(key, value);
  });
  shell.dataset.theme = theme.id;
  shell.dataset.mode = theme.mode;
  shell.dataset.bar = theme.barFace;
}
