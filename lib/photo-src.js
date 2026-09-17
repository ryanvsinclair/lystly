export function photoSrc(url) {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `/api/pf-image?url=${encodeURIComponent(url)}`;
}
