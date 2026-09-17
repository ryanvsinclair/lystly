"use client";

import { useState } from "react";
import Link from "next/link";
import { SlideToggle } from "@/components/SlideToggle";
import { GLASS_PALETTES, paletteVars } from "./palettes";
import "./glass-temp.css";

const PHOTOS = [
  "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/38dfbae8-4f76-4c65-b4e7-30530dc58047/1312x894.jpg?v=37332dadff0b4b16a6d962c876b326fa",
  "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/c0827f7e-2263-40bf-bd35-36f7da01e485/1312x894.jpg?v=db6cdcf9d4f87aef292f240b572b5811",
  "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/2a899c33-a537-4c25-9958-970688372f05/1312x894.jpg?v=54216c2c02c269169798bb7b198761d1",
];

const CARDS = [
  { title: "Hayat Townhouses", meta: "Sep 14, 4:12 PM", photo: PHOTOS[1] },
  { title: "District One Villas", meta: "Sep 12, 11:03 AM", photo: PHOTOS[0] },
  { title: "Palm Jumeirah", meta: "Sep 10, 9:41 AM", photo: PHOTOS[2] },
];

const TOKEN_KEYS = [
  ["page", "Page"],
  ["well", "Well"],
  ["lid", "Lid"],
  ["ink", "Ink"],
  ["solid", "Solid"],
  ["stage", "Stage"],
];

function photoSrc(url) {
  return `/api/pf-image?url=${encodeURIComponent(url)}`;
}

function Mark({ mode, className = "glass-mark" }) {
  return (
    <img
      className={className}
      src={mode === "light" ? "/brand/lystly-black.png" : "/brand/lystly-white.png"}
      alt="Lystly"
    />
  );
}

function Mini({ tokens, mode }) {
  return (
    <div className="glass-mini" style={paletteVars(tokens)}>
      <div className="glass-mini-bar">
        <Mark mode={mode} className="glass-mini-mark" />
      </div>
      <div className="glass-mini-body">
        <div className="glass-mini-card" />
        <div className="glass-mini-stage" />
      </div>
    </div>
  );
}

function LiveShell({ tokens, view, mode, frost }) {
  return (
    <div className={`glass-live${frost ? " is-frost" : ""}`} style={paletteVars(tokens)}>
      <div className="glass-live-ui">
        <header className="glass-bar">
          <Mark mode={mode} />
          <div className="glass-bar-actions">
            <span className="glass-chip">Projects</span>
            <span className="glass-chip">Settings</span>
            <span className="glass-solid">Log out</span>
          </div>
        </header>

        <div className="glass-body">
          <aside className="glass-rail">
            <em>{view === "projects" ? "Library" : "Listing studio"}</em>
            <h2>{view === "projects" ? "Your listings" : "Pose and download"}</h2>
            <p>
              {view === "projects"
                ? "App chrome only. Photo cards sit on the page, not a mesh."
                : "Sidebar and bar use the selected light or dark glass."}
            </p>
            <div className="glass-chips">
              <span className="glass-chip">Crossed</span>
              <span className="glass-chip">Open</span>
              <span className="glass-solid">Save</span>
            </div>
            <div className="glass-download">
              <span>
                PNG <b />
              </span>
              <span>
                PDF <b />
              </span>
              <span>
                Folder <b />
              </span>
            </div>
          </aside>

          {view === "projects" ? (
            <section className="glass-stage is-projects">
              <div className="glass-search">Search listings</div>
              <div className="glass-cards">
                {CARDS.map((card) => (
                  <article key={card.title} className="glass-card">
                    <img src={photoSrc(card.photo)} alt="" />
                    <div className="glass-card-panel">
                      <strong>{card.title}</strong>
                      <span>{card.meta}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="glass-stage">
              <div className="glass-preview-bar">
                <div className="glass-switch slide-well" data-index="1">
                  <b className="slide-lid" aria-hidden="true"></b>
                  <i>Listing</i>
                  <i className="is-on">Brochure</i>
                </div>
              </div>
              <div className="glass-stage-canvas">
                <div className="glass-square">
                  <div className="glass-square-frost" />
                  <div className="glass-square-rim" />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export function GlassThemes() {
  const [paletteId, setPaletteId] = useState("frost");
  const [mode, setMode] = useState("light");
  const [view, setView] = useState("studio");
  const palette = GLASS_PALETTES.find((item) => item.id === paletteId) ?? GLASS_PALETTES[0];
  const tokens = palette[mode];

  return (
    <div className="glass-temp">
      <header className="glass-temp-head">
        <div className="glass-temp-links">
          <Link href="/mesh-temp">Landing mocks</Link>
          <Link href="/studio-temp">Studio palettes</Link>
          <Link href="/projects-temp">Project cards</Link>
        </div>
        <h1>Glass light and dark</h1>
        <p>
          Review-only for studio, projects, and settings. No mesh. The landing
          page stays on its own look and is not themed.
        </p>
        <div className="glass-temp-tools">
          <SlideToggle
            ariaLabel="Color mode"
            value={mode}
            options={[
              { id: "light", label: "Light" },
              { id: "dark", label: "Dark" },
            ]}
            onChange={setMode}
          />
          <SlideToggle
            ariaLabel="Preview"
            value={view}
            options={[
              { id: "studio", label: "Studio" },
              { id: "projects", label: "Projects" },
            ]}
            onChange={setView}
          />
        </div>
      </header>

      <LiveShell tokens={tokens} view={view} mode={mode} frost />

      <div className="glass-tokens">
        {TOKEN_KEYS.filter(([key]) => tokens[key]).map(([key, label]) => (
          <span key={key} className="glass-token">
            <i style={{ background: tokens[key] }} />
            {label} {tokens[key]}
          </span>
        ))}
      </div>

      <div className="glass-grid">
        {GLASS_PALETTES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`glass-pick${item.id === paletteId ? " is-on" : ""}`}
            onClick={() => setPaletteId(item.id)}
          >
            <div className="glass-pick-pair">
              <Mini tokens={item.light} mode="light" />
              <Mini tokens={item.dark} mode="dark" />
            </div>
            <div className="glass-pick-copy">
              <h2>{item.name}</h2>
              <p>{item.note}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
