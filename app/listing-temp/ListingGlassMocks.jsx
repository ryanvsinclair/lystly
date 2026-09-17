"use client";

import Link from "next/link";
import { useState } from "react";
import { SlideToggle } from "@/components/SlideToggle";
import { photoSrc } from "@/lib/photo-src.js";
import "./listing-temp.css";

const LISTING = {
  propertyName: "District One Villas",
  location: "Mohammed Bin Rashid City, Dubai",
  title: "Exclusive | Corner Villa | Luxury Furnished",
  bedrooms: "6",
  area: "12,397",
  price: "AED 2,500,000",
  priceLabel: "Annual Rent",
  cheques: "1",
  term: "1y+",
  termLabel: "Lease Term",
  photo:
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/38dfbae8-4f76-4c65-b4e7-30530dc58047/1312x894.jpg?v=37332dadff0b4b16a6d962c876b326fa",
};

const BRAND = {
  agencyName: "Your agency",
  agentName: "Daniel Hart",
  phone: "+971 50 918 2746",
  email: "daniel.hart@northshore.ae",
  instagram: "danielhart",
};

const AGENT = "/agents/default-agent.png";

const ICONS = {
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V9.5A1.5 1.5 0 0 1 4.5 8H8a3 3 0 0 1 3 3v1h10v6"/><path d="M3 14h18"/><path d="M5 18v2M19 18v2"/></svg>`,
  area: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 15V9h2.2c1.4 0 2.3.8 2.3 2s-.9 2-2.3 2H9m4.8 4-1.8-4"/></svg>`,
  coins: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/><path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h6"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,
  ig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"/></svg>`,
};

const STATS = [
  { icon: "bed", value: LISTING.bedrooms, label: "Bedrooms" },
  { icon: "area", value: LISTING.area, label: "Sq. Ft." },
  { icon: "coins", value: LISTING.price, label: LISTING.priceLabel },
  { icon: "doc", value: LISTING.cheques, label: "Cheques" },
  { icon: "cal", value: LISTING.term, label: LISTING.termLabel },
];

const DESIGNS = [
  {
    id: "current",
    name: "Current",
    note: "The live square. Frosted bottom sheet, white stats pill, agent standing in the glass.",
  },
  {
    id: "clear",
    name: "Clear dock",
    note: "Same bottom dock, thinner and more see-through, so more of the villa stays visible.",
  },
  {
    id: "smoke",
    name: "Smoke",
    note: "Dark glass and light type. Same geometry as current, for night photos and high-contrast feeds.",
  },
  {
    id: "side",
    name: "Side pane",
    note: "A tall glass column on the right. The photo and agent keep the left half.",
  },
  {
    id: "float",
    name: "Float",
    note: "Headline, stats, and agent as three separate glass tiles instead of one sheet.",
  },
  {
    id: "twin",
    name: "Twin bars",
    note: "A slim status bar at the top and a facts dock at the bottom.",
  },
  {
    id: "ribbon",
    name: "Ribbon",
    note: "Edge-to-edge glass along the bottom. Compact type, more photo above.",
  },
  {
    id: "split",
    name: "Split deck",
    note: "Two glass cards: copy on the left, stats stacked on the right.",
  },
  {
    id: "pills",
    name: "Pills",
    note: "Each fact is its own glass chip. The lightest overlay of the set.",
  },
  {
    id: "editorial",
    name: "Editorial",
    note: "Big status on the photo, small glass caption underneath. Closest to a magazine cover.",
  },
];

const PHOTO = photoSrc(LISTING.photo);

function Icon({ name, className = "lt-ico" }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />;
}

function Glass({ x, y, w, h, radius = 40, tone = "light", blur = 18, className = "", children }) {
  return (
    <div
      className={`lt-glass is-${tone} ${className}`.trim()}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        "--gx": `${x}px`,
        "--gy": `${y}px`,
        "--radius": `${radius}px`,
        "--blur": `${blur}px`,
      }}
    >
      <div className="lt-blur">
        <img alt="" src={PHOTO} />
      </div>
      <div className="lt-frost" />
      <div className="lt-body">{children}</div>
      <div className="lt-glare" />
      <div className="lt-rim" />
    </div>
  );
}

function Headline({ size = "full" }) {
  return (
    <div className={`lt-head is-${size}`}>
      <p className="lt-kicker">JUST</p>
      <p className="lt-status">LEASED</p>
      <p className="lt-pname">{LISTING.propertyName}</p>
      <p className="lt-ploc">{LISTING.location}</p>
      {size === "full" ? <p className="lt-pnote">{LISTING.title}</p> : null}
    </div>
  );
}

function Stats({ kind = "pill" }) {
  return (
    <div className={`lt-stats is-${kind}`}>
      {STATS.map((stat) => (
        <div className="lt-stat" key={stat.label}>
          <Icon name={stat.icon} />
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function AgentRow({ compact = false }) {
  return (
    <div className={`lt-agent-row${compact ? " is-compact" : ""}`}>
      <p className="lt-aname">{BRAND.agentName}</p>
      <div className="lt-contacts">
        <span>
          <Icon name="phone" className="lt-cico" />
          <b>{BRAND.phone}</b>
        </span>
        <span>
          <Icon name="mail" className="lt-cico" />
          <b>{BRAND.email}</b>
        </span>
        {compact ? null : (
          <span>
            <Icon name="ig" className="lt-cico" />
            <b>{BRAND.instagram}</b>
          </span>
        )}
      </div>
    </div>
  );
}

function Brand({ onPhoto = false }) {
  return (
    <div className={`lt-brand${onPhoto ? " is-photo" : ""}`}>
      <span className="lt-brand-name">{BRAND.agencyName}</span>
      <span className="lt-brand-sub">LOGO</span>
    </div>
  );
}

function AgentCutout() {
  return <img className="lt-cutout" alt="" src={AGENT} draggable={false} />;
}

function SquareBody({ design }) {
  if (design === "current") {
    return (
      <>
        <Brand />
        <Glass x={32} y={592} w={1016} h={458} className="is-inset">
          <Headline />
          <Stats kind="pill" />
          <AgentRow />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "clear") {
    return (
      <>
        <Brand onPhoto />
        <Glass x={28} y={708} w={1024} h={344} radius={32} tone="clear" className="is-inset">
          <Headline size="short" />
          <Stats kind="ghost" />
          <AgentRow compact />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "smoke") {
    return (
      <>
        <Brand onPhoto />
        <Glass x={32} y={592} w={1016} h={458} tone="dark" className="is-inset">
          <Headline />
          <Stats kind="ghost" />
          <AgentRow />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "side") {
    return (
      <>
        <Brand onPhoto />
        <Glass x={588} y={48} w={464} h={984} radius={36} className="is-col">
          <Headline />
          <Stats kind="stack" />
          <AgentRow />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "float") {
    return (
      <>
        <Brand onPhoto />
        <Glass x={292} y={548} w={752} h={196} radius={32} className="is-tight">
          <Headline size="short" />
        </Glass>
        <Glass x={292} y={764} w={752} h={148} radius={28}>
          <Stats kind="ghost" />
        </Glass>
        <Glass x={292} y={932} w={752} h={116} radius={28} className="is-tight">
          <AgentRow compact />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "twin") {
    return (
      <>
        <Glass x={32} y={36} w={1016} h={128} radius={28} className="is-bar">
          <div className="lt-twin-top">
            <Brand />
            <div className="lt-head is-bar">
              <p className="lt-kicker">JUST</p>
              <p className="lt-status">LEASED</p>
            </div>
          </div>
        </Glass>
        <Glass x={32} y={708} w={1016} h={344} radius={36} className="is-inset">
          <div className="lt-twin-copy">
            <p className="lt-pname">{LISTING.propertyName}</p>
            <p className="lt-ploc">{LISTING.location}</p>
          </div>
          <Stats kind="ghost" />
          <AgentRow compact />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "ribbon") {
    return (
      <>
        <Brand onPhoto />
        <Glass x={0} y={848} w={1080} h={232} radius={0} blur={22} className="is-ribbon">
          <div className="lt-ribbon">
            <div className="lt-ribbon-copy">
              <p className="lt-kicker">JUST</p>
              <p className="lt-status">LEASED</p>
              <p className="lt-pname">{LISTING.propertyName}</p>
            </div>
            <Stats kind="ghost" />
            <AgentRow compact />
          </div>
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "split") {
    return (
      <>
        <Brand onPhoto />
        <Glass x={292} y={668} w={320} h={384} radius={36} className="is-tight is-split-copy">
          <Headline size="short" />
          <AgentRow compact />
        </Glass>
        <Glass x={628} y={668} w={424} h={384} radius={36} className="is-col">
          <Stats kind="stack" />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  if (design === "pills") {
    return (
      <>
        <Brand onPhoto />
        <div className="lt-photo-head">
          <p className="lt-kicker">JUST</p>
          <p className="lt-status">LEASED</p>
          <p className="lt-pname">{LISTING.propertyName}</p>
        </div>
        {STATS.map((stat, index) => (
          <Glass
            key={stat.label}
            x={292 + index * 154}
            y={880}
            w={146}
            h={168}
            radius={26}
            blur={12}
            className="is-chip"
          >
            <div className="lt-stat is-chip">
              <Icon name={stat.icon} />
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </Glass>
        ))}
        <Glass x={292} y={760} w={760} h={100} radius={24} blur={12} className="is-tight">
          <AgentRow compact />
        </Glass>
        <AgentCutout />
      </>
    );
  }

  return (
    <>
      <Brand onPhoto />
      <div className="lt-editorial">
        <p className="lt-kicker">JUST</p>
        <p className="lt-status">LEASED</p>
        <p className="lt-pname">{LISTING.propertyName}</p>
        <p className="lt-ploc">{LISTING.location}</p>
      </div>
      <Glass x={32} y={868} w={1016} h={180} radius={28} className="is-tight">
        <div className="lt-editorial-dock">
          <Stats kind="ghost" />
          <AgentRow compact />
        </div>
      </Glass>
      <AgentCutout />
    </>
  );
}

function Square({ design, hideBg = false }) {
  return (
    <article className={`lt-sq is-${design}${hideBg ? " is-on-photo" : ""}`}>
      {hideBg ? null : (
        <div className="lt-bg">
          <img alt="" src={PHOTO} />
        </div>
      )}
      <SquareBody design={design} />
    </article>
  );
}

function ListingFrame({ design }) {
  return (
    <div className="lt-frame">
      <Square design={design} />
    </div>
  );
}

function LastFrame({ design }) {
  return (
    <div className="lt-last">
      <div className="lt-last-page">
        <img className="lt-last-photo" alt="" src={PHOTO} />
        <div className="lt-last-hold">
          <Square design={design} hideBg />
        </div>
      </div>
    </div>
  );
}

export function ListingGlassMocks() {
  const [view, setView] = useState("both");
  const [picked, setPicked] = useState("current");

  function pick(id) {
    setPicked(id);
    document.getElementById(`lt-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="lt-page">
      <header className="lt-top">
        <div className="lt-links">
          <Link href="/">Home</Link>
          <Link href="/cards-temp">Project cards</Link>
          <Link href="/glass-temp">App glass</Link>
        </div>
        <h1>Listing templates</h1>
        <p>
          Glass treatments for the Instagram square and the last brochure page — the
          brochure page is the same square, scaled onto the listing photo. The live
          studio is unchanged.
        </p>
        <div className="lt-tools">
          <SlideToggle
            className="lt-view"
            ariaLabel="Preview surface"
            value={view}
            options={[
              { id: "both", label: "Both" },
              { id: "square", label: "Square" },
              { id: "last", label: "Last page" },
            ]}
            onChange={setView}
          />
          <div className="lt-picks">
            {DESIGNS.map((design) => (
              <button
                key={design.id}
                type="button"
                className={design.id === picked ? "is-on" : undefined}
                onClick={() => pick(design.id)}
              >
                {design.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {DESIGNS.map((design) => (
        <section
          className={`lt-section${design.id === picked ? " is-picked" : ""}`}
          id={`lt-${design.id}`}
          key={design.id}
        >
          <button className="lt-section-head" type="button" onClick={() => setPicked(design.id)}>
            <h2>{design.name}</h2>
            <p>{design.note}</p>
          </button>
          <div className={`lt-pair is-${view}`}>
            {view === "last" ? null : (
              <figure>
                <ListingFrame design={design.id} />
                <figcaption>Listing square</figcaption>
              </figure>
            )}
            {view === "square" ? null : (
              <figure>
                <LastFrame design={design.id} />
                <figcaption>Last brochure page</figcaption>
              </figure>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
