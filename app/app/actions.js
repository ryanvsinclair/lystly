"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }
  return { supabase, user };
}

export async function createProject() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      agency_id: profile?.agency_id || null,
      title: "Untitled listing",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not create project.");
  }

  redirect(`/app/${data.id}`);
}

export async function deleteProject(formData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    throw new Error(error.message || "Could not delete project.");
  }
}

export async function saveProject(id, payload) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("projects")
    .update({
      title: payload.title || "Untitled listing",
      listing_url: payload.listing_url || null,
      listing: payload.listing || {},
      studio: payload.studio || {},
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Could not save project.");
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
