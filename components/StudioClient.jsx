"use client";

import { useEffect, useRef, useState } from "react";
import { AppBar } from "@/components/AppBar";
import { StudioMarkup } from "@/components/StudioMarkup";
import { saveProject } from "@/app/app/actions";
import "@/src/styles.css";

export function StudioClient({ project, brand }) {
  const [saveLabel, setSaveLabel] = useState("Saved");
  const saveTimer = useRef(null);
  const apiRef = useRef(null);
  const projectRef = useRef(project);
  projectRef.current = project;

  async function persist(reason) {
    const api = apiRef.current;
    if (!api) return;
    const state = api.getStudioState();
    setSaveLabel("Saving…");
    try {
      await saveProject(projectRef.current.id, state);
      setSaveLabel(reason === "manual" ? "Saved" : "Saved");
    } catch (err) {
      setSaveLabel(err.message || "Save failed");
    }
  }

  function scheduleSave() {
    setSaveLabel("Unsaved");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      persist("auto");
    }, 1200);
  }

  useEffect(() => {
    document.documentElement.classList.add("studio-active");
    let cancelled = false;

    import("@/src/main.js").then((studio) => {
      if (cancelled) return;
      studio.bootStudio({
        onChange() {
          scheduleSave();
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

    return () => {
      cancelled = true;
      document.documentElement.classList.remove("studio-active");
      window.clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <div className="studio-page">
      <AppBar>
        <span className="save-dot">{saveLabel}</span>
        <button className="ghost" type="button" onClick={() => persist("manual")}>
          Save
        </button>
      </AppBar>
      <div className="studio-shell">
        <StudioMarkup />
      </div>
    </div>
  );
}
