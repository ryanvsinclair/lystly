"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, deleteProject } from "@/app/app/actions";
import { useAppTransition } from "@/components/AppTransition";
import { SlideToggle } from "@/components/SlideToggle";
import { photoSrc } from "@/lib/photo-src.js";
import "./projects-board.css";

const VIEW_KEY = "lystly-projects-view";
const VIEWS = ["hairline", "split", "row"];

function formatUpdated(value) {
  if (!value) return "Not saved yet";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function matchesQuery(project, query) {
  if (!query) return true;
  const haystack = [
    project.title,
    project.propertyName,
    project.location,
    project.price,
    project.rooms,
    project.status,
    project.availableOn,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function savedView(value) {
  if (value === "overlay") return "hairline";
  if (value === "rows") return "row";
  return VIEWS.includes(value) ? value : "hairline";
}

function displayName(project) {
  return project.propertyName || project.title;
}

function Photo({ project }) {
  const src = photoSrc(project.photo);
  if (!src) return <span className="project-card-photo is-empty">No photo</span>;
  return <img className="project-card-photo" src={src} alt="" />;
}

function Facts({ project }) {
  const bits = [project.price, project.rooms].filter(Boolean);
  if (!bits.length) return null;
  return (
    <ul className="project-card-facts">
      {bits.map((bit) => (
        <li key={bit}>{bit}</li>
      ))}
    </ul>
  );
}

function ConfirmDelete({ project, confirm, onConfirm }) {
  return (
    <form action={deleteProject} className="project-card-delete">
      <input type="hidden" name="id" value={project.id} />
      <button
        type="submit"
        className={`project-card-remove${confirm ? " is-confirm" : ""}`}
        aria-label={confirm ? `Confirm delete ${project.title}` : `Delete ${project.title}`}
        onClick={(event) => {
          event.stopPropagation();
          if (confirm) return;
          event.preventDefault();
          onConfirm();
        }}
      >
        <span className="project-card-remove-icon is-x" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </span>
        <span className="project-card-remove-icon is-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 5 5 9-10" />
          </svg>
        </span>
      </button>
    </form>
  );
}

function HairlineCard({ project }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <article className="project-card is-hairline" onMouseLeave={() => setConfirm(false)}>
      <a className="project-card-open" href={`/app/${project.id}`}>
        <Photo project={project} />
        <div className="project-card-body">
          <h2>{displayName(project)}</h2>
          <p className="project-card-sub">{project.location || "No address yet"}</p>
          <Facts project={project} />
        </div>
        <footer className="project-card-foot">
          <time dateTime={project.updated_at}>{formatUpdated(project.updated_at)}</time>
          <span className="project-card-open-label">Open</span>
        </footer>
      </a>
      <ConfirmDelete confirm={confirm} onConfirm={() => setConfirm(true)} project={project} />
    </article>
  );
}

function SplitCard({ project }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <article className="project-card is-split" onMouseLeave={() => setConfirm(false)}>
      <a className="project-card-open" href={`/app/${project.id}`}>
        <div className="project-card-mount">
          <Photo project={project} />
        </div>
        <div className="project-card-body">
          <time dateTime={project.updated_at}>{formatUpdated(project.updated_at)}</time>
          <h2>{displayName(project)}</h2>
          <p className="project-card-sub">{project.location || "No address yet"}</p>
          <Facts project={project} />
          <div className="project-card-split-foot">
            <span className="project-card-open-label">Open listing</span>
          </div>
        </div>
      </a>
      <ConfirmDelete confirm={confirm} onConfirm={() => setConfirm(true)} project={project} />
    </article>
  );
}

function RowCard({ project }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <article className="project-card is-row" onMouseLeave={() => setConfirm(false)}>
      <a className="project-card-open" href={`/app/${project.id}`}>
        <div className="project-card-thumb">
          <Photo project={project} />
        </div>
        <div className="project-card-body">
          <h2>{displayName(project)}</h2>
          <p className="project-card-sub">{project.location || "No address yet"}</p>
        </div>
        <p className="project-card-cell is-price">{project.price || "—"}</p>
        <p className="project-card-cell is-rooms">{project.rooms || "—"}</p>
        <time dateTime={project.updated_at}>{formatUpdated(project.updated_at)}</time>
        <i className="project-card-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </i>
      </a>
      <ConfirmDelete confirm={confirm} onConfirm={() => setConfirm(true)} project={project} />
    </article>
  );
}

const CARD = {
  hairline: HairlineCard,
  split: SplitCard,
  row: RowCard,
};

const OUT_MS = 220;
const IN_MS = 280;

export function ProjectsBoard({ projects }) {
  const router = useRouter();
  const { navigate } = useAppTransition();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("hairline");
  const [shown, setShown] = useState("hairline");
  const [motion, setMotion] = useState({ phase: "idle", dir: 1 });
  const [creating, setCreating] = useState(false);
  const timers = useRef([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    const next = savedView(window.localStorage.getItem(VIEW_KEY));
    setView(next);
    setShown(next);
  }, []);

  function changeView(next) {
    const resolved = savedView(next);
    if (resolved === view) return;

    const dir = VIEWS.indexOf(resolved) > VIEWS.indexOf(view) ? 1 : -1;
    setView(resolved);
    window.localStorage.setItem(VIEW_KEY, resolved);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearTimers();
      setShown(resolved);
      setMotion({ phase: "idle", dir });
      return;
    }

    clearTimers();
    setMotion({ phase: "out", dir });
    timers.current.push(
      window.setTimeout(() => {
        setShown(resolved);
        setMotion({ phase: "in", dir });
        timers.current.push(
          window.setTimeout(() => {
            setMotion({ phase: "idle", dir });
          }, IN_MS)
        );
      }, OUT_MS)
    );
  }

  const normalized = query.trim().toLowerCase();
  const visible = useMemo(
    () => projects.filter((project) => matchesQuery(project, normalized)),
    [projects, normalized]
  );
  const Card = CARD[shown] || HairlineCard;

  return (
    <main className="dashboard">
      <div className="dashboard-head">
        <div>
          <p>Open a listing or start a new one.</p>
        </div>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (creating) return;
            setCreating(true);
            try {
              const { id } = await createProject();
              if (id) (navigate || router.push)(`/app/${id}`);
            } finally {
              setCreating(false);
            }
          }}
        >
          <button className="btn-primary" type="submit" disabled={creating}>
            New listing
          </button>
        </form>
      </div>

      {projects.length ? (
        <div className="projects-toolbar">
          <label className="projects-search">
            <span className="visually-hidden">Search projects</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
            />
          </label>
          <SlideToggle
            className="projects-view"
            ariaLabel="View mode"
            value={view}
            options={[
              { id: "hairline", label: "Hairline" },
              { id: "split", label: "Split" },
              { id: "row", label: "Row" },
            ]}
            onChange={changeView}
          />
        </div>
      ) : null}

      {!projects.length ? (
        <p className="empty-projects">No saved listings yet.</p>
      ) : !visible.length ? (
        <p className="empty-projects">No projects match that search.</p>
      ) : (
        <div className="projects-stage">
          <div
            className={`project-grid is-${shown}${motion.phase === "out" ? " is-out" : ""}${motion.phase === "in" ? " is-in" : ""}`}
            data-dir={String(motion.dir)}
          >
            {visible.map((project) => (
              <Card key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
