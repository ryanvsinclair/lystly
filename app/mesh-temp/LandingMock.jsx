"use client";

import Link from "next/link";
import { LiquidMesh } from "@/components/LiquidMesh";
import { LANDING_PALETTES, PALETTE_ORDER } from "./palettes";
import "./landing-mock.css";
import "./mesh-temp.css";

export function LandingMock({ paletteId }) {
  const palette = LANDING_PALETTES[paletteId];

  return (
    <div className={`landing-mock theme-${palette.theme}`}>
      <div className="landing-mock-mesh">
        <LiquidMesh colors={palette.colors} playWhenVisible={false} />
      </div>

      <div className="landing-mock-ui">
        <nav className="site-nav">
          <span className="site-logo">Lystly</span>
          <div className="site-nav-links">
            <span className="nav-link">Log in</span>
            <span className="nav-cta">Get started</span>
          </div>
        </nav>

        <section className="hero">
          <h1>Listing squares and brochures, from a link.</h1>
          <p>
            Paste a listing from a UAE or Canada portal, edit the preview, then
            download the Instagram square, PDF, or photo folder.
          </p>
          <div className="hero-actions">
            <span className="btn-primary">Get started</span>
            <span className="btn-secondary">Log in</span>
          </div>
        </section>

        <section className="steps">
          <article className="step">
            <strong>Step 1</strong>
            <h2>Paste a link</h2>
            <p>Fill the studio from Property Finder, Bayut, REALTOR.ca, and other major portals.</p>
          </article>
          <article className="step">
            <strong>Step 2</strong>
            <h2>Edit the preview</h2>
            <p>Click text, swap photos, pick a header, and set the agent pose.</p>
          </article>
          <article className="step">
            <strong>Step 3</strong>
            <h2>Download</h2>
            <p>Export a 4000×4000 PNG, a brochure PDF, or a folder of pages.</p>
          </article>
        </section>

        <footer className="site-footer">Lystly · {palette.name}</footer>
      </div>

      <aside className="landing-mock-switcher">
        <strong>Mocks</strong>
        {PALETTE_ORDER.map((id) => (
          <Link
            key={id}
            href={`/mesh-temp/${id}`}
            className={id === paletteId ? "is-active" : undefined}
          >
            {LANDING_PALETTES[id].name}
          </Link>
        ))}
        <Link href="/mesh-temp">All four</Link>
      </aside>
    </div>
  );
}

export function LandingMockIndex() {
  return (
    <div className="mesh-temp">
      <div className="landing-mock-index">
        <h1>Landing mocks</h1>
        <p>Four full landing pages. Same layout, different Paper mesh colors.</p>
        <div className="mock-pick-grid">
          {PALETTE_ORDER.map((id) => (
            <Link key={id} href={`/mesh-temp/${id}`} className="mock-pick">
              <LiquidMesh colors={LANDING_PALETTES[id].colors} playWhenVisible={false} />
              <span>{LANDING_PALETTES[id].name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
