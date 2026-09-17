import { HomeLanding } from "@/components/HomeLanding";
import { loadProfileBrand } from "@/lib/brand.js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const brand = user ? await loadProfileBrand(supabase, user.id) : null;

  return <HomeLanding signedIn={Boolean(user)} brand={brand} />;
}
