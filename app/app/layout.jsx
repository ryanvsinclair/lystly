import { cookies } from "next/headers";
import { AppBarProvider } from "@/components/AppBar";
import { AppTransition, AppTransitionBody } from "@/components/AppTransition";
import { ThemeState } from "@/components/ThemeState";
import { parseThemeCookie, THEME_COOKIE } from "@/lib/app-cookies.js";
import { getTheme, themeCssVars } from "@/lib/themes.js";
import "../app-tokens.css";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }) {
  const jar = await cookies();
  const { themeId, mode } = parseThemeCookie(jar.get(THEME_COOKIE)?.value);
  const theme = getTheme(themeId, mode);

  return (
    <div
      className="app-shell"
      data-theme={theme.id}
      data-mode={theme.mode}
      data-bar={theme.barFace}
      style={themeCssVars(theme)}
    >
      <div className="app-shell-veil" aria-hidden />
      <ThemeState themeId={theme.id} mode={theme.mode}>
        <AppTransition>
          <AppBarProvider>
            <div className="app-shell-body">
              <AppTransitionBody>{children}</AppTransitionBody>
            </div>
          </AppBarProvider>
        </AppTransition>
      </ThemeState>
    </div>
  );
}
