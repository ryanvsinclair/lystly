import { unsupportedListingMessage } from "@/lib/listing-sites.js";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const CRAWLER_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

const PORTALS = [
  {
    id: "pf",
    label: "Property Finder",
    hosts: ["propertyfinder.ae", "propertyfinder.com"],
    imageHosts: ["static.shared.propertyfinder.ae"],
    currency: "AED",
  },
  {
    id: "crm",
    label: "McCone CRM",
    hosts: ["mcconecrm.com"],
    imageHosts: [],
    currency: "AED",
  },
  {
    id: "bayut",
    label: "Bayut",
    hosts: ["bayut.com"],
    imageHosts: ["images.bayut.com", "static.bayut.com"],
    currency: "AED",
  },
  {
    id: "dubizzle",
    label: "dubizzle",
    hosts: ["dubizzle.com"],
    imageHosts: ["images.dubizzle.com", "dbz-images.dubizzle.com"],
    currency: "AED",
  },
  {
    id: "realtor",
    label: "REALTOR.ca",
    hosts: ["realtor.ca"],
    imageHosts: ["cdn.realtor.ca"],
    currency: "CAD",
  },
  {
    id: "housesigma",
    label: "HouseSigma",
    hosts: ["housesigma.com"],
    imageHosts: [],
    currency: "CAD",
  },
  {
    id: "zolo",
    label: "Zolo",
    hosts: ["zolo.ca"],
    imageHosts: ["photos.zolo.ca"],
    currency: "CAD",
  },
  {
    id: "centris",
    label: "Centris",
    hosts: ["centris.ca"],
    imageHosts: ["cdn.centris.ca", "mspublic.centris.ca"],
    currency: "CAD",
  },
  {
    id: "rew",
    label: "REW",
    hosts: ["rew.ca"],
    imageHosts: ["cdn.rew.ca", "images.rew.ca", "assets.rew.ca"],
    currency: "CAD",
  },
  {
    id: "propertyca",
    label: "Property.ca",
    hosts: ["property.ca"],
    imageHosts: ["cdn.repliers.io", "shared-s3.property.ca"],
    currency: "CAD",
  },
  {
    id: "wahi",
    label: "Wahi",
    hosts: ["wahi.com"],
    imageHosts: ["cdn.wahi.com"],
    currency: "CAD",
  },
];

const SUPPORTED_LINK_HINT =
  "Use a listing link from Property Finder, Bayut, or McCone CRM.";

export const SOURCE_LABELS = Object.fromEntries(
  PORTALS.map((portal) => [portal.id, portal.label])
);

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

export function portalFromHost(hostname) {
  return (
    PORTALS.find(
      (portal) =>
        portal.hosts.some((host) => hostMatches(hostname, host)) ||
        portal.imageHosts.some((host) => hostMatches(hostname, host))
    ) || null
  );
}

export function isPfHost(hostname) {
  return portalFromHost(hostname)?.id === "pf";
}

export function isCrmHost(hostname) {
  return portalFromHost(hostname)?.id === "crm";
}

export function isAllowedHost(hostname) {
  return PORTALS.some((portal) =>
    portal.hosts.some((host) => hostMatches(hostname, host))
  );
}

export function isImageHost(hostname) {
  if (isAllowedHost(hostname)) return true;
  if (String(hostname || "").toLowerCase().endsWith(".supabase.co")) return true;
  return PORTALS.some((portal) =>
    portal.imageHosts.some((host) => hostMatches(hostname, host))
  );
}

export function normalizeListingUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) throw new Error("Paste a listing link from a UAE or Canada portal.");
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("That does not look like a valid URL.");
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("That does not look like a valid URL.");
  }
  const comingSoon = unsupportedListingMessage(value);
  if (comingSoon) throw new Error(comingSoon);
  if (!isAllowedHost(parsed.hostname)) {
    throw new Error(SUPPORTED_LINK_HINT);
  }
  return parsed.toString();
}

export function normalizeImageUrl(raw) {
  const parsed = new URL(String(raw || "").trim());
  if (!/^https?:$/.test(parsed.protocol) || !isImageHost(parsed.hostname)) {
    throw new Error("Blocked image host.");
  }
  return parsed.toString();
}

function decodeEntities(value) {
  let text = String(value || "");
  for (let i = 0; i < 3; i += 1) {
    const next = text
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/&bull;/g, "•")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
    if (next === text) break;
    text = next;
  }
  return text;
}

function pageTitle(html) {
  return decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
    .replace(/\s+/g, " ")
    .trim();
}

function isGenericTitle(value) {
  return /^(check out this listing|home|welcome|untitled)?$/i.test(
    String(value || "").trim()
  );
}

function pickTreeName(tree, type) {
  return (tree || []).find((item) => item?.type === type)?.name || "";
}

function formatPrice(value, currency = "AED") {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^(AED|CAD|USD)\s*[\d,]/.test(raw) || /^\$[\d,]/.test(raw)) {
    return raw.replace(/\s+/g, " ");
  }
  const amount = Number(String(raw).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return "";
  const formatted = Math.round(amount).toLocaleString("en-US");
  return currency === "CAD" ? `$${formatted}` : `AED ${formatted}`;
}

function formatPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("971") && digits.length === 12) {
    return `+971 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.startsWith("1") && digits.length === 11) {
    return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return String(raw || "");
}

function formatArea(size) {
  if (size && typeof size === "object") {
    const min = Number(size.minValue);
    const max = Number(size.maxValue);
    const value = Number(size.value ?? size);
    if (Number.isFinite(min) && Number.isFinite(max) && min !== max) {
      return `${Math.round(min).toLocaleString("en-US")}–${Math.round(max).toLocaleString("en-US")}`;
    }
    if (Number.isFinite(value)) return Math.round(value).toLocaleString("en-US");
  }
  const raw = String(size ?? "").replace(/,/g, "").trim();
  if (!raw) return "";
  const range = raw.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (range) {
    return `${Math.round(Number(range[1])).toLocaleString("en-US")}–${Math.round(Number(range[2])).toLocaleString("en-US")}`;
  }
  const value = Number(raw.replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(value) || value <= 0) return "";
  return Math.round(value).toLocaleString("en-US");
}

function formatBeds(value) {
  if (value === 0 || value === "0") return "0";
  if (value == null || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) {
    const text = String(value).replace(/bed.*/i, "").trim();
    return text;
  }
  if (n === 0) return "0";
  const whole = Math.floor(n);
  const extra = Math.round((n - whole) * 10);
  if (extra > 0) return `${whole}+${extra}`;
  return String(whole);
}

function priceLabel(price, isRent) {
  const period = String(price?.period || "").toLowerCase();
  if (period === "yearly" || period === "year" || period === "annual") {
    return "Annual Rent";
  }
  if (period === "monthly" || period === "month") return "Monthly Rent";
  if (period === "weekly" || period === "week") return "Weekly Rent";
  return isRent ? "Annual Rent" : "Price";
}

function photoUrl(shot) {
  if (!shot) return "";
  if (typeof shot === "string") return shot;
  return (
    shot.full ||
    shot.medium ||
    shot.original ||
    shot.src ||
    shot.url ||
    shot.thumbnail ||
    ""
  );
}

function allPhotos(images) {
  const list = Array.isArray(images)
    ? images
    : Array.isArray(images?.property)
      ? images.property
      : [];
  return uniquePhotos(list.map(photoUrl));
}

function uniquePhotos(urls) {
  const seen = new Set();
  const out = [];
  for (const raw of urls) {
    const url = decodeEntities(String(raw || "").replace(/\\u0026/gi, "&")).trim();
    if (!url || !/^https?:\/\//i.test(url) || !isLikelyPhoto(url)) continue;
    const key = url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

function isLikelyPhoto(url) {
  const value = String(url || "").toLowerCase();
  if (!/^https?:\/\//.test(value)) return false;
  if (
    /logo|favicon|sprite|icon[-_/]|avatar|placeholder|doubleclick|googletag|adservice/.test(
      value
    )
  ) {
    return false;
  }
  return (
    /\.(jpe?g|webp|png)(\?|$)/i.test(value) ||
    /media\.ashx|thumbnails|\/listing\/|pix-|img-|photos\.|cdn\.repliers|cdn\.wahi|images\.bayut|images\.dubizzle/.test(
      value
    )
  );
}

function titleCase(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function furnishedStatus(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (/^(no|n|false|0|unfurnished|not furnished)$/.test(raw)) return "Unfurnished";
  if (/^(yes|y|true|1|furnished)$/.test(raw)) return "Furnished";
  if (/part(ly|ial)/.test(raw)) return "Partly Furnished";
  return titleCase(value);
}

function cleanDescription(value) {
  const text = decodeEntities(String(value || ""))
    .replace(/\$[a-z0-9]+/gi, "")
    .trim();
  if (!text || text.length < 20) return "";
  return text;
}

function amenityName(item) {
  if (!item) return "";
  if (typeof item === "string") return titleCase(item);
  return titleCase(item.name || item.label || "");
}

function listingShell(portal, extra = {}) {
  return {
    source: portal.id,
    sourceLabel: portal.label,
    propertyName: "",
    cluster: "",
    community: "",
    location: "",
    title: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    plotArea: "",
    price: "",
    priceLabel: extra.offeringType === "rent" ? "Annual Rent" : "Price",
    cheques: "",
    term: extra.offeringType === "rent" ? "1y+" : "",
    termLabel: extra.offeringType === "rent" ? "Lease Term" : "Term",
    photo: "",
    photos: [],
    listedDate: "",
    description: "",
    propertyType: "",
    furnished: "",
    amenities: [],
    offeringType: extra.offeringType || "sale",
    agentName: "",
    agentEmail: "",
    agentPhone: "",
    ...extra,
  };
}

function hasListingContent(listing) {
  if (!listing) return false;
  return Boolean(
    listing.propertyName ||
      listing.price ||
      listing.photo ||
      listing.title ||
      listing.location
  );
}

function mergeListing(base, next) {
  if (!next) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(next)) {
    if (value == null || value === "") continue;
    if (key === "photos") {
      out.photos = uniquePhotos([...(out.photos || []), ...(value || [])]);
      continue;
    }
    if (key === "amenities") {
      out.amenities = [...new Set([...(out.amenities || []), ...(value || [])])];
      continue;
    }
    if (out[key] === "" || out[key] == null) out[key] = value;
  }
  if (!out.photo) out.photo = out.photos[0] || "";
  return out;
}

function readMeta(html) {
  const meta = {};
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = tag[0].match(/(?:property|name|itemprop)="([^"]+)"/i)?.[1];
    const value = tag[0].match(/content="([^"]*)"/i)?.[1];
    if (!key || value == null) continue;
    const decoded = decodeEntities(value);
    if (key === "og:image" || key.startsWith("twitter:image")) {
      if (!meta.images) meta.images = [];
      meta.images.push(decoded);
      if (!meta[key]) meta[key] = decoded;
      continue;
    }
    if (!meta[key]) meta[key] = decoded;
  }
  return meta;
}

function factsFromText(text, portal = {}) {
  const raw = decodeEntities(String(text || "").replace(/<[^>]+>/g, " "));
  const facts = {};
  const beds =
    raw.match(/(\d+)\+(\d+)\s*beds?/i) ||
    raw.match(/(\d+(?:\.\d+)?)\s*-?\s*(?:beds?|bedrooms?|br)\b/i);
  if (beds) {
    facts.bedrooms = beds[2] ? `${beds[1]}+${beds[2]}` : formatBeds(beds[1]);
  }
  const baths = raw.match(/(\d+(?:\.\d+)?)\s*-?\s*(?:baths?|bathrooms?|ba)\b/i);
  if (baths) facts.bathrooms = String(Math.round(Number(baths[1])));
  const area = raw.match(/([\d,]+)\s*(?:sq\s?ft|sqft|ft²)/i);
  if (area) facts.area = formatArea(area[1]);
  const aed = raw.match(/AED\s*([\d,]+)/i);
  const cad = raw.match(/\$\s*([\d,]+)/);
  if (aed) {
    facts.price = formatPrice(aed[1], "AED");
    facts.currency = "AED";
  } else if (cad) {
    facts.price = formatPrice(cad[1], "CAD");
    facts.currency = "CAD";
  }
  if (/for rent|to rent|\/\s*yr|yearly|annual rent|\/mo|per month/i.test(raw)) {
    facts.offeringType = "rent";
    const weekly = /\/\s*wk|weekly/i.test(raw);
    const yearly = /\/\s*yr|yearly|annual/i.test(raw);
    const monthly =
      portal.currency === "CAD"
        ? !yearly
        : /\/\s*mo|per month|monthly/i.test(raw);
    facts.priceLabel = weekly
      ? "Weekly Rent"
      : monthly
        ? "Monthly Rent"
        : "Annual Rent";
    facts.term = monthly || portal.currency === "CAD" ? "" : "1y+";
    facts.termLabel = "Lease Term";
  } else if (/for sale|asking \$|listed at/i.test(raw)) {
    facts.offeringType = "sale";
    facts.priceLabel = "Price";
  }
  const place = raw.match(
    /\b(?:at|in)\s+([^,]{2,60}),\s*([A-Za-z][A-Za-z .'-]{1,40}?)(?:\s+for\b|\s+listed\b|[,.]|$)/i
  );
  if (place) {
    facts.propertyName = place[1].trim();
    facts.location = place[2].trim();
  }
  return facts;
}

function parseJsonBlocks(html) {
  const entities = [];
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];
  for (const block of blocks) {
    try {
      const json = JSON.parse(block[1]);
      const queue = [json];
      while (queue.length) {
        const item = queue.shift();
        if (!item) continue;
        if (Array.isArray(item)) {
          queue.push(...item);
          continue;
        }
        if (typeof item !== "object") continue;
        entities.push(item);
        if (item["@graph"]) queue.push(item["@graph"]);
        if (item.mainEntity) queue.push(item.mainEntity);
      }
    } catch {
      /* skip broken JSON-LD */
    }
  }
  return entities;
}

function addressParts(address) {
  if (!address) return { name: "", location: "" };
  if (typeof address === "string") {
    const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
    return { name: parts[0] || "", location: parts.slice(1).join(", ") };
  }
  const street = address.streetAddress || address.name || "";
  const location = [
    address.addressLocality,
    address.addressRegion,
    address.addressCountry,
  ]
    .filter(Boolean)
    .join(", ");
  return { name: street, location };
}

function samePlace(a, b) {
  const left = String(a || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const right = String(b || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!left || !right) return true;
  return left.includes(right) || right.includes(left);
}

function listingFromJsonLd(html, portal) {
  const entities = parseJsonBlocks(html).filter((entity) => {
    const type = String(entity["@type"] || "");
    return !/website|organization|corporation|breadcrumb|realestateagent|itemlist|webpage|itempage/i.test(
      type
    );
  });
  const primary =
    entities.find((entity) => /realestatelisting/i.test(String(entity["@type"] || ""))) ||
    entities.find((entity) => entity.offers || entity.numberOfBedrooms);
  const primaryName =
    addressParts(primary?.address).name || primary?.name || "";
  let listing = listingShell(portal);
  let found = false;
  for (const entity of entities) {
    const type = String(entity["@type"] || "");
    if (primary && entity !== primary) {
      const otherName = addressParts(entity.address).name || entity.name || "";
      if (otherName && primaryName && !samePlace(otherName, primaryName)) continue;
    }
    const offer = Array.isArray(entity.offers) ? entity.offers[0] : entity.offers;
    const spec = offer?.priceSpecification || {};
    const priceValue = offer?.price ?? spec.price;
    const address = entity.address || {};
    const floor = entity.floorSize || {};
    const { name, location } = addressParts(address);
    const images = Array.isArray(entity.image)
      ? entity.image
      : entity.image
        ? [entity.image]
        : [];
    const isProperty = /realestate|residence|apartment|house|condo|product|place|offer/i.test(
      type
    );
    if (!isProperty && !priceValue && !name && !entity.numberOfBedrooms) continue;
    const rent = /rent|lease/i.test(
      `${type} ${entity.name || ""} ${entity.description || ""} ${offer?.description || ""}`
    );
    const currency =
      offer?.priceCurrency || spec.priceCurrency || portal.currency;
    const piece = listingShell(portal, {
      propertyName:
        name ||
        String(entity.name || "")
          .split("|")[0]
          .trim(),
      cluster: name,
      location,
      title: decodeEntities(entity.headline || entity.name || ""),
      bedrooms: formatBeds(entity.numberOfBedrooms),
      bathrooms: entity.numberOfBathroomsTotal
        ? String(entity.numberOfBathroomsTotal)
        : "",
      area: formatArea(floor.value ?? floor),
      price: formatPrice(priceValue, currency === "CAD" ? "CAD" : portal.currency),
      priceLabel: priceLabel(
        { period: spec.unitText },
        rent && portal.currency !== "CAD"
      ),
      term: rent && portal.currency !== "CAD" ? "1y+" : "",
      termLabel: rent ? "Lease Term" : "Term",
      photo: images[0] || "",
      photos: uniquePhotos(images),
      listedDate: entity.datePosted || "",
      description: cleanDescription(entity.description),
      propertyType: /realestate|residence|apartment|house|condo/i.test(type)
        ? titleCase(type)
        : "",
      offeringType: rent ? "rent" : "sale",
    });
    if (rent && portal.currency === "CAD") piece.priceLabel = "Monthly Rent";
    listing = mergeListing(listing, piece);
    found = true;
  }
  return found && hasListingContent(listing) ? listing : null;
}

function listingFromMeta(html, portal) {
  const meta = readMeta(html);
  const ogTitle = decodeEntities(meta["og:title"] || meta["twitter:title"] || "");
  const title = decodeEntities(
    isGenericTitle(ogTitle) ? pageTitle(html) : ogTitle || pageTitle(html)
  ).replace(/\s*[|–—-]\s*(Bayut|Zolo|HouseSigma|Property\.ca|Wahi|Centris|REW|REALTOR).*$/i, "");
  const description = meta["og:description"] || meta.description || "";
  const facts = factsFromText(`${title}. ${description}`, portal);
  const photos = uniquePhotos(meta.images || []);
  if (!title && !facts.price && !photos.length) return null;
  const rent = facts.offeringType === "rent";
  const propertyName =
    facts.propertyName ||
    title.split(",")[0].replace(/\s+[—@].*$/, "").trim();
  const location =
    facts.location ||
    title
      .split(",")
      .slice(1)
      .join(",")
      .replace(/\s+[|–].*$/, "")
      .trim();
  return listingShell(portal, {
    propertyName,
    cluster: propertyName,
    location,
    title,
    bedrooms: facts.bedrooms || "",
    bathrooms: facts.bathrooms || "",
    area: facts.area || "",
    price: facts.price || formatPrice(meta.price, portal.currency),
    priceLabel: facts.priceLabel || (rent ? "Annual Rent" : "Price"),
    term: facts.term ?? (rent && portal.currency !== "CAD" ? "1y+" : ""),
    termLabel: rent ? "Lease Term" : "Term",
    photo: photos[0] || "",
    photos,
    description: cleanDescription(description),
    offeringType: facts.offeringType || "sale",
  });
}

function extractNextData(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function collectHtmlPhotos(html, hostHint = "") {
  const pattern = hostHint
    ? new RegExp(`https:\\\\?/\\\\?/[^"'\\s>]*${hostHint}[^"'\\s>]*`, "gi")
    : /https?:\/\/[^"'\\\s>]+\.(?:jpe?g|webp|png)(?:\?[^"'\\\s>]*)?/gi;
  return uniquePhotos(
    [...html.matchAll(pattern)].map((match) =>
      match[0].replace(/\\u0026/gi, "&").replace(/\\\//g, "/")
    )
  );
}

function mapProperty(prop, isRent) {
  const tree = Array.isArray(prop.location_tree) ? prop.location_tree : [];
  const city = pickTreeName(tree, "CITY") || "Dubai";
  const community = pickTreeName(tree, "COMMUNITY");
  const propertyName = prop.location?.name || tree.at(-1)?.name || "";
  const location = community ? `${community}, ${city}` : city;
  const rent = /rent/i.test(prop.offering_type || "") || Boolean(isRent);
  const price = prop.price || {};
  const cheques = prop.number_of_cheques;
  const photos = allPhotos(prop.images);
  const bathrooms = prop.bathrooms_value ?? prop.bathrooms;
  const amenities = (prop.amenities || []).map(amenityName).filter(Boolean);

  return {
    source: "pf",
    sourceLabel: "Property Finder",
    propertyName,
    cluster: propertyName,
    community,
    location,
    title: prop.title || "",
    bedrooms: String(prop.bedrooms_value ?? prop.bedrooms ?? ""),
    bathrooms: bathrooms === 0 || bathrooms ? String(bathrooms) : "",
    area: formatArea(prop.size),
    plotArea: formatArea(prop.plot_size || prop.plot || prop.plot_area),
    price: formatPrice(price.value),
    priceLabel: priceLabel(price, rent),
    cheques: cheques === 0 || cheques ? String(cheques) : "",
    term: rent ? "1y+" : "",
    termLabel: rent ? "Lease Term" : "Term",
    photo: photos[0] || "",
    photos,
    listedDate: prop.listed_date || "",
    description: cleanDescription(prop.description),
    propertyType: titleCase(prop.property_type || prop.category),
    furnished: furnishedStatus(prop.furnished || prop.furnishing_status),
    amenities,
    offeringType: rent ? "rent" : "sale",
  };
}

function extractNextProperty(html) {
  const data = extractNextData(html);
  const page = data?.props?.pageProps;
  const prop = page?.propertyResult?.property;
  if (!prop) return null;
  return mapProperty(prop, page?.isRent);
}

function extractJsonObject(html, key) {
  const candidates = [
    { needle: `"${key}":{`, escaped: false },
    { needle: `\\"${key}\\":{`, escaped: true },
  ];

  for (const { needle, escaped } of candidates) {
    const start = html.indexOf(needle);
    if (start === -1) continue;
    const from = start + needle.length - 1;
    let depth = 0;
    for (let i = from; i < html.length; i += 1) {
      const ch = html[i];
      if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          let slice = html.slice(from, i + 1);
          if (escaped) slice = slice.replace(/\\"/g, '"');
          try {
            return JSON.parse(slice);
          } catch {
            break;
          }
        }
      }
    }
  }
  return null;
}

function mapMcConeListing(prop, agent) {
  const rent = /rent/i.test(prop.offering_type || "");
  const community = prop.community || "";
  const city = /dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|umm al/i.test(
    community
  )
    ? ""
    : "Dubai";
  const location = [community, prop.sub_community, city].filter(Boolean).join(", ");
  const photos = allPhotos(prop.images);
  const bathrooms = prop.bathrooms;

  return {
    source: "crm",
    sourceLabel: "McCone CRM",
    propertyName: prop.building_name || prop.title || "",
    cluster: prop.building_name || prop.title || "",
    community,
    location,
    title: prop.title || "",
    bedrooms: prop.bedrooms === 0 || prop.bedrooms ? String(prop.bedrooms) : "",
    bathrooms: bathrooms === 0 || bathrooms ? String(bathrooms) : "",
    area: formatArea(prop.size_sqft),
    plotArea: formatArea(prop.plot_sqft || prop.plot_area),
    price: formatPrice(prop.price),
    priceLabel: priceLabel({ period: prop.price_frequency }, rent),
    cheques: prop.cheques === 0 || prop.cheques ? String(prop.cheques) : "",
    term: rent ? "1y+" : "",
    termLabel: rent ? "Lease Term" : "Term",
    photo: photos[0] || "",
    photos,
    listedDate: "",
    description: cleanDescription(prop.description),
    propertyType: titleCase(prop.property_type),
    furnished: furnishedStatus(prop.furnished),
    amenities: (prop.amenities || []).map(amenityName).filter(Boolean),
    offeringType: rent ? "rent" : "sale",
    agentName: agent?.name || "",
    agentEmail: agent?.email || "",
    agentPhone: formatPhone(agent?.phone || ""),
  };
}

function crmPhotosFromHtml(html) {
  return uniquePhotos(
    [...html.matchAll(/https:\/\/[^"'\\\s>]+\/listing-images\/[^"'\\\s>]+/g)].map(
      (match) => match[0]
    )
  );
}

function extractMcConeFromMarkup(html) {
  const photos = crmPhotosFromHtml(html);
  const photo = photos[0] || "";
  const price = html.match(/AED[\s\u00a0]+([\d,]+)\s*\/\s*(yr|mo|wk)/i);
  const beds = html.match(/>(\d+)\s*Beds?</i);
  const baths = html.match(/>(\d+)\s*(?:<!-- -->\s*)?Bath/i);
  const area = html.match(/>([\d,]+)(?:<!-- -->)?\s*sqft/i);
  const place = html.match(/<span>([^<]+,\s*[^<]+)<\/span>/);
  const [building, community] = String(place?.[1] || "")
    .split(",")
    .map((part) => part.trim());
  const agentName =
    html.match(/Shared by <!-- -->([^<]+)/)?.[1] ||
    html.match(/Contact ([^<]+) for more details/)?.[1] ||
    "";
  const phone =
    html.match(/tel:(\+?\d+)/)?.[1] ||
    (html.match(/wa\.me\/(\d+)/)?.[1]
      ? `+${html.match(/wa\.me\/(\d+)/)[1]}`
      : "");
  const period =
    price?.[2] === "mo" ? "monthly" : price?.[2] === "wk" ? "weekly" : "yearly";
  const title = String(
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ||
      html.match(/>([^<]+\|[^<]+)</)?.[1] ||
      ""
  )
    .replace(/\s*\|\s*McCone.*$/i, "")
    .trim();

  if (!building && !price && !photo) return null;
  return mapMcConeListing(
    {
      title,
      building_name: building,
      community,
      bedrooms: beds?.[1],
      bathrooms: baths?.[1],
      size_sqft: String(area?.[1] || "").replace(/,/g, ""),
      price: String(price?.[1] || "").replace(/,/g, ""),
      price_frequency: period,
      offering_type: /For Rent/i.test(html) ? "rent" : "sale",
      images: photos,
    },
    { name: agentName.trim(), phone, email: "" }
  );
}

function extractMcConeListing(html) {
  const prop = extractJsonObject(html, "listing");
  if (prop?.id || prop?.title || prop?.building_name) {
    return mapMcConeListing(prop, extractJsonObject(html, "agent") || {});
  }
  return extractMcConeFromMarkup(html);
}

function extractBayut(html, portal) {
  const meta = listingFromMeta(html, portal);
  const photos = uniquePhotos([
    ...(meta?.photos || []),
    ...collectHtmlPhotos(html, "images\\.bayut\\.com"),
  ]).map((url) => url.replace(/-\d+x\d+\.(jpe?g|webp)$/i, "-800x600.$1"));
  if (!meta) return null;
  return {
    ...meta,
    photos: uniquePhotos(photos),
    photo: photos[0] || meta.photo,
    furnished: /fully furnished|furnished/i.test(meta.title) ? "Furnished" : "",
  };
}

function extractWahi(html, portal) {
  const data = extractNextData(html);
  const listing = data?.props?.pageProps?.listing;
  if (!listing) return null;
  const overview = listing.propertyOverview || {};
  const address = listing.address || overview.address || {};
  const street = [
    address.streetNumber || address.street_number,
    address.streetName || address.street_name,
    address.streetSuffix,
    address.unitNumber ? `#${address.unitNumber}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+#/, " #");
  const propertyName =
    street || overview.address?.streetName || listing.title || "";
  const location = [address.city || overview.address?.cityName, address.state]
    .filter(Boolean)
    .join(", ");
  const rent = /lease|rent/i.test(
    `${listing.type || ""} ${listing.sellingMode || ""} ${listing.status || ""}`
  );
  const photos = uniquePhotos(
    (listing.imageData || []).map((img) => img.src).concat(
      (listing.images || []).map((img) =>
        img.src || (img.cdnPath ? `https://cdn.wahi.com/listings/images/${img.cdnPath}` : "")
      )
    )
  );
  return listingShell(portal, {
    propertyName,
    cluster: propertyName,
    community: address.neighborhood || address.district || "",
    location,
    title: listing.title || propertyName,
    bedrooms: formatBeds(overview.beds || listing.details?.numBedrooms),
    bathrooms: String(overview.bath || listing.details?.numBathrooms || ""),
    area: formatArea(String(listing.sqft || overview.size || "").replace(/~|sqft/gi, "")),
    price: formatPrice(listing.listPrice || listing.wahiPrice, "CAD"),
    priceLabel: rent ? "Monthly Rent" : "Price",
    term: "",
    termLabel: rent ? "Lease Term" : "Term",
    photo: photos[0] || "",
    photos,
    listedDate: listing.listDate || "",
    description: cleanDescription(listing.description),
    propertyType: titleCase(listing.propertyType || overview.type),
    offeringType: rent ? "rent" : "sale",
    agentName: listing.brokerageName || "",
  });
}

function extractPropertyCa(html, portal) {
  const jsonLd = listingFromJsonLd(html, portal);
  const meta = listingFromMeta(html, portal);
  const mls = html.match(/IMG-([A-Z]?\d{6,})/i)?.[1] || "";
  const photos = uniquePhotos([
    ...(jsonLd?.photos || []),
    ...(meta?.photos || []),
    ...collectHtmlPhotos(html, "cdn\\.repliers\\.io/IMG-"),
  ]).filter((url) => (mls ? url.includes(mls) : /IMG-[A-Z]?\d+/i.test(url)));
  const listing = mergeListing(jsonLd || listingShell(portal), meta);
  if (photos.length) {
    listing.photos = photos;
    listing.photo = photos[0];
  }
  return hasListingContent(listing) ? listing : null;
}

function extractCentris(html, portal) {
  const meta = listingFromMeta(html, portal);
  const price =
    html.match(/itemprop="price"[^>]*content="([^"]+)"/i)?.[1] ||
    html.match(/<meta[^>]+itemprop="price"[^>]+content="([^"]+)"/i)?.[1];
  const beds = html.match(/>\s*(\d+)\s*bedrooms?/i)?.[1];
  const baths = html.match(/>\s*(\d+)\s*bathroom/i)?.[1];
  const area = html.match(/Living area<\/div>\s*<div[^>]*>\s*<span>([\d,]+)\s*sqft/i)?.[1];
  const address =
    html.match(/itemprop="address"[^>]*>\s*([^<]+)/i)?.[1] ||
    html.match(/>(\d+[^<]*,\s*[^<]+)<\/span>/)?.[1];
  const agent = html.match(/itemprop="name">\s*([^<]+)/i)?.[1];
  const parts = decodeEntities(address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const street = parts.length >= 2 ? parts.slice(0, 2).join(", ") : parts[0] || "";
  const city = parts.length >= 3 ? parts.slice(2).join(", ") : parts.slice(1).join(", ");
  const photos = uniquePhotos([
    ...(meta?.photos || []),
    ...[...html.matchAll(/https:\/\/mspublic\.centris\.ca\/media\.ashx\?[^"'\\\s>]+/gi)].map(
      (match) => match[0].replace(/\\u0026/gi, "&")
    ),
  ]).filter((url) => /[?&]t=pi|[?&]t=e|w=1260/i.test(url));
  const hint = `${meta?.["og:url"] || ""} ${meta?.["og:title"] || ""} ${meta?.title || ""}`;
  const rent = /for-rent|à louer|for rent/i.test(hint) && !/for-sale|for sale|à vendre/i.test(hint);
  const listing = mergeListing(
    {
      ...listingShell(portal),
      propertyName: street,
      location: city,
      bedrooms: beds || "",
      bathrooms: baths || "",
      area: formatArea(area),
      price: formatPrice(price, "CAD"),
      priceLabel: rent ? "Monthly Rent" : "Price",
      offeringType: rent ? "rent" : "sale",
      photos,
      photo: photos[0] || "",
      agentName: decodeEntities(agent || "").trim(),
    },
    meta
  );
  return hasListingContent(listing) ? listing : null;
}

function extractHouseSigma(html, portal) {
  const meta = listingFromMeta(html, portal);
  const photos = uniquePhotos([
    ...(meta?.photos || []),
    ...collectHtmlPhotos(html, "housesigma\\.com"),
  ]);
  const title = meta?.title || pageTitle(html);
  const cleaned = title
    .replace(/\s+(Sold History|For Sale|For Lease).*$/i, "")
    .replace(/\s*\|\s*HouseSigma.*$/i, "")
    .trim();
  const [street, ...rest] = cleaned.split(",").map((part) => part.trim());
  const location = rest
    .join(", ")
    .replace(/\s+[A-Z]\d[A-Z]\s*\d[A-Z]\d\s*$/i, "")
    .trim();
  const beds =
    html.match(/>(\d+\+\d+|\d+)\s*Bedrooms?\s*</i)?.[1] || "";
  const baths = html.match(/>(\d+)\s*Bathrooms?\s*</i)?.[1] || "";
  const listed =
    html.match(/listed for \$([\d,]+)/i)?.[1] ||
    html.match(/\$([\d,]+)\s*(?:<\/[^>]+>\s*){1,8}For (?:Sale|Lease)/i)?.[1] ||
    "";
  const rent = /for lease|for rent/i.test(title);
  const listing = mergeListing(meta || listingShell(portal), {
    propertyName: street || "",
    location,
    photos,
    photo: photos[0] || "",
    bedrooms: beds && beds !== "0" ? beds : "",
    bathrooms: baths && baths !== "0" ? baths : "",
    price: formatPrice(listed, "CAD"),
    priceLabel: rent ? "Monthly Rent" : "Price",
    offeringType: rent ? "rent" : "sale",
    term: "",
  });
  if (street) listing.propertyName = street;
  if (location) listing.location = location;
  if (beds && beds !== "0") listing.bedrooms = beds;
  if (listed) listing.price = formatPrice(listed, "CAD");
  return hasListingContent(listing) ? listing : null;
}

function extractRealtor(html, portal) {
  const title = pageTitle(html);
  const meta = listingFromMeta(html, portal);
  const cleaned = title
    .replace(/\s*\|\s*REALTOR.*$/i, "")
    .replace(/^(for sale|for rent|à vendre|à louer):\s*/i, "")
    .replace(/\s*-\s*[A-Z]{2}\d+\s*$/i, "")
    .trim();
  const parts = cleaned.split(",").map((part) => part.trim()).filter(Boolean);
  const photos = uniquePhotos([
    ...(meta?.photos || []),
    ...collectHtmlPhotos(html, "cdn\\.realtor\\.ca"),
  ]);
  const rent = /for rent|à louer/i.test(title);
  const location = parts
    .slice(1)
    .join(", ")
    .replace(/\s+[A-Z]\d[A-Z]\s*\d[A-Z]\d\s*$/i, "")
    .trim();
  const listing = mergeListing(meta || listingShell(portal), {
    propertyName: parts[0] || "",
    location,
    title: cleaned,
    photos,
    photo: photos[0] || "",
    offeringType: rent ? "rent" : "sale",
    priceLabel: rent ? "Monthly Rent" : "Price",
    term: "",
  });
  if (parts[0]) listing.propertyName = parts[0];
  if (location) listing.location = location;
  return listing;
}

function extractZolo(html, portal) {
  const jsonLd = listingFromJsonLd(html, portal);
  const meta = listingFromMeta(html, portal);
  const facts = factsFromText(
    `${meta?.title || ""} ${meta?.description || ""}`,
    portal
  );
  const slug = (html.match(/photos\.zolo\.ca\/([^"?]+)-\d+(?:-\d+)?-/i)?.[1] || "")
    .toLowerCase();
  const photos = uniquePhotos([
    ...(jsonLd?.photos || []),
    ...(meta?.photos || []),
    ...collectHtmlPhotos(html, "photos\\.zolo\\.ca"),
  ]).filter((url) => !slug || url.toLowerCase().includes(slug));
  const propertyName = (jsonLd?.propertyName || meta?.propertyName || "")
    .replace(/,\s*[A-Z]{2},?\s*[A-Z]?\d[A-Z\d ]*$/i, "")
    .replace(/,\s*ON.*$/i, "");
  const location = jsonLd?.location || "";
  const listing = mergeListing(mergeListing(jsonLd || listingShell(portal), meta), {
    propertyName,
    location,
    bedrooms: facts.bedrooms,
    bathrooms: facts.bathrooms,
    area: facts.area,
    price: facts.price || jsonLd?.price,
    priceLabel: facts.priceLabel,
    offeringType: facts.offeringType,
    photos,
    photo: photos[0] || "",
  });
  if (propertyName) listing.propertyName = propertyName;
  if (location) listing.location = location;
  if (!listing.area) listing.area = facts.area || formatArea(html.match(/([\d,]+)\s*sqft/i)?.[1]);
  if (facts.offeringType) listing.offeringType = facts.offeringType;
  if (facts.priceLabel) listing.priceLabel = facts.priceLabel;
  if (listing.offeringType === "rent" && portal.currency === "CAD") {
    listing.priceLabel = "Monthly Rent";
    listing.term = "";
  }
  return hasListingContent(listing) ? listing : null;
}

function extractGeneric(html, portal) {
  return (
    listingFromJsonLd(html, portal) ||
    listingFromMeta(html, portal) ||
    null
  );
}

function extractForPortal(portal, html) {
  switch (portal.id) {
    case "pf":
      return extractNextProperty(html) || extractGeneric(html, portal);
    case "crm":
      return extractMcConeListing(html);
    case "bayut":
      return extractBayut(html, portal) || extractGeneric(html, portal);
    case "wahi":
      return extractWahi(html, portal) || extractGeneric(html, portal);
    case "propertyca":
      return extractPropertyCa(html, portal) || extractGeneric(html, portal);
    case "centris":
      return extractCentris(html, portal) || extractGeneric(html, portal);
    case "housesigma":
      return extractHouseSigma(html, portal) || extractGeneric(html, portal);
    case "zolo":
      return extractZolo(html, portal) || extractGeneric(html, portal);
    case "realtor":
      return extractRealtor(html, portal) || extractGeneric(html, portal);
    default:
      return extractGeneric(html, portal);
  }
}

function isBlockedPage(html, status) {
  if (status === 403 || status === 503) return true;
  const head = String(html || "").slice(0, 12000).toLowerCase();
  return (
    head.includes("pardon our interruption") ||
    head.includes("just a moment...") ||
    head.includes("sorry, you have been blocked") ||
    head.includes("security check |") ||
    head.includes("/_incapsula_resource") ||
    (head.includes("attention required") && head.includes("cloudflare"))
  );
}

async function fetchListingHtml(url, portal) {
  const attempts = [BROWSER_UA, CRAWLER_UA];
  let lastStatus = 0;
  for (const userAgent of attempts) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-CA,en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    lastStatus = response.status;
    if (!response.ok) continue;
    const html = await response.text();
    if (isBlockedPage(html, response.status)) continue;
    if (
      html.length < 1200 &&
      !/og:title|__NEXT_DATA__|ld\+json/i.test(html)
    ) {
      continue;
    }
    return html;
  }
  if (lastStatus && lastStatus !== 200) {
    throw new Error(`${portal.label} returned ${lastStatus}.`);
  }
  throw new Error(
    `${portal.label} blocked the request. Open the listing in your browser and try again.`
  );
}

export function extractListingFromHtml(html, rawUrl) {
  const parsed = new URL(rawUrl);
  const portal = portalFromHost(parsed.hostname);
  if (!portal) return null;
  const listing = extractForPortal(portal, html);
  if (!listing || !hasListingContent(listing)) return null;
  listing.source = portal.id;
  listing.sourceLabel = portal.label;
  if (!Array.isArray(listing.photos)) listing.photos = [];
  if (!listing.photo) listing.photo = listing.photos[0] || "";
  if (listing.photo && !listing.photos.includes(listing.photo)) {
    listing.photos.unshift(listing.photo);
  }
  return listing;
}

export async function scrapeListing(rawUrl) {
  const url = normalizeListingUrl(rawUrl);
  const parsed = new URL(url);
  const portal = portalFromHost(parsed.hostname);
  const html = await fetchListingHtml(url, portal);
  const listing = extractListingFromHtml(html, url);
  if (!listing) {
    if (portal.id === "crm" && /\/listings\//i.test(parsed.pathname)) {
      throw new Error("Use the public share link, like mcconecrm.com/listing/v89gsfyr.");
    }
    throw new Error("Could not read that listing. Check the link and try again.");
  }
  return listing;
}

export async function fetchListingImage(rawUrl) {
  const url = normalizeImageUrl(rawUrl);
  const response = await fetch(url, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "image/*",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`Image fetch failed (${response.status}).`);
  }
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { contentType, buffer };
}
