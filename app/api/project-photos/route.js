import { createClient } from "@/lib/supabase/server";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Sign in again to save." }, { status: 401 });
    }

    const formData = await request.formData();
    const projectId = String(formData.get("projectId") || "");
    const file = formData.get("file");

    if (!projectId) {
      return Response.json({ error: "Could not save that photo." }, { status: 400 });
    }
    if (!file || typeof file === "string" || !file.size) {
      return Response.json({ error: "Pick a photo to add." }, { status: 400 });
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return Response.json({ error: "That photo is too large to save." }, { status: 400 });
    }

    const type = file.type === "image/jpg" ? "image/jpeg" : file.type;
    if (!PHOTO_TYPES.includes(type)) {
      return Response.json({ error: "Use a JPG, PNG, or WebP photo." }, { status: 400 });
    }

    const [{ data: project }, { data: profile }] = await Promise.all([
      supabase.from("projects").select("id, agency_id").eq("id", projectId).maybeSingle(),
      supabase.from("profiles").select("agency_id").eq("id", user.id).maybeSingle(),
    ]);
    if (!project) {
      return Response.json({ error: "Could not find that project." }, { status: 404 });
    }

    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const agencyId = project.agency_id || profile?.agency_id || "";

    const targets = [
      { bucket: "project-photos", path: `${user.id}/${projectId}/${filename}` },
    ];
    if (agencyId) {
      targets.push({ bucket: "agency-logos", path: `${agencyId}/projects/${projectId}/${filename}` });
    }

    let lastError = "";
    for (const target of targets) {
      const { error } = await supabase.storage.from(target.bucket).upload(target.path, file, {
        contentType: type,
        upsert: false,
      });
      if (error) {
        lastError = error.message || "";
        continue;
      }
      const { data } = supabase.storage.from(target.bucket).getPublicUrl(target.path);
      if (data?.publicUrl) return Response.json({ url: data.publicUrl });
    }

    return Response.json(
      { error: lastError || "Could not store that photo." },
      { status: 400 }
    );
  } catch (err) {
    return Response.json({ error: err.message || "Could not store that photo." }, { status: 400 });
  }
}
