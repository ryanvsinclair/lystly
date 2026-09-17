"use client";

import { useEffect, useRef, useState } from "react";
import { SlideToggle } from "@/components/SlideToggle";
import { clampAgentPosition, listingPointerScale } from "@/lib/agent-drag.js";

const ICONS = {
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V9.5A1.5 1.5 0 0 1 4.5 8H8a3 3 0 0 1 3 3v1h10v6"/><path d="M3 14h18"/><path d="M5 18v2M19 18v2"/></svg>`,
  area: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 15V9h2.2c1.4 0 2.3.8 2.3 2s-.9 2-2.3 2H9m4.8 4-1.8-4"/></svg>`,
  coins: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/><path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h6"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,
  ig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m3.8 16.2 4.6-4.6a1.5 1.5 0 0 1 2.1 0L15 16"/><path d="m13.2 14.2 1.6-1.6a1.5 1.5 0 0 1 2.1 0l3.6 3.6"/><circle cx="9" cy="9.2" r="1.2"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.2A1.7 1.7 0 0 1 5.2 6.5H10l2 2h6.8A1.7 1.7 0 0 1 20.5 10v8.3a1.7 1.7 0 0 1-1.7 1.7H5.2A1.7 1.7 0 0 1 3.5 18.3z"/></svg>`,
};

const AGENT_POSES = {
  crossed: {
    src: "/agents/arms-crossed.png?v=5",
    x: -14,
    height: 720,
    scale: 76,
  },
  presenting: {
    src: "/agents/presenting.png?v=5",
    x: -22,
    height: 640,
    scale: 70,
  },
};

const FALLBACK_BRAND = {
  agencyName: "Your agency",
  agentName: "Your name",
  phone: "",
  email: "",
  instagram: "",
  logoUrl: "",
  cutoutUrl: "",
};

const GUEST_CUTOUT = "/agents/default-agent.png";

const GUEST_POSE = {
  src: GUEST_CUTOUT,
  x: 28,
  y: 0,
  height: 720,
  scale: 76,
};

const GUEST_BRAND = {
  agencyName: "Your agency",
  agentName: "Daniel Hart",
  phone: "+971 50 918 2746",
  email: "daniel.hart@northshore.ae",
  instagram: "danielhart",
  logoUrl: "",
  cutoutUrl: GUEST_CUTOUT,
};

function displayBrand(brand) {
  if (!brand) return GUEST_BRAND;
  return {
    agencyName: brand.agencyName || "",
    agentName: brand.agentName || "",
    phone: brand.phone || "",
    email: brand.email || "",
    instagram: brand.instagram || "",
    logoUrl: brand.logoUrl || "",
    cutoutUrl: brand.cutoutUrl || "",
  };
}

const DOWNLOADS = [
  { id: "png", label: "PNG", icon: "image", tip: "Instagram square" },
  { id: "pdf", label: "PDF", icon: "doc", tip: "Brochure" },
  { id: "folder", label: "Folder", icon: "folder", tip: "Image folder" },
];

function Icon({ name }) {
  return <span className="stat-icon" dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />;
}

function ContactIcon({ name }) {
  return <i dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />;
}

function imageFileFromDataTransfer(data) {
  if (!data) return null;
  const items = [...(data.items || [])];
  for (const item of items) {
    if (item.kind === "file" && String(item.type || "").startsWith("image/")) {
      return item.getAsFile();
    }
  }
  return (
    [...(data.files || [])].find((file) => String(file.type || "").startsWith("image/")) ||
    null
  );
}

function isTypingTarget(el) {
  if (!el || el === document.body) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(el.isContentEditable);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function photoSrc(url) {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `/api/pf-image?url=${encodeURIComponent(url)}`;
}

function coverFacts(listing) {
  const facts = [];
  if (listing.bedrooms) {
    facts.push({
      value: listing.bedrooms,
      label: listing.bedrooms === "1" ? "Bedroom" : "Bedrooms",
    });
  }
  if (listing.area) facts.push({ value: listing.area, label: "Sq. Ft." });
  if (listing.cheques) {
    facts.push({
      value: listing.cheques,
      label: listing.cheques === "1" ? "Cheque" : "Cheques",
    });
  }
  if (listing.term) {
    facts.push({ value: listing.term, label: listing.termLabel || "Lease Term" });
  }
  return facts;
}

function landingBrochurePages(listing) {
  const photos = [...new Set([listing.photo, ...(listing.photos || [])].filter(Boolean))].slice(0, 8);
  const extra = photos.slice(1);
  const total = 1 + extra.length + 1;
  return [
    {
      type: "cover",
      caption: "Cover",
      photo: photos[0] || "",
      place: listing.location,
      hook: listing.title,
      price: listing.price,
      facts: coverFacts(listing),
    },
    ...extra.map((photo, index) => ({
      type: "photo",
      caption: `Photo ${index + 2} of ${total}`,
      photo,
      label: listing.propertyName || "Listing",
      page: index + 2,
      total,
    })),
    { type: "listing", caption: "Listing", photo: photos[0] || "" },
  ];
}

function agentLayout(pose, customSrc, pos, { stock = false } = {}) {
  const guestCutout = customSrc === GUEST_CUTOUT;
  const preset = guestCutout ? GUEST_POSE : AGENT_POSES[pose] || AGENT_POSES.crossed;
  const src = customSrc || (stock ? preset.src : "");
  const height =
    (src && (customSrc || pose === "custom") && !guestCutout ? 640 : preset.height) *
    (preset.scale / 100);
  return {
    src,
    pose: customSrc && !guestCutout ? "custom" : guestCutout ? "crossed" : pose,
    x: pos?.x ?? preset.x,
    y: pos?.y ?? preset.y ?? 0,
    height,
  };
}

function ListingSquare({ listing, agent, brand, scale, draggable, onAgentMove }) {
  const listingRef = useRef(null);
  const photo = photoSrc(listing.photo);
  brand = brand || FALLBACK_BRAND;

  function onPointerDown(event) {
    if (!draggable || !onAgentMove) return;
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const img = event.currentTarget;
    const layoutScale = listingPointerScale(listingRef.current);
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = agent.x;
    const originY = agent.y;
    img.classList.add("is-dragging");
    img.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      onAgentMove(
        clampAgentPosition(
          originX + (moveEvent.clientX - startX) / layoutScale,
          originY + (startY - moveEvent.clientY) / layoutScale,
          img.offsetWidth,
          img.offsetHeight
        )
      );
    };
    const onUp = () => {
      img.classList.remove("is-dragging");
      img.removeEventListener("pointermove", onMove);
      img.removeEventListener("pointerup", onUp);
      img.removeEventListener("pointercancel", onUp);
    };
    img.addEventListener("pointermove", onMove);
    img.addEventListener("pointerup", onUp);
    img.addEventListener("pointercancel", onUp);
  }

  return (
    <article
      ref={listingRef}
      className={`listing${agent.src ? ` has-agent pose-${agent.pose}` : ""}${photo ? " has-photo" : ""}`}
      style={scale != null ? { transform: `scale(${scale})` } : undefined}
    >
      <div className="listing-bg">
        <img alt="" src={photo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="} />
        <div className="bg-fallback">Paste a listing link</div>
      </div>
      <div className={`brand${brand.logoUrl ? " has-logo" : " home-brand-placeholder"}`}>
        {brand.logoUrl ? <img className="brand-logo" alt="" src={brand.logoUrl} /> : null}
        <span className="brand-name">{brand.agencyName || FALLBACK_BRAND.agencyName}</span>
        {brand.logoUrl ? null : <span className="brand-sub">LOGO</span>}
      </div>
      <div className="card">
        <div className="card-face">
          <div className="card-blur-clip">
            <img alt="" src={photo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="} />
          </div>
          <div className="card-frost" />
          <div className="card-body">
            <div className="headline">
              <p className="kicker">JUST</p>
              <p className="status">LEASED</p>
              <p className="pname">{listing.propertyName}</p>
              <p className="ploc">{listing.location}</p>
              <p className="pnote">{listing.title}</p>
            </div>
            <div className="stats">
              <div className="stat">
                <Icon name="bed" />
                <strong>{listing.bedrooms}</strong>
                <span>Bedrooms</span>
              </div>
              <div className="stat">
                <Icon name="area" />
                <strong>{listing.area}</strong>
                <span>Sq. Ft.</span>
              </div>
              <div className="stat">
                <Icon name="coins" />
                <strong>{listing.price}</strong>
                <span>{listing.priceLabel || "Annual Rent"}</span>
              </div>
              <div className="stat">
                <Icon name="doc" />
                <strong>{listing.cheques}</strong>
                <span>Cheques</span>
              </div>
              <div className="stat">
                <Icon name="cal" />
                <strong>{listing.term}</strong>
                <span>{listing.termLabel || "Lease Term"}</span>
              </div>
            </div>
            <div className="agent-row">
              <p className="aname">{brand.agentName || FALLBACK_BRAND.agentName}</p>
              <div className="contacts">
                {brand.phone ? (
                  <span>
                    <ContactIcon name="phone" />
                    <b>{brand.phone}</b>
                  </span>
                ) : null}
                {brand.email ? (
                  <span>
                    <ContactIcon name="mail" />
                    <b>{brand.email}</b>
                  </span>
                ) : null}
                {brand.instagram ? (
                  <span>
                    <ContactIcon name="ig" />
                    <b>{brand.instagram}</b>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="card-glare" />
        <div className="card-rim" aria-hidden="true" />
      </div>
      {agent.src ? (
        <img
          className={`agent-cutout${draggable ? " is-draggable" : ""}`}
          alt=""
          src={agent.src}
          style={{ left: `${agent.x}px`, bottom: `${agent.y}px`, height: `${agent.height}px` }}
          draggable={false}
          onPointerDown={onPointerDown}
        />
      ) : null}
    </article>
  );
}

function BrochurePreview({ listing, agent, brand }) {
  brand = brand || FALLBACK_BRAND;
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.68);
  const pages = landingBrochurePages(listing);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const fit = () => setScale(Math.min(wrap.clientWidth, 720) / 720);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="brochure-preview" ref={wrapRef}>
      <div className="brochure-pages">
        {pages.map((page, index) => (
          <figure className="brochure-sheet" key={`${page.type}-${index}`}>
            <div
              className="brochure-scale"
              style={{ width: `${720 * scale}px`, height: `${521 * scale}px` }}
            >
              <div
                className={`brochure-page${page.type === "listing" ? " is-square" : ""}`}
                style={{ transform: `scale(${scale})` }}
              >
                {page.type === "listing" ? (
                  <>
                    <img className="bp-photo" alt="" src={photoSrc(page.photo)} />
                    <div className="bp-listing-hold">
                      <ListingSquare listing={listing} agent={agent} brand={brand} />
                    </div>
                  </>
                ) : (
                  <>
                    <img className="bp-photo" alt="" src={photoSrc(page.photo)} />
                    {page.type === "cover" ? (
                      <>
                        <div className="bp-cover-fade" />
                        <div className="bp-cover-copy">
                          <p className="bp-cover-place">{page.place}</p>
                          {page.hook ? <p className="bp-cover-hook">{page.hook}</p> : null}
                          {page.price ? <p className="bp-cover-price">{page.price}</p> : null}
                          {page.facts?.length ? (
                            <div className="bp-cover-facts">
                              {page.facts.map((fact) => (
                                <span className="bp-cover-fact" key={fact.label}>
                                  <b>{fact.value}</b>
                                  <small>{fact.label}</small>
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <div className="bp-photo-footer">
                        <span>{brand.agencyName || FALLBACK_BRAND.agencyName}</span>
                        <span className="bp-footer-label">{page.label}</span>
                        <span className="bp-footer-page">
                          {page.page} / {page.total}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <figcaption>{page.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function HomePreview({ listing, brand = null, onNeedAuth }) {
  const frameRef = useRef(null);
  const overRef = useRef(false);
  const [mode, setMode] = useState("listing");
  const [scale, setScale] = useState(0.48);
  const [pose, setPose] = useState("crossed");
  const [cutout, setCutout] = useState(brand?.cutoutUrl || "");
  const [agentPos, setAgentPos] = useState({ x: GUEST_POSE.x, y: GUEST_POSE.y });
  const [dropping, setDropping] = useState(false);
  const shownBrand = displayBrand(brand);
  const agentSrc = cutout || shownBrand.cutoutUrl || "";
  const agent = agentLayout(pose, agentSrc, agentPos, {
    stock: !brand && !agentSrc,
  });

  useEffect(() => {
    if (brand?.cutoutUrl) setCutout(brand.cutoutUrl);
  }, [brand?.cutoutUrl]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || mode !== "listing") return;
    const fit = () => {
      const size = Math.min(frame.clientWidth, frame.clientHeight || frame.clientWidth);
      setScale(size / 1080);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [mode]);

  async function applyCutout(file) {
    if (!file || !String(file.type || "").startsWith("image/")) return false;
    const dataUrl = await fileToDataUrl(file);
    setCutout(dataUrl);
    setPose("custom");
    setAgentPos({ x: AGENT_POSES.crossed.x, y: 0 });
    return true;
  }

  useEffect(() => {
    function onPaste(event) {
      if (isTypingTarget(event.target) || !overRef.current) return;
      const file = imageFileFromDataTransfer(event.clipboardData);
      if (!file) return;
      event.preventDefault();
      applyCutout(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  function askToDownload(kind) {
    try {
      window.sessionStorage.setItem("lystly.download", kind);
      window.sessionStorage.setItem("lystly.listing", JSON.stringify(listing));
    } catch {
      /* ignore quota */
    }
    if (onNeedAuth) onNeedAuth("/login");
    else window.location.assign("/login");
  }

  return (
    <div
      className="home-preview"
      onMouseEnter={() => {
        overRef.current = true;
      }}
      onMouseLeave={() => {
        overRef.current = false;
      }}
    >
      <div className="home-preview-bar">
        <SlideToggle
          className="home-preview-switch"
          ariaLabel="Preview mode"
          tablist
          value={mode}
          options={[
            { id: "listing", label: "Listing" },
            { id: "brochure", label: "Brochure" },
          ]}
          onChange={setMode}
        />
        <div className="home-preview-downloads">
          {DOWNLOADS.map((item) => (
            <button
              key={item.id}
              type="button"
              title={`${item.tip} · log in to download`}
              aria-label={`Download ${item.tip}. Log in to continue.`}
              onClick={() => askToDownload(item.id)}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS[item.icon] }} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`preview-wrap home-preview-wrap${mode === "brochure" ? " is-brochure" : ""}`}
        onDragOver={(event) => {
          if (!imageFileFromDataTransfer(event.dataTransfer)) return;
          event.preventDefault();
          setDropping(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          setDropping(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDropping(false);
          applyCutout(imageFileFromDataTransfer(event.dataTransfer));
        }}
      >
        {mode === "listing" ? (
          <div
            className={`preview-frame${dropping ? " is-drop-target" : ""}`}
            ref={frameRef}
            role="img"
            aria-label="Listing preview. Drop or paste an agent cutout."
          >
            <ListingSquare
              listing={listing}
              agent={agent}
              brand={shownBrand}
              scale={scale}
              draggable={Boolean(brand) || Boolean(cutout)}
              onAgentMove={setAgentPos}
            />
            <div className="home-preview-info">
              <button type="button" aria-label="How to add an agent cutout">
                i
              </button>
              <p>Drop or paste a transparent PNG to try your cutout.</p>
            </div>
          </div>
        ) : (
          <BrochurePreview listing={listing} agent={agent} brand={shownBrand} />
        )}
      </div>
    </div>
  );
}
