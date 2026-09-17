"use client";

import { useEffect, useRef, useState } from "react";
import { AppBarSlot } from "@/components/AppBar";
import { StudioMarkup } from "@/components/StudioMarkup";
import { saveAgentPose, saveProject, saveProjectPhoto } from "@/app/app/actions";
import { MAX_AGENT_POSES } from "@/lib/brand.js";
import "@/src/styles.css";

const AUTOSAVE_MS = 30000;

export function StudioClient({ project, brand }) {
  const [saveLabel, setSaveLabel] = useState("Saved");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const apiRef = useRef(null);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const projectRef = useRef(project);
  const persistRef = useRef(async () => {});
  projectRef.current = project;

  persistRef.current = async function persist({ force = false, source = "auto" } = {}) {
    const api = apiRef.current;
    if (!api || savingRef.current) return;
    if (!force && !dirtyRef.current) return;
    savingRef.current = true;
    dirtyRef.current = false;
    setSaving(true);
    setSaveLabel("Saving…");
    try {
      const state = await api.getPersistableStudioState();
      await saveProject(projectRef.current.id, state);
      if (dirtyRef.current) {
        setDirty(true);
        setSaveLabel("Unsaved");
      } else {
        setDirty(false);
        setSaveLabel(source === "manual" ? "Saved" : "Autosaved");
      }
    } catch (err) {
      dirtyRef.current = true;
      setDirty(true);
      const message = String(err?.message || "");
      setSaveLabel(
        /unexpected response/i.test(message) ? "Could not save. Try again." : message || "Save failed"
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("studio-active");
    let cancelled = false;

    import("@/src/main.js").then((studio) => {
      if (cancelled) return;
      studio.bootStudio({
        onChange() {
          dirtyRef.current = true;
          setDirty(true);
          setSaveLabel("Unsaved");
        },
        async onUploadPhoto(file) {
          const body = new FormData();
          body.set("file", file);
          return saveProjectPhoto(projectRef.current.id, body);
        },
        async onUploadPose(slot, file) {
          const body = new FormData();
          body.set("slot", String(slot));
          body.set("file", file);
          const { url } = await saveAgentPose(body);
          return url;
        },
      });
      apiRef.current = studio;
      if (brand) studio.applyBrand(brand);
      const current = projectRef.current;
      if (current.listing || current.studio || current.listing_url) {
        studio.applyStudioState({
          listing: current.listing,
          listing_url: current.listing_url,
          studio: current.studio,
        });
      }
    });

    const tick = window.setInterval(() => {
      persistRef.current();
    }, AUTOSAVE_MS);

    function flush() {
      persistRef.current();
    }

    function onHide() {
      if (document.visibilityState === "hidden") flush();
    }

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      cancelled = true;
      document.documentElement.classList.remove("studio-active");
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  return (
    <div className="studio-page">
      <AppBarSlot>
        <div className="save-cluster" title="Autosaves every 30 seconds">
          <span className="save-dot">{saveLabel}</span>
          <button
            type="button"
            className="ghost save-btn"
            disabled={saving || !dirty}
            onClick={() => persistRef.current({ force: true, source: "manual" })}
          >
            Save
          </button>
        </div>
      </AppBarSlot>
      <div className="studio-shell">
        <StudioMarkup
          cutoutUrl={brand?.cutoutUrl || ""}
          poses={brand?.poses?.length ? brand.poses : new Array(MAX_AGENT_POSES).fill("")}
        />
      </div>
    </div>
  );
}
