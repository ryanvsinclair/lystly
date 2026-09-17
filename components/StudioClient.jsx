"use client";

import { useEffect, useRef, useState } from "react";
import { AppBarSlot } from "@/components/AppBar";
import { StudioMarkup } from "@/components/StudioMarkup";
import { saveAgentPose, saveProject } from "@/app/app/actions";
import { MAX_AGENT_POSES } from "@/lib/brand.js";
import "@/src/styles.css";

const AUTOSAVE_MS = 30000;

export function StudioClient({ project, brand }) {
  const [saveLabel, setSaveLabel] = useState("Saved");
  const apiRef = useRef(null);
  const dirtyRef = useRef(false);
  const projectRef = useRef(project);
  const persistRef = useRef(async () => {});
  projectRef.current = project;

  persistRef.current = async function persist() {
    const api = apiRef.current;
    if (!api || !dirtyRef.current) return;
    dirtyRef.current = false;
    setSaveLabel("Saving…");
    try {
      await saveProject(projectRef.current.id, api.getStudioState());
      setSaveLabel("Saved");
    } catch (err) {
      dirtyRef.current = true;
      setSaveLabel(err.message || "Save failed");
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
          setSaveLabel("Unsaved");
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
        <span className="save-dot">{saveLabel}</span>
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
