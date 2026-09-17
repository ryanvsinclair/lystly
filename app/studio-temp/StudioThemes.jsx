"use client";

import { useState } from "react";
import Link from "next/link";
import { SlideToggle } from "@/components/SlideToggle";
import { getTheme, themeCssVars } from "@/lib/themes.js";
import "./studio-temp.css";

const STYLES = [
  {
    id: "shared",
    name: "Shared wells",
    note: "Related choices share one dark track. The active item is a lighter lid. Closest to Listing / Brochure.",
  },
  {
    id: "tiles",
    name: "Grid lids",
    note: "Keep the 2-up grid. Each choice is its own well. The selected one flips to a lid. No ring.",
  },
  {
    id: "slide",
    name: "Sliding lid",
    note: "One well per row, and a single lid that slides to the choice. Best on two-option rows.",
  },
  {
    id: "quiet",
    name: "Lid only",
    note: "Unselected is plain type. Selected is a lid chip. No track around the group.",
  },
];

const STATUSES = [
  ["coming-soon", "Coming soon"],
  ["available-now", "Available now"],
  ["just-leased", "Just leased"],
  ["just-sold", "Just sold"],
];

const POSES = [
  ["crossed", "Arms crossed", "/agents/arms-crossed.png?v=5"],
  ["presenting", "Presenting", "/agents/presenting.png?v=5"],
];

const FONTS = [
  ["montserrat", "Montserrat", "var(--font-montserrat), Montserrat, sans-serif"],
  ["outfit", "Outfit", "var(--font-outfit), Outfit, sans-serif"],
  ["playfair", "Playfair", "var(--font-playfair), 'Playfair Display', serif"],
  ["fraunces", "Fraunces", "var(--font-fraunces), Fraunces, serif"],
];

function WellGroup({ items, value, onChange, style, kind = "text" }) {
  const index = items.findIndex((item) => item[0] === value);

  if (style === "slide") {
    return (
      <div className={`st-slide st-slide-${kind}`} data-index={index}>
        {index >= 0 ? <b className="st-slide-lid" aria-hidden="true" /> : null}
        {items.map(([id, label, extra]) => (
          <button
            key={id}
            type="button"
            className={id === value ? "is-on" : undefined}
            onClick={() => onChange(id)}
          >
            {kind === "pose" ? <img src={extra} alt="" /> : null}
            <span style={kind === "font" ? { fontFamily: extra } : undefined}>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  const wrap =
    style === "shared" ? "st-well" : style === "tiles" ? "st-tiles" : "st-quiet";

  return (
    <div className={`${wrap} ${kind === "pose" ? "is-pose" : ""} ${items.length > 2 ? "is-grid" : ""}`}>
      {items.map(([id, label, extra]) => (
        <button
          key={id}
          type="button"
          className={id === value ? "is-on" : undefined}
          onClick={() => onChange(id)}
        >
          {kind === "pose" ? <img src={extra} alt="" /> : null}
          <span style={kind === "font" ? { fontFamily: extra } : undefined}>{label}</span>
        </button>
      ))}
    </div>
  );
}

function StudioMock({ styleId, mode }) {
  const theme = getTheme("frost", mode);
  const [status, setStatus] = useState("just-leased");
  const [pose, setPose] = useState("crossed");
  const [font, setFont] = useState("montserrat");

  return (
    <div className="st-shell" data-style={styleId} data-mode={mode} style={themeCssVars(theme)}>
      <header className="st-bar">
        <img
          src={mode === "light" ? "/brand/lystly-black.png" : "/brand/lystly-white.png"}
          alt="Lystly"
        />
        <h1>Listing Studio</h1>
        <div className="st-bar-actions">
          <span>Projects</span>
          <span>Settings</span>
          <span>Sign out</span>
        </div>
      </header>

      <div className="st-body">
        <aside className="st-panel">
          <section>
            <h2>Listing link</h2>
            <div className="st-link">
              <i>Paste a listing link</i>
              <button type="button">Paste</button>
            </div>
          </section>

          <section>
            <h2>Header</h2>
            {styleId === "slide" ? (
              <>
                <WellGroup items={STATUSES.slice(0, 2)} value={status} onChange={setStatus} style={styleId} />
                <WellGroup items={STATUSES.slice(2)} value={status} onChange={setStatus} style={styleId} />
              </>
            ) : (
              <WellGroup items={STATUSES} value={status} onChange={setStatus} style={styleId} />
            )}
          </section>

          <section>
            <h2>Photos</h2>
            <p className="st-label">Agent pose</p>
            <WellGroup items={POSES} value={pose} onChange={setPose} style={styleId} kind="pose" />
          </section>

          <section>
            <h2>Type</h2>
            {styleId === "slide" ? (
              <>
                <WellGroup items={FONTS.slice(0, 2)} value={font} onChange={setFont} style={styleId} kind="font" />
                <WellGroup items={FONTS.slice(2)} value={font} onChange={setFont} style={styleId} kind="font" />
              </>
            ) : (
              <WellGroup items={FONTS} value={font} onChange={setFont} style={styleId} kind="font" />
            )}
          </section>
        </aside>

        <main className="st-stage">
          <div className="st-stage-bar">
            <div className="st-switch slide-well" data-index="0">
              <b className="slide-lid" aria-hidden="true"></b>
              <button type="button" className="is-active">
                Listing
              </button>
              <button type="button">Brochure</button>
            </div>
          </div>
          <div className="st-preview">
            <div className="st-square" />
          </div>
        </main>
      </div>
    </div>
  );
}

export function StudioThemes() {
  const [styleId, setStyleId] = useState("shared");
  const [mode, setMode] = useState("light");
  const active = STYLES.find((item) => item.id === styleId) ?? STYLES[0];

  return (
    <div className="studio-temp">
      <header className="studio-temp-head">
        <div className="studio-temp-links">
          <Link href="/glass-temp">Glass themes</Link>
          <Link href="/projects-temp">Project cards</Link>
        </div>
        <h1>Studio sidebar buttons</h1>
        <p>
          Review-only. Four lid-on-well treatments for Header, pose, and fonts. No
          selection ring. The live studio is unchanged.
        </p>
        <div className="studio-temp-tools">
          <SlideToggle
            ariaLabel="Color mode"
            value={mode}
            options={[
              { id: "light", label: "Light" },
              { id: "dark", label: "Dark" },
            ]}
            onChange={setMode}
          />
          {STYLES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === styleId ? "is-on" : undefined}
              onClick={() => setStyleId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="studio-temp-note">
          <strong>{active.name}.</strong> {active.note}
        </p>
      </header>

      <StudioMock styleId={styleId} mode={mode} />
    </div>
  );
}
