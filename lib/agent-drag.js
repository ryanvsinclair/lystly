export const LISTING_SIZE = 1080;
export const AGENT_MIN_VISIBLE = 80;

export function clampAgentPosition(x, y, width, height) {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  return {
    x: Math.min(LISTING_SIZE - AGENT_MIN_VISIBLE, Math.max(-w + AGENT_MIN_VISIBLE, x)),
    y: Math.min(LISTING_SIZE - AGENT_MIN_VISIBLE, Math.max(-h + AGENT_MIN_VISIBLE, y)),
  };
}

export function listingPointerScale(listingEl) {
  if (!listingEl) return 1;
  const box = listingEl.getBoundingClientRect();
  return box.width / LISTING_SIZE || 1;
}
