import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  APP_COOKIE_OPTIONS,
  ONBOARDED_COOKIE,
  THEME_COOKIE,
  themeCookieValue,
} from "@/lib/app-cookies.js";
import { DEFAULT_THEME_ID, DEFAULT_THEME_MODE } from "@/lib/themes.js";
import { hasSupabaseEnv, supabaseKey, supabaseUrl } from "./env";

function writeAppCookies(response, { onboarded, themeId, mode }) {
  if (onboarded) {
    response.cookies.set(ONBOARDED_COOKIE, "1", APP_COOKIE_OPTIONS);
  }
  response.cookies.set(THEME_COOKIE, themeCookieValue(themeId, mode), APP_COOKIE_OPTIONS);
}

function redirectWithCookies(request, source, pathname) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);
  for (const cookie of source.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  return response;
}

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    if (request.nextUrl.pathname.startsWith("/app")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl(), supabaseKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const path = request.nextUrl.pathname;

  if (!user && (path.startsWith("/app") || path.startsWith("/onboarding"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith("/app") || path === "/onboarding")) {
    let onboarded = request.cookies.get(ONBOARDED_COOKIE)?.value === "1";
    const hasThemeCookie = Boolean(request.cookies.get(THEME_COOKIE)?.value);

    if (!onboarded || !hasThemeCookie) {
      const userId = user.sub;
      const { data: profile } = userId
        ? await supabase
            .from("profiles")
            .select("agency_id, theme_id, theme_mode")
            .eq("id", userId)
            .maybeSingle()
        : { data: null };
      onboarded = Boolean(profile?.agency_id);
      writeAppCookies(supabaseResponse, {
        onboarded,
        themeId: profile?.theme_id || DEFAULT_THEME_ID,
        mode: profile?.theme_mode || DEFAULT_THEME_MODE,
      });
    }

    if (path.startsWith("/app") && !onboarded) {
      return redirectWithCookies(request, supabaseResponse, "/onboarding");
    }

    if (path === "/onboarding" && onboarded) {
      return redirectWithCookies(request, supabaseResponse, "/app");
    }
  }

  return supabaseResponse;
}
