export function homepageKey(raw) {
  const parsed = parseHomepage(raw);
  if (!parsed) return "";
  return parsed.host;
}

export function normalizeHomepageUrl(raw) {
  const parsed = parseHomepage(raw);
  if (!parsed) return "";
  return `https://${parsed.host}`;
}

export function agencyNameFromHomepage(raw) {
  const parsed = parseHomepage(raw);
  if (!parsed) return "";
  const base = parsed.host.split(".")[0] || parsed.host;
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseHomepage(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!host || !host.includes(".")) return null;
    return { host };
  } catch {
    return null;
  }
}
