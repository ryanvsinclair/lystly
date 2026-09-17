const STATUS_LABELS = {
  "coming-soon": "Coming soon",
  "available-on": "Available on",
  "available-now": "Available now",
  "just-leased": "Just leased",
  "just-sold": "Just sold",
};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function listingPhoto(listing) {
  if (typeof listing.photo === "string" && listing.photo) return listing.photo;
  if (Array.isArray(listing.photos)) {
    const first = listing.photos.find((photo) => typeof photo === "string" && photo);
    if (first) return first;
  }
  return "";
}

function formatComingDate(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function roomsLabel(bedrooms, bathrooms) {
  const parts = [];
  if (bedrooms) {
    if (bedrooms === "0" || /^studio$/i.test(bedrooms)) parts.push("Studio");
    else parts.push(bedrooms === "1" ? "1 bed" : `${bedrooms} beds`);
  }
  if (bathrooms) {
    parts.push(bathrooms === "1" ? "1 bath" : `${bathrooms} baths`);
  }
  return parts.join(", ");
}

function statusLabel(headline, justWord, statusWord) {
  if (STATUS_LABELS[headline]) return STATUS_LABELS[headline];
  return [justWord, statusWord].filter(Boolean).join(" ");
}

export function projectCardData(row) {
  const listing = object(row.listing);
  const studio = object(row.studio);
  const fields = object(studio.fields);
  const headline = text(row.headline) || text(studio.headline);
  const comingSoonDate = text(row.coming_soon) || text(studio.comingSoonDate);
  const availableOn =
    headline === "available-on" ? formatComingDate(comingSoonDate) : "";

  return {
    id: row.id,
    title: text(row.title) || "Untitled listing",
    updated_at: text(row.updated_at),
    photo: text(row.photo) || text(row.first_photo) || listingPhoto(listing),
    location: text(row.location) || text(row.community) || text(listing.location) || text(listing.community),
    propertyName: text(row.property_name) || text(listing.propertyName),
    price: text(row.price) || text(listing.price) || text(row.studio_price) || text(fields.stat2Value),
    rooms: roomsLabel(
      text(row.bedrooms) || text(listing.bedrooms) || text(row.studio_beds) || text(fields.stat0Value),
      text(row.bathrooms) || text(listing.bathrooms)
    ),
    status: statusLabel(
      headline,
      text(row.just_word) || text(fields.justWord),
      text(row.status_word) || text(fields.statusWord)
    ),
    availableOn,
  };
}
