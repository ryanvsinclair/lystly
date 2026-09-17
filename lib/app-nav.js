export function titleFromPath(pathname) {
  if (!pathname) return "Projects";
  if (pathname.startsWith("/app/settings")) return "Settings";
  if (pathname === "/app" || pathname === "/app/") return "Projects";
  if (pathname.startsWith("/app")) return "Listing Studio";
  return "Projects";
}

export function cleanAppPath(href) {
  if (!href) return "";
  try {
    const url = new URL(href, "http://local.invalid");
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return path;
  } catch {
    return String(href).split("?")[0].replace(/\/+$/, "") || "/";
  }
}

export function isAppPath(pathname) {
  return typeof pathname === "string" && pathname.startsWith("/app");
}

export function isHomePath(pathname) {
  return pathname === "/" || pathname === "";
}

export const HOME_ENTER_KEY = "lystly.home-enter";
export const APP_ENTER_KEY = "lystly.app-enter";
export const AUTH_ENTER_KEY = "lystly.auth-enter";
export const AUTH_SWAP_KEY = "lystly.auth-swap";

export function isAuthPath(pathname) {
  return pathname === "/login" || pathname === "/signup";
}

export function isAuthMeshPath(pathname) {
  return isAuthPath(pathname) || pathname === "/onboarding";
}

function writeFlag(key, attr, stamp = false) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
  if (stamp && typeof document !== "undefined" && attr) {
    document.documentElement.dataset[attr] = "1";
  }
}

function takeFlag(key, attr) {
  let flagged = false;
  try {
    flagged = sessionStorage.getItem(key) === "1";
    if (flagged) sessionStorage.removeItem(key);
  } catch {
    flagged = false;
  }
  if (typeof document !== "undefined" && attr) {
    if (document.documentElement.dataset[attr] === "1") flagged = true;
  }
  return flagged;
}

export function markAppEnter() {
  writeFlag(APP_ENTER_KEY, "appEnter", true);
}

export function takeAppEnter() {
  return takeFlag(APP_ENTER_KEY, "appEnter");
}

export function markAuthEnter() {
  writeFlag(AUTH_ENTER_KEY, "authEnter", true);
}

export function takeAuthEnter() {
  return takeFlag(AUTH_ENTER_KEY, "authEnter");
}

export function markAuthSwap() {
  writeFlag(AUTH_SWAP_KEY);
}

export function takeAuthSwap() {
  return takeFlag(AUTH_SWAP_KEY);
}

export function markEnterForPath(path) {
  if (isHomePath(path)) markHomeEnter();
  else if (isAuthMeshPath(path)) markAuthEnter();
  else if (isAppPath(path)) markAppEnter();
}

export function markLeaveHome(path) {
  if (isAppPath(path)) markAppEnter();
  else if (isAuthMeshPath(path)) markAuthEnter();
}

export function isLeaveHomePath(path) {
  return isAppPath(path) || isAuthMeshPath(path);
}

export function markHomeEnter() {
  writeFlag(HOME_ENTER_KEY, "homeEnter");
}

export function takeHomeEnter() {
  return takeFlag(HOME_ENTER_KEY, "homeEnter");
}

export function clearEnterFlags() {
  try {
    sessionStorage.removeItem(HOME_ENTER_KEY);
    sessionStorage.removeItem(APP_ENTER_KEY);
    sessionStorage.removeItem(AUTH_ENTER_KEY);
    sessionStorage.removeItem(AUTH_SWAP_KEY);
  } catch {
    /* ignore */
  }
  if (typeof document === "undefined") return;
  delete document.documentElement.dataset.homeEnter;
  delete document.documentElement.dataset.appEnter;
  delete document.documentElement.dataset.authEnter;
}

export function clearForeignEnterFlags() {
  try {
    sessionStorage.removeItem(HOME_ENTER_KEY);
    sessionStorage.removeItem(AUTH_ENTER_KEY);
    sessionStorage.removeItem(AUTH_SWAP_KEY);
  } catch {
    /* ignore */
  }
  if (typeof document === "undefined") return;
  delete document.documentElement.dataset.homeEnter;
  delete document.documentElement.dataset.authEnter;
}

export function afterPaint(fn) {
  let done = false;
  let outer = 0;
  let inner = 0;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  outer = window.requestAnimationFrame(() => {
    inner = window.requestAnimationFrame(run);
  });
  const timer = window.setTimeout(run, 50);
  return () => {
    done = true;
    window.cancelAnimationFrame(outer);
    window.cancelAnimationFrame(inner);
    window.clearTimeout(timer);
  };
}
