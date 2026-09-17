"use client";

import { useState } from "react";
import Link from "next/link";
import { getTheme, themeCssVars } from "@/lib/themes.js";
import "./mobile-temp.css";

const SCREENS = [
  ["landing", "Landing"],
  ["login", "Login"],
  ["projects", "Projects"],
  ["settings", "Settings"],
  ["studio", "Studio"],
];

const PHOTO =
  "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/38dfbae8-4f76-4c65-b4e7-30530dc58047/1312x894.jpg?v=37332dadff0b4b16a6d962c876b326fa";

const ROWS = [
  ["Hayat Townhouses", "Villanova, Dubai", "Just leased", "AED 165,000"],
  ["District One Villas", "MBR City", "Coming soon", "AED 2,500,000"],
  ["Palm Jumeirah", "Palm, Dubai", "Available now", "AED 420,000"],
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

function AppBar({ title, extra, menuOpen, onMenu, mode }) {
  return (
    <header className="mm-bar">
      <div className="mm-bar-start">
        <img src={mode === "dark" ? "/brand/lystly-white.png" : "/brand/lystly-black.png"} alt="Lystly" />
        <h1>{title}</h1>
      </div>
      <div className="mm-bar-end">
        {extra}
        <button type="button" className="mm-menu-btn" aria-expanded={menuOpen} aria-label="Menu" onClick={onMenu}>
          <MenuIcon />
        </button>
      </div>
      {menuOpen ? (
        <div className="mm-menu">
          <button type="button">Projects</button>
          <button type="button">Settings</button>
          <button type="button">Light</button>
          <button type="button">Dark</button>
          <button type="button">Sign out</button>
        </div>
      ) : null}
    </header>
  );
}

function LandingMock() {
  const [preview, setPreview] = useState("listing");
  return (
    <div className="mm-landing">
      <nav className="mm-land-nav">
        <img src="/brand/lystly-white.png" alt="Lystly" />
        <div>
          <span>Log in</span>
          <b>Get started</b>
        </div>
      </nav>
      <div className="mm-land-copy">
        <h1>Listing posts in seconds, not an hour of design.</h1>
        <p>Paste a listing from a major real estate portal in the UAE. Preview the square or brochure, then log in to download.</p>
      </div>
      <div className="mm-land-sticky">
        <input readOnly value="" placeholder="Paste a listing link" />
        <button type="button">Paste</button>
      </div>
      <div className="mm-land-preview">
        <div className="mm-switch" data-index={preview === "brochure" ? "1" : "0"}>
          <b />
          <button type="button" className={preview === "listing" ? "is-on" : undefined} onClick={() => setPreview("listing")}>
            Listing
          </button>
          <button type="button" className={preview === "brochure" ? "is-on" : undefined} onClick={() => setPreview("brochure")}>
            Brochure
          </button>
        </div>
        <div className={`mm-square${preview === "brochure" ? " is-wide" : ""}`}>
          <img src={PHOTO} alt="" />
          <span>JUST LEASED</span>
        </div>
      </div>
    </div>
  );
}

function LoginMock() {
  return (
    <div className="mm-auth">
      <form className="mm-auth-card">
        <img src="/brand/lystly-white.png" alt="Lystly" />
        <h1>Log in</h1>
        <p>Open your saved listing studio projects.</p>
        <label>
          Email
          <input readOnly placeholder="you@agency.com" />
        </label>
        <label>
          Password
          <input readOnly type="password" placeholder="••••••••" />
        </label>
        <button type="button">Log in</button>
        <small>New here? Get started</small>
      </form>
    </div>
  );
}

function ProjectsMock({ mode, menuOpen, onMenu }) {
  return (
    <div className="mm-app" data-mode={mode}>
      <AppBar title="Projects" menuOpen={menuOpen} onMenu={onMenu} mode={mode} />
      <main className="mm-projects">
        <p>Open a listing or start a new one.</p>
        <button type="button" className="mm-solid">
          New listing
        </button>
        <input className="mm-search" readOnly placeholder="Search projects" />
        <ul>
          {ROWS.map(([name, loc, status, price]) => (
            <li key={name}>
              <img src={PHOTO} alt="" />
              <div>
                <strong>{name}</strong>
                <em>{loc}</em>
                <span>
                  {status} · {price}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function SettingsMock({ mode, setMode, menuOpen, onMenu }) {
  return (
    <div className="mm-app" data-mode={mode}>
      <AppBar title="Settings" menuOpen={menuOpen} onMenu={onMenu} mode={mode} />
      <main className="mm-settings">
        <p>White frost only. Light and dark use the same white, grey, and black.</p>
        <div className="mm-mode-well" data-index={mode === "dark" ? "1" : "0"}>
          <b />
          <button type="button" className={mode === "light" ? "is-on" : undefined} onClick={() => setMode("light")}>
            <span className="mm-mode-preview is-light" aria-hidden="true">
              <i />
              <em />
            </span>
            Light
            <small>Grey page, white lids.</small>
          </button>
          <button type="button" className={mode === "dark" ? "is-on" : undefined} onClick={() => setMode("dark")}>
            <span className="mm-mode-preview is-dark" aria-hidden="true">
              <i />
              <em />
            </span>
            Dark
            <small>Black page, grey lids.</small>
          </button>
        </div>
      </main>
    </div>
  );
}

function StudioMock({ mode, menuOpen, onMenu }) {
  const [sheet, setSheet] = useState("open");
  const [preview, setPreview] = useState("listing");
  return (
    <div className="mm-app is-studio" data-mode={mode}>
      <AppBar
        title="Listing Studio"
        extra={<span className="mm-save">Saved</span>}
        menuOpen={menuOpen}
        onMenu={onMenu}
        mode={mode}
      />
      <div className="mm-studio">
        <div className="mm-studio-top">
          <div className="mm-switch is-app" data-index={preview === "brochure" ? "1" : "0"}>
            <b />
            <button type="button" className={preview === "listing" ? "is-on" : undefined} onClick={() => setPreview("listing")}>
              Listing
            </button>
            <button type="button" className={preview === "brochure" ? "is-on" : undefined} onClick={() => setPreview("brochure")}>
              Brochure
            </button>
          </div>
          <button type="button" className="mm-dl" aria-label="Download">
            ↓
          </button>
        </div>
        <div className="mm-studio-preview">
          <div className={`mm-studio-square${preview === "brochure" ? " is-wide" : ""}`}>
            <img src={PHOTO} alt="" />
            <span>JUST LEASED</span>
          </div>
        </div>
        <div className="mm-rail">
          <img src={PHOTO} alt="" />
          <img src={PHOTO} alt="" />
          <img src={PHOTO} alt="" />
          <em>+</em>
        </div>
        <section className={`mm-sheet is-${sheet}`}>
          <button type="button" className="mm-sheet-handle" onClick={() => setSheet(sheet === "open" ? "peek" : "open")}>
            <i />
            Edit listing
          </button>
          {sheet === "open" ? (
            <div className="mm-sheet-body">
              <label>
                Listing link
                <input readOnly placeholder="Paste a listing link" />
              </label>
              <p>Header</p>
              <div className="mm-well">
                <b style={{ transform: "translateX(100%)" }} />
                <span>Coming soon</span>
                <span className="is-on">Available now</span>
              </div>
              <div className="mm-well">
                <b />
                <span className="is-on">Just leased</span>
                <span>Just sold</span>
              </div>
              <p>Photos</p>
              <div className="mm-drop">Drop a property photo</div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function MobileMocks() {
  const [screen, setScreen] = useState("projects");
  const [mode, setMode] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = getTheme("frost", mode);

  return (
    <div className="mm-root">
      <div className="mm-picker">
        {SCREENS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={screen === id ? "is-on" : undefined}
            onClick={() => {
              setScreen(id);
              setMenuOpen(false);
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={mode === "dark" ? "is-on" : undefined}
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        >
          {mode === "dark" ? "Dark" : "Light"}
        </button>
        <Link href="/studio-temp">Studio temp</Link>
      </div>
      <div className="mm-stage" style={screen === "landing" || screen === "login" ? undefined : themeCssVars(theme)}>
        {screen === "landing" ? <LandingMock /> : null}
        {screen === "login" ? <LoginMock /> : null}
        {screen === "projects" ? (
          <ProjectsMock mode={mode} menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
        ) : null}
        {screen === "settings" ? (
          <SettingsMock mode={mode} setMode={setMode} menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
        ) : null}
        {screen === "studio" ? (
          <StudioMock mode={mode} menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
        ) : null}
      </div>
    </div>
  );
}
