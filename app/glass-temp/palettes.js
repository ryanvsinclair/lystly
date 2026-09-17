import { getTheme } from "@/lib/themes.js";

function fromTheme(mode) {
  const theme = getTheme("frost", mode);
  return {
    page: theme.page,
    ink: theme.pageType,
    muted: theme.pageMuted,
    glass: theme.panel,
    glassBorder: "transparent",
    highlight: "transparent",
    well: theme.well,
    wellType: theme.wellType,
    lid: theme.lid,
    lidType: theme.lidType,
    chip: theme.panel,
    chipType: theme.panelType,
    solid: theme.accent,
    solidType: theme.accentType,
    line: theme.panelBorder,
    stage: theme.stage,
    frost: mode === "dark" ? "rgba(17, 17, 17, 0.4)" : "rgba(255, 255, 255, 0.4)",
  };
}

export const GLASS_PALETTES = [
  {
    id: "frost",
    name: "White frost",
    note: "White, grey, and black. Glass is a lighter lid on a darker well.",
    light: fromTheme("light"),
    dark: fromTheme("dark"),
  },
];

export function paletteVars(tokens) {
  return {
    "--page": tokens.page,
    "--ink": tokens.ink,
    "--muted": tokens.muted,
    "--glass": tokens.glass,
    "--glass-border": tokens.glassBorder,
    "--highlight": tokens.highlight,
    "--chip": tokens.chip,
    "--chip-type": tokens.chipType,
    "--solid": tokens.solid,
    "--solid-type": tokens.solidType,
    "--line": tokens.line,
    "--stage": tokens.stage,
    "--frost": tokens.frost,
    "--well": tokens.well || tokens.chip,
    "--well-type": tokens.wellType || tokens.chipType,
    "--lid": tokens.lid || tokens.glass,
    "--lid-type": tokens.lidType || tokens.ink,
  };
}
