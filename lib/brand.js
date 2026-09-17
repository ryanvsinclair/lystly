export const MAX_AGENT_POSES = 4;

const POSE_TTL = 60 * 60 * 6;
const POSE_NAME = /^pose-([1-4])\.png$/;

export function agentPosePath(userId, slot) {
  return `${userId}/pose-${slot}.png`;
}

export function isPoseSlot(slot) {
  return Number.isInteger(slot) && slot >= 1 && slot <= MAX_AGENT_POSES;
}

export function emptyBrand() {
  return {
    agencyName: "",
    logoUrl: "",
    agentName: "",
    phone: "",
    email: "",
    instagram: "",
    cutoutUrl: "",
    poses: new Array(MAX_AGENT_POSES).fill(""),
  };
}

// Slot 1 falls back to the cutout captured during onboarding so agents who
// never touched the pose inventory still get their original cutout.
async function loadPoses(supabase, userId, cutoutPath) {
  const slots = new Array(MAX_AGENT_POSES).fill("");
  const { data: files } = await supabase.storage.from("agent-cutouts").list(userId, {
    limit: 100,
  });

  const wanted = [];
  for (const file of files || []) {
    const match = POSE_NAME.exec(file.name || "");
    if (match) wanted.push({ slot: Number(match[1]), path: `${userId}/${file.name}` });
  }
  if (cutoutPath && !wanted.some((item) => item.slot === 1)) {
    wanted.push({ slot: 1, path: cutoutPath });
  }
  if (!wanted.length) return slots;

  const { data: signed } = await supabase.storage
    .from("agent-cutouts")
    .createSignedUrls(wanted.map((item) => item.path), POSE_TTL);

  wanted.forEach((item, index) => {
    const url = signed?.[index]?.signedUrl || "";
    if (url) slots[item.slot - 1] = url;
  });

  return slots;
}

export async function loadProfileBrand(supabase, userId) {
  if (!userId) return emptyBrand();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone, public_email, instagram, cutout_path, agencies(name, logo_path)")
    .eq("id", userId)
    .maybeSingle();

  const poses = await loadPoses(supabase, userId, profile?.cutout_path || "");

  let logoUrl = "";
  if (profile?.agencies?.logo_path) {
    const { data: publicLogo } = supabase.storage
      .from("agency-logos")
      .getPublicUrl(profile.agencies.logo_path);
    logoUrl = publicLogo?.publicUrl || "";
  }

  return {
    agencyName: profile?.agencies?.name || "",
    logoUrl,
    agentName: profile?.display_name || "",
    phone: profile?.phone || "",
    email: profile?.public_email || "",
    instagram: profile?.instagram || "",
    cutoutUrl: poses.find(Boolean) || "",
    poses,
  };
}
