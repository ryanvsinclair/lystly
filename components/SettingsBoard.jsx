"use client";

import { useState } from "react";
import { useThemeState } from "@/components/ThemeState";
import { APP_MODES, getTheme } from "@/lib/themes.js";
import "./settings-board.css";

export function SettingsBoard() {
  const { mode, setAppearance } = useThemeState();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function choose(nextMode) {
    if (nextMode === mode && status === "Saved") return;
    setBusy(true);
    setStatus("Saving…");
    try {
      await setAppearance({ themeId: "frost", mode: nextMode });
      setStatus("Saved");
    } catch (err) {
      setStatus(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dashboard">
      <div className="dashboard-head">
        <div>
          <p>White frost only. Light and dark use the same white, grey, and black.</p>
        </div>
        <p className={`settings-status${status && status !== "Saved" && status !== "Saving…" ? " is-error" : ""}`}>
          {status}
        </p>
      </div>

      <div className="settings-themes slide-well" data-index={mode === "dark" ? "1" : "0"}>
        <b className="slide-lid" aria-hidden="true"></b>
        {APP_MODES.map((item) => {
          const preview = getTheme("frost", item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`settings-theme${item.id === mode ? " is-active" : ""}`}
              disabled={busy && item.id !== mode}
              onClick={() => choose(item.id)}
            >
              <span className="settings-theme-preview" aria-hidden="true">
                <i style={{ background: preview.bar }} />
                <span>
                  <b style={{ background: preview.well }} />
                  <em style={{ background: preview.lid }} />
                </span>
              </span>
              <strong>{item.name}</strong>
              <small>{item.note}</small>
            </button>
          );
        })}
      </div>
    </main>
  );
}
