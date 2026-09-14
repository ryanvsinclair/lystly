"use server";

import { redirect } from "next/navigation";
import {
  agencyNameFromHomepage,
  homepageKey,
  normalizeHomepageUrl,
} from "@/lib/agency.js";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

function extensionFor(file, fallback) {
  const type = String(file?.type || "");
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  const name = String(file?.name || "");
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : fallback;
}

export async function lookupAgencyAction(homepage) {
  const { supabase } = await requireUser();
  const key = homepageKey(homepage);
  if (!key) return { ok: false, error: "Paste a valid agency homepage." };

  const { data, error } = await supabase.rpc("lookup_agency", {
    p_homepage_key: key,
  });
  if (error) return { ok: false, error: error.message || "Could not look up that agency." };

  const agency = Array.isArray(data) ? data[0] : data;
  if (!agency?.id) {
    return {
      ok: true,
      exists: false,
      name: agencyNameFromHomepage(homepage),
      homepage: normalizeHomepageUrl(homepage),
    };
  }

  return {
    ok: true,
    exists: true,
    agency: {
      id: agency.id,
      name: agency.name,
      homepage_url: agency.homepage_url,
      logo_path: agency.logo_path,
    },
  };
}

export async function completeOnboarding(formData) {
  const { supabase, user } = await requireUser();
  const homepage = String(formData.get("homepage") || "");
  const key = homepageKey(homepage);
  const homepageUrl = normalizeHomepageUrl(homepage);
  if (!key || !homepageUrl) {
    return { ok: false, error: "Paste a valid agency homepage." };
  }

  const displayName = String(formData.get("display_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const publicEmail = String(formData.get("public_email") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim().replace(/^@/, "");
  const agencyName = String(formData.get("agency_name") || "").trim()
    || agencyNameFromHomepage(homepage);
  const logo = formData.get("logo");
  const cutout = formData.get("cutout");

  if (!displayName) return { ok: false, error: "Enter the agent name that should appear on the square." };
  if (!(cutout instanceof File) || !cutout.size) {
    return { ok: false, error: "Upload your agent cutout. Use a transparent PNG." };
  }

  const { data: lookedUp, error: lookupError } = await supabase.rpc("lookup_agency", {
    p_homepage_key: key,
  });
  if (lookupError) {
    return { ok: false, error: lookupError.message || "Could not look up that agency." };
  }

  let agency = Array.isArray(lookedUp) ? lookedUp[0] : lookedUp;

  if (!agency?.id) {
    if (!(logo instanceof File) || !logo.size) {
      return { ok: false, error: "Upload the agency logo. Use a transparent PNG." };
    }

    const { data: created, error: createError } = await supabase
      .from("agencies")
      .insert({
        name: agencyName,
        homepage_url: homepageUrl,
        homepage_key: key,
        created_by: user.id,
      })
      .select("id, name, homepage_url, logo_path")
      .single();

    if (createError) {
      const { data: again } = await supabase.rpc("lookup_agency", {
        p_homepage_key: key,
      });
      agency = Array.isArray(again) ? again[0] : again;
      if (!agency?.id) {
        return { ok: false, error: createError.message || "Could not create the agency." };
      }
    } else {
      agency = created;
      const logoPath = `${agency.id}/logo.${extensionFor(logo, "png")}`;
      const { error: logoError } = await supabase.storage
        .from("agency-logos")
        .upload(logoPath, logo, { upsert: true, contentType: logo.type || "image/png" });
      if (logoError) {
        return { ok: false, error: logoError.message || "Could not upload the logo." };
      }
      const { error: logoUpdateError } = await supabase
        .from("agencies")
        .update({ logo_path: logoPath, name: agencyName })
        .eq("id", agency.id);
      if (logoUpdateError) {
        return { ok: false, error: logoUpdateError.message || "Could not save the logo." };
      }
    }
  }

  const cutoutPath = `${user.id}/cutout.${extensionFor(cutout, "png")}`;
  const { error: cutoutError } = await supabase.storage
    .from("agent-cutouts")
    .upload(cutoutPath, cutout, { upsert: true, contentType: cutout.type || "image/png" });
  if (cutoutError) {
    return { ok: false, error: cutoutError.message || "Could not upload the cutout." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      agency_id: agency.id,
      display_name: displayName,
      phone,
      public_email: publicEmail,
      instagram,
      cutout_path: cutoutPath,
    })
    .eq("id", user.id);

  if (profileError) {
    return { ok: false, error: profileError.message || "Could not save your profile." };
  }

  redirect("/app");
}
