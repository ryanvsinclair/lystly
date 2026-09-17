import { DEFAULT_THEME_ID, DEFAULT_THEME_MODE, isThemeId, isThemeMode } from "@/lib/themes.js";

export const ONBOARDED_COOKIE = "lystly-onboarded";
export const THEME_COOKIE = "lystly-theme";

export const APP_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
};

export function themeCookieValue(themeId, mode) {
  return `${isThemeId(themeId) ? themeId : DEFAULT_THEME_ID}:${isThemeMode(mode) ? mode : DEFAULT_THEME_MODE}`;
}

export function parseThemeCookie(value) {
  const [themeId, mode] = String(value || "").split(":");
  return {
    themeId: isThemeId(themeId) ? themeId : DEFAULT_THEME_ID,
    mode: isThemeMode(mode) ? mode : DEFAULT_THEME_MODE,
  };
}
