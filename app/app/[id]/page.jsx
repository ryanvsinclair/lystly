import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudioClient } from "@/components/StudioClient";

export const dynamic = "force-dynamic";

export default async function StudioPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, listing_url, listing, studio")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone, public_email, instagram, cutout_path, agencies(name, logo_path)")
    .eq("id", user.id)
    .maybeSingle();

  let cutoutUrl = "";
  if (profile?.cutout_path) {
    const { data: signed } = await supabase.storage
      .from("agent-cutouts")
      .createSignedUrl(profile.cutout_path, 60 * 60 * 6);
    cutoutUrl = signed?.signedUrl || "";
  }

  let logoUrl = "";
  if (profile?.agencies?.logo_path) {
    const { data: publicLogo } = supabase.storage
      .from("agency-logos")
      .getPublicUrl(profile.agencies.logo_path);
    logoUrl = publicLogo?.publicUrl || "";
  }

  return (
    <StudioClient
      project={project}
      brand={{
        agencyName: profile?.agencies?.name || "",
        logoUrl,
        agentName: profile?.display_name || "",
        phone: profile?.phone || "",
        email: profile?.public_email || "",
        instagram: profile?.instagram || "",
        cutoutUrl,
      }}
    />
  );
}
