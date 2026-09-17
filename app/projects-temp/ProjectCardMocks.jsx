"use client";

import { useState } from "react";
import Link from "next/link";
import { CARD_DESIGNS, SAMPLES } from "./designs";
import "./projects-temp.css";

function photoSrc(url) {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `/api/pf-image?url=${encodeURIComponent(url)}`;
}

function Actions({ wide }) {
  return (
    <div className="pcard-actions">
      <span className="pcard-open">{wide ? "Open listing" : "Open"}</span>
      <span className="pcard-del">Delete</span>
    </div>
  );
}

function Photo({ sample, className = "" }) {
  if (!sample.photo) {
    return <span className={`pcard-cover is-empty ${className}`.trim()}>No photo</span>;
  }

  return (
    <img
      className={`pcard-cover ${className}`.trim()}
      src={photoSrc(sample.photo)}
      alt=""
    />
  );
}

function Card({ design, sample }) {
  if (design === "current") {
    return (
      <article className="pcard">
        <div>
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
        <Actions />
      </article>
    );
  }

  if (design === "photo-overlay") {
    return (
      <article className="pcard is-photo-overlay">
        <Photo sample={sample} />
        <span className="pcard-icon" aria-hidden="true">
          ×
        </span>
        <div className="pcard-overlay">
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
      </article>
    );
  }

  if (design === "photo-poster") {
    return (
      <article className="pcard is-photo-poster">
        <Photo sample={sample} />
        <div>
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
        <Actions />
      </article>
    );
  }

  if (design === "photo-banner") {
    return (
      <article className="pcard is-photo-banner">
        <Photo sample={sample} />
        <div>
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
        <Actions />
      </article>
    );
  }

  if (design === "photo-square") {
    return (
      <article className="pcard is-photo-square">
        <Photo sample={sample} />
        <div className="pcard-caption">
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
      </article>
    );
  }

  if (design === "photo-row") {
    return (
      <article className="pcard is-photo-row">
        <Photo sample={sample} />
        <div className="pcard-body">
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
        <Actions />
      </article>
    );
  }

  if (design === "photo-deep") {
    return (
      <article className="pcard is-photo-deep">
        <Photo sample={sample} />
        <div className="pcard-caption">
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
          <Actions />
        </div>
      </article>
    );
  }

  if (design === "cover" || design === "cream" || design === "compact") {
    return (
      <article className={`pcard is-${design}`}>
        <Photo sample={sample} />
        <div>
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
        <Actions />
      </article>
    );
  }

  if (design === "open") {
    return (
      <article className="pcard is-open">
        <Photo sample={sample} />
        <span className="pcard-icon" aria-hidden="true">
          ×
        </span>
        <div>
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
      </article>
    );
  }

  if (design === "editorial") {
    return (
      <article className="pcard is-editorial">
        <div>
          <time>{sample.updated}</time>
          <h4>{sample.title}</h4>
        </div>
        <Actions wide />
      </article>
    );
  }

  if (design === "rows") {
    return (
      <article className="pcard is-rows">
        <Photo sample={sample} />
        <div className="pcard-body">
          <h4>{sample.title}</h4>
          <time>{sample.updated}</time>
        </div>
        <Actions />
      </article>
    );
  }

  return (
    <article className="pcard is-deep">
      <div>
        <h4>{sample.title}</h4>
        <time>{sample.updated}</time>
      </div>
      <Actions />
    </article>
  );
}

function gridClass(design) {
  if (design === "rows" || design === "photo-row") return " is-rows";
  if (design === "compact") return " is-compact";
  if (design === "photo-banner") return " is-banner";
  return "";
}

function Dashboard({ design }) {
  return (
    <div className="pcards-frame">
      <div className="pcards-bar">
        Lystly
        <span>Projects · Sign out</span>
      </div>
      <div className="pcards-dash">
        <div className="pcards-dash-head">
          <div>
            <h3>Projects</h3>
            <p>Open a listing or start a new one.</p>
          </div>
          <span className="pcards-new">New listing</span>
        </div>
        <div className={`pcards-grid${gridClass(design)}`}>
          {SAMPLES.map((sample) => (
            <Card design={design} key={`${design}-${sample.title}`} sample={sample} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCardMocks() {
  const [activeId, setActiveId] = useState("photo-overlay");
  const active = CARD_DESIGNS.find((design) => design.id === activeId) ?? CARD_DESIGNS[0];

  return (
    <div className="pcards-temp">
      <header className="pcards-temp-head">
        <Link href="/studio-temp">Studio palettes</Link>
        <h1>Project card designs</h1>
        <p>
          Same turquoise page, cream bar, and gold accent. Photo cards use the
          listing’s main image. The last card shows the empty state.
        </p>
        <div className="pcards-picks">
          {CARD_DESIGNS.map((design) => (
            <button
              key={design.id}
              type="button"
              className={design.id === activeId ? "is-on" : undefined}
              onClick={() => setActiveId(design.id)}
            >
              {design.name}
            </button>
          ))}
        </div>
      </header>

      <section className="pcards-hero">
        <Dashboard design={active.id} />
        <div className="pcards-copy">
          <h2>{active.name}</h2>
          <p>{active.note}</p>
        </div>
      </section>

      <div className="pcards-stack">
        {CARD_DESIGNS.map((design) => (
          <button
            key={design.id}
            type="button"
            className={`pcards-pick-card${design.id === activeId ? " is-on" : ""}`}
            onClick={() => setActiveId(design.id)}
          >
            <Dashboard design={design.id} />
            <div className="pcards-copy">
              <h2>{design.name}</h2>
              <p>{design.note}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
