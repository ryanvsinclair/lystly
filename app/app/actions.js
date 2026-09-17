"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  APP_COOKIE_OPTIONS,
  ONBOARDED_COOKIE,
  THEME_COOKIE,
  parseThemeCookie,
  themeCookieValue,
} from "@/lib/app-cookies.js";
import { agentPosePath, isPoseSlot } from "@/lib/brand.js";
import { createClient } from "@/lib/supabase/server";
import { isThemeId, isThemeMode } from "@/lib/themes.js";

const POSE_TYPES = ["image/png", "image/webp"];
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_SAVE_CHARS = 6 * 1024 * 1024;

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

async function requireSignedIn() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Sign in again to save.");
  }
  return { supabase, user };
}

function payloadChars(value) {
  try {
    return JSON.stringify(value).length;
  } catch {
    return Infinity;
  }
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

  return { id: data.id };
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

export async function saveProject(id, payload = {}) {
  const { supabase } = await requireSignedIn();
  if (!id) throw new Error("Could not save project.");
  if (payloadChars(payload) > MAX_SAVE_CHARS) {
    throw new Error("This listing is too large to save. Remove a photo and try again.");
  }

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

export async function saveProjectPhoto(projectId, formData) {
  const { supabase, user } = await requireSignedIn();
  const file = formData.get("file");
  const id = String(projectId || "");

  if (!id) throw new Error("Could not save that photo.");
  if (!file || typeof file === "string" || !file.size) {
    throw new Error("Pick a photo to add.");
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("That photo is too large to save.");
  }

  const type = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (!PHOTO_TYPES.includes(type)) {
    throw new Error("Use a JPG, PNG, or WebP photo.");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!project) throw new Error("Could not find that project.");

  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("project-photos").upload(path, file, {
    contentType: type,
    upsert: false,
  });
  if (error) {
    const message = error.message || "";
    if (/bucket not found/i.test(message)) {
      throw new Error("Photo storage is not ready yet.");
    }
    throw new Error(message || "Could not save that photo.");
  }

  const { data } = supabase.storage.from("project-photos").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Could not save that photo.");
  return { url: data.publicUrl };
}

export async function saveAgentPose(formData) {
  const { supabase, user } = await requireUser();
  const slot = Number(formData.get("slot"));
  const file = formData.get("file");

  if (!isPoseSlot(slot)) {
    throw new Error("That pose slot does not exist.");
  }
  if (!file || typeof file === "string" || !file.size) {
    throw new Error("Pick a cutout to add.");
  }
  if (!POSE_TYPES.includes(file.type)) {
    throw new Error("Poses need to be a PNG or WebP with a transparent background.");
  }

  const path = agentPosePath(user.id, slot);
  const { error } = await supabase.storage
    .from("agent-cutouts")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) {
    throw new Error(error.message || "Could not save that pose.");
  }

  // Slot 1 doubles as the profile cutout used by the signed-in landing preview.
  if (slot === 1) {
    await supabase.from("profiles").update({ cutout_path: path }).eq("id", user.id);
  }

  const { data: signed } = await supabase.storage
    .from("agent-cutouts")
    .createSignedUrl(path, 60 * 60 * 6);

  return { slot, url: signed?.signedUrl || "" };
}

export async function saveTheme({ themeId, mode } = {}) {
  const { supabase, user } = await requireUser();
  const updates = {};
  if (themeId != null) {
    if (!isThemeId(themeId)) throw new Error("That theme is not available.");
    updates.theme_id = "frost";
  }
  if (mode != null) {
    if (!isThemeMode(mode)) throw new Error("That color mode is not available.");
    updates.theme_mode = mode;
  }
  if (!Object.keys(updates).length) return;

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) {
    throw new Error(error.message || "Could not save theme.");
  }

  const jar = await cookies();
  const current = parseThemeCookie(jar.get(THEME_COOKIE)?.value);
  jar.set(
    THEME_COOKIE,
    themeCookieValue(updates.theme_id || current.themeId, updates.theme_mode || current.mode),
    APP_COOKIE_OPTIONS
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const jar = await cookies();
  jar.delete(ONBOARDED_COOKIE);
  jar.delete(THEME_COOKIE);
  revalidatePath("/");
  redirect("/");
}
