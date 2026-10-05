export const MAX_LISTING_PHOTOS = 35;

export function capListingPhotos(urls = []) {
  return [...new Set((urls || []).filter(Boolean))].slice(0, MAX_LISTING_PHOTOS);
}
