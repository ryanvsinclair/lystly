"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
import { saveTheme } from "@/app/app/actions";
import {
  DEFAULT_THEME_ID,
  DEFAULT_THEME_MODE,
  applyThemeToShell,
} from "@/lib/themes.js";

const ThemeStateContext = createContext({
  themeId: DEFAULT_THEME_ID,
  mode: DEFAULT_THEME_MODE,
  async setAppearance() {},
});

export function ThemeState({ themeId, mode, children }) {
  const [state, setState] = useState({
    themeId: themeId || DEFAULT_THEME_ID,
    mode: mode || DEFAULT_THEME_MODE,
  });

  useLayoutEffect(() => {
    applyThemeToShell(state.themeId, state.mode);
    return () => {
      document.documentElement.style.removeProperty("--app-page");
    };
  }, [state.themeId, state.mode]);

  const value = useMemo(
    () => ({
      themeId: state.themeId,
      mode: state.mode,
      async setAppearance(next) {
        const previous = state;
        const merged = {
          themeId: next.themeId || state.themeId,
          mode: next.mode || state.mode,
        };
        setState(merged);
        applyThemeToShell(merged.themeId, merged.mode);
        try {
          await saveTheme(merged);
        } catch (err) {
          setState(previous);
          applyThemeToShell(previous.themeId, previous.mode);
          throw err;
        }
      },
    }),
    [state]
  );

  return <ThemeStateContext.Provider value={value}>{children}</ThemeStateContext.Provider>;
}

export function useThemeState() {
  return useContext(ThemeStateContext);
}
