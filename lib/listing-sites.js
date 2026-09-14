const SITES = [
  { id: "pf", label: "Property Finder", hosts: ["propertyfinder.ae", "propertyfinder.com"], supported: true },
  { id: "crm", label: "McCone CRM", hosts: ["mcconecrm.com"], supported: true },
  { id: "bayut", label: "Bayut", hosts: ["bayut.com"], supported: true },
  { id: "dubizzle", label: "dubizzle", hosts: ["dubizzle.com"], supported: false },
  { id: "realtor", label: "REALTOR.ca", hosts: ["realtor.ca"], supported: false },
  { id: "housesigma", label: "HouseSigma", hosts: ["housesigma.com"], supported: true },
  { id: "zolo", label: "Zolo", hosts: ["zolo.ca"], supported: true },
  { id: "centris", label: "Centris", hosts: ["centris.ca"], supported: true },
  { id: "rew", label: "REW", hosts: ["rew.ca"], supported: false },
  { id: "propertyca", label: "Property.ca", hosts: ["property.ca"], supported: true },
  { id: "wahi", label: "Wahi", hosts: ["wahi.com"], supported: true },
];

function bareHost(hostname) {
  return String(hostname || "")
    .toLowerCase()
    .replace(/^www\./, "");
}

function hostMatches(hostname, allowed) {
  const host = bareHost(hostname);
  const target = bareHost(allowed);
  return host === target || host.endsWith(`.${target}`);
}

export function parseListingUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value}`);
    } catch {
      return null;
    }
  }
}

export function portalFromHostname(hostname) {
  return (
    SITES.find((site) => site.hosts.some((host) => hostMatches(hostname, host))) ||
    null
  );
}

export function siteLabelFromLink(raw) {
  const parsed = parseListingUrl(raw);
  if (!parsed) return "This site";
  const portal = portalFromHostname(parsed.hostname);
  if (portal) return portal.label;
  return brandFromHost(parsed.hostname);
}

function brandFromHost(hostname) {
  const host = bareHost(hostname);
  const parts = host.split(".").filter(Boolean);
  let name = parts[0] || "This site";
  if (parts.length >= 3 && ["co", "com", "org", "net"].includes(parts[parts.length - 2])) {
    name = parts[parts.length - 3];
  } else if (parts.length >= 2) {
    name = parts[parts.length - 2];
  }
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function isSupportedListingLink(raw) {
  const parsed = parseListingUrl(raw);
  if (!parsed || !/^https?:$/.test(parsed.protocol)) return false;
  const portal = portalFromHostname(parsed.hostname);
  return Boolean(portal?.supported);
}

export function comingSoonMessage(raw) {
  return `${siteLabelFromLink(raw)} support coming soon`;
}

export function unsupportedListingMessage(raw) {
  const parsed = parseListingUrl(raw);
  if (!parsed || !/^https?:$/.test(parsed.protocol)) return "";
  if (isSupportedListingLink(raw)) return "";
  return comingSoonMessage(raw);
}
