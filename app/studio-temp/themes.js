export const VALLEY = {
  emerald: "#059669",
  sky: "#0ea5e9",
  gold: "#eab308",
  deep: "#042f2e",
  cream: "#f4f0e8",
  turquoise: "#3d9a7a",
  white: "#ffffff",
};

const CREAM = VALLEY.cream;
const DEEP = VALLEY.deep;

function onColor(hex) {
  return hex === VALLEY.gold || hex === VALLEY.sky || hex === VALLEY.cream
    ? DEEP
    : CREAM;
}

function combo(id, name, note, { panel, bar, accent }) {
  const type = onColor(panel);
  const barType = onColor(bar);
  const accentType = onColor(accent);
  const onDark = type === CREAM;

  return {
    id,
    name,
    note,
    panel,
    bar,
    accent,
    type,
    barType,
    accentType,
    muted: onDark ? "rgba(244, 240, 232, 0.62)" : "rgba(4, 47, 46, 0.58)",
    border: onDark ? "rgba(244, 240, 232, 0.18)" : "rgba(4, 47, 46, 0.14)",
    buttonBg: onDark ? "rgba(244, 240, 232, 0.1)" : "rgba(4, 47, 46, 0.06)",
    stage: VALLEY.white,
    hint: accent,
    switchBg: "rgba(4, 47, 46, 0.06)",
    switchType: "#3d4a6b",
  };
}

export const STUDIO_THEMES = [
  combo("deep-emerald", "Deep + emerald", "Landing slab, mesh green on controls.", {
    panel: VALLEY.deep,
    bar: VALLEY.deep,
    accent: VALLEY.emerald,
  }),
  combo("deep-sky", "Deep + sky", "Landing slab, mesh blue on controls.", {
    panel: VALLEY.deep,
    bar: VALLEY.deep,
    accent: VALLEY.sky,
  }),
  combo("deep-gold", "Deep + gold", "Landing slab, mesh gold on controls.", {
    panel: VALLEY.deep,
    bar: VALLEY.deep,
    accent: VALLEY.gold,
  }),
  combo("deep-cream-bar", "Deep + cream bar", "Dark sidebar, cream top bar, emerald accent.", {
    panel: VALLEY.deep,
    bar: VALLEY.cream,
    accent: VALLEY.emerald,
  }),
  combo("emerald-gold", "Emerald + gold", "Green sidebar, gold controls.", {
    panel: VALLEY.emerald,
    bar: VALLEY.deep,
    accent: VALLEY.gold,
  }),
  combo("emerald-sky", "Emerald + sky", "Green sidebar, blue controls.", {
    panel: VALLEY.emerald,
    bar: VALLEY.deep,
    accent: VALLEY.sky,
  }),
  combo("turquoise-gold", "Turquoise + gold", "Your swatch, gold controls.", {
    panel: VALLEY.turquoise,
    bar: VALLEY.deep,
    accent: VALLEY.gold,
  }),
  combo("turquoise-sky", "Turquoise + sky", "Your swatch, blue controls.", {
    panel: VALLEY.turquoise,
    bar: VALLEY.deep,
    accent: VALLEY.sky,
  }),
  combo("turquoise-emerald", "Turquoise + emerald", "Swatch sidebar, mesh green controls.", {
    panel: VALLEY.turquoise,
    bar: VALLEY.deep,
    accent: VALLEY.emerald,
  }),
  combo("turquoise-cream-bar", "Turquoise + cream bar", "Swatch sidebar, cream bar, gold accent.", {
    panel: VALLEY.turquoise,
    bar: VALLEY.cream,
    accent: VALLEY.gold,
  }),
  combo("forest-sky", "Forest + sky", "Dark teal sidebar, blue controls.", {
    panel: "#064e4c",
    bar: VALLEY.deep,
    accent: VALLEY.sky,
  }),
  combo("forest-gold", "Forest + gold", "Dark teal sidebar, gold controls.", {
    panel: "#064e4c",
    bar: VALLEY.deep,
    accent: VALLEY.gold,
  }),
];
