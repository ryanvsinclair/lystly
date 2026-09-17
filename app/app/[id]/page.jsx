import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadProfileBrand } from "@/lib/brand.js";
import { StudioClient } from "@/components/StudioClient";

export default async function StudioPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const [{ data: project }, brand] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, listing_url, listing, studio")
      .eq("id", id)
      .maybeSingle(),
    loadProfileBrand(supabase, userId),
  ]);

  if (!project) notFound();

  return <StudioClient project={project} brand={brand} />;
}
