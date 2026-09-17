"use client";

import { useState } from "react";
import { SlideToggle } from "@/components/SlideToggle";
import { getTheme, themeCssVars } from "@/lib/themes.js";
import { photoSrc } from "@/lib/photo-src.js";
import { DESIGNS, SAMPLES } from "./samples";
import "../app-tokens.css";
import "./cards-temp.css";

function Photo({ sample, className = "" }) {
  const src = photoSrc(sample.photo);
  const classes = ["ct-photo", className].filter(Boolean).join(" ");
  if (!src) return <span className={`${classes} is-empty`}>No photo</span>;
  return <img className={classes} src={src} alt="" />;
}

function Remove() {
  return (
    <button className="ct-remove" type="button" aria-label="Delete listing">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}

function Facts({ sample }) {
  const bits = [sample.price, sample.rooms].filter(Boolean);
  if (!bits.length) return null;
  return (
    <ul className="ct-facts">
      {bits.map((bit) => (
        <li key={bit}>{bit}</li>
      ))}
    </ul>
  );
}

function Card({ design, sample }) {
  if (design === "hairline") {
    return (
      <article className="ct-card is-hairline">
        <Photo sample={sample} />
        <div className="ct-body">
          <h3>{sample.title}</h3>
          <p className="ct-sub">{sample.location || "No address yet"}</p>
          <Facts sample={sample} />
        </div>
        <footer className="ct-foot">
          <time>{sample.updated}</time>
          <span className="ct-open">Open</span>
        </footer>
        <Remove />
      </article>
    );
  }

  if (design === "sheet") {
    return (
      <article className="ct-card is-sheet">
        <Photo sample={sample} />
        {sample.status ? <span className="ct-chip">{sample.status}</span> : null}
        <div className="ct-sheet">
          <h3>{sample.title}</h3>
          <p className="ct-sub">{sample.location || "No address yet"}</p>
          <div className="ct-sheet-foot">
            <span>{[sample.price, sample.rooms].filter(Boolean).join("  ·  ") || sample.updated}</span>
            <i className="ct-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </i>
          </div>
        </div>
        <Remove />
      </article>
    );
  }

  if (design === "framed") {
    return (
      <article className="ct-card is-framed">
        <div className="ct-mount">
          <Photo sample={sample} />
        </div>
        <div className="ct-body">
          <div className="ct-line">
            <h3>{sample.title}</h3>
            {sample.price ? <b>{sample.price}</b> : null}
          </div>
          <p className="ct-sub">{sample.location || "No address yet"}</p>
        </div>
        <Remove />
      </article>
    );
  }

  if (design === "glass") {
    return (
      <article className="ct-card is-glass">
        <Photo sample={sample} />
        <div className="ct-glass">
          {sample.status ? <span className="ct-eyebrow">{sample.status}</span> : null}
          <h3>{sample.title}</h3>
          <p className="ct-sub">{sample.location || "No address yet"}</p>
          {sample.price || sample.rooms ? (
            <p className="ct-glass-foot">{[sample.price, sample.rooms].filter(Boolean).join("  ·  ")}</p>
          ) : null}
        </div>
        <Remove />
      </article>
    );
  }

  if (design === "stats") {
    const cells = [
      { label: "Price", value: sample.price },
      { label: "Rooms", value: sample.rooms },
      { label: "Size", value: sample.size },
    ];
    return (
      <article className="ct-card is-stats">
        <Photo sample={sample} />
        <div className="ct-body">
          <h3>{sample.title}</h3>
          <p className="ct-sub">{sample.location || "No address yet"}</p>
        </div>
        <div className="ct-well">
          {cells.map((cell) => (
            <span key={cell.label}>
              <small>{cell.label}</small>
              {cell.value || "—"}
            </span>
          ))}
        </div>
        <Remove />
      </article>
    );
  }

  if (design === "split") {
    return (
      <article className="ct-card is-split">
        <div className="ct-mount">
          <Photo sample={sample} />
        </div>
        <div className="ct-body">
          <time>{sample.updated}</time>
          <h3>{sample.title}</h3>
          <p className="ct-sub">{sample.location || "No address yet"}</p>
          <Facts sample={sample} />
          <div className="ct-split-foot">
            <span className="ct-open">Open listing</span>
          </div>
        </div>
        <Remove />
      </article>
    );
  }

  return (
    <article className="ct-card is-row">
      <div className="ct-thumb">
        <Photo sample={sample} />
      </div>
      <div className="ct-body">
        <h3>{sample.title}</h3>
        <p className="ct-sub">{sample.location || "No address yet"}</p>
      </div>
      <div className="ct-row-facts">
        <Facts sample={sample} />
        <time>{sample.updated}</time>
      </div>
      <i className="ct-arrow is-plain" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </i>
      <Remove />
    </article>
  );
}

export function CardDesigns() {
  const [mode, setMode] = useState("light");
  const theme = getTheme("frost", mode);

  return (
    <div
      className="app-shell"
      data-theme={theme.id}
      data-mode={theme.mode}
      style={themeCssVars(theme)}
    >
      <div className="cards-temp">
        <header className="ct-head">
          <div>
            <h1>Project cards</h1>
            <p>Seven takes on the listing card, all built from the app theme tokens.</p>
          </div>
          <SlideToggle
            className="ct-mode"
            ariaLabel="Theme mode"
            value={mode}
            options={[
              { id: "light", label: "Light" },
              { id: "dark", label: "Dark" },
            ]}
            onChange={setMode}
          />
        </header>

        {DESIGNS.map((design) => (
          <section className="ct-section" key={design.id}>
            <div className="ct-section-head">
              <h2>{design.name}</h2>
              <p>{design.note}</p>
            </div>
            <div className={`ct-grid is-${design.layout}`}>
              {SAMPLES.map((sample) => (
                <Card design={design.id} key={sample.id} sample={sample} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
