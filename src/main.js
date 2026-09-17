import "./styles.css";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { clampAgentPosition, listingPointerScale } from "@/lib/agent-drag.js";
import { unsupportedListingMessage } from "@/lib/listing-sites.js";
import { brochurePagePlan, buildBrochurePdf, filenameFrom, photoSrc } from "./brochure.js";

const ICONS = {
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V9.5A1.5 1.5 0 0 1 4.5 8H8a3 3 0 0 1 3 3v1h10v6"/><path d="M3 14h18"/><path d="M5 18v2M19 18v2"/></svg>`,
  area: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 15V9h2.2c1.4 0 2.3.8 2.3 2s-.9 2-2.3 2H9m4.8 4-1.8-4"/></svg>`,
  coins: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/><path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h6"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,
  ig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.2" cy="9.8" r="1.35"/><path d="m4.2 16.6 4.8-4.8 3.2 3.2 2.6-2.6 4.8 4.4"/></svg>`,
  page: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 10h6M9 14h6"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 8.4A1.8 1.8 0 0 1 5 6.6h4.1l1.7 1.9H19a1.8 1.8 0 0 1 1.8 1.8v7.3A1.8 1.8 0 0 1 19 19.4H5a1.8 1.8 0 0 1-1.8-1.8z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M5 19h14"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 5 5 9-10"/></svg>`,
};

const MAX_POSES = 4;
const POSE_BASE_HEIGHT = 700;
const POSE_START_X = 8;
// Projects saved before the numbered pose inventory stored these names.
const LEGACY_POSES = { crossed: 1, presenting: 2 };

let listing;
let bgImage;
let bgBlur;
let agentImage;
let previewWrap;
let previewFrame;
let brochurePreview;
let brochurePages;
let brochureEmpty;
let previewSwitch;
let posePicker;
let statusPicker;
let templatePicker;
let comingSoonDateInput;
let comingSoonGroup;
let availableOnLabel;
let agentScaleInput;
let agentPosX = POSE_START_X;
let agentPosY = 0;
let studioHooks = {};

const HEADLINES = {
  "coming-soon": { kicker: "COMING", status: "SOON" },
  "available-on": { kicker: "AVAILABLE ON", status: "ON" },
  "available-now": { kicker: "AVAILABLE", status: "NOW" },
  "just-leased": { kicker: "JUST", status: "LEASED" },
  "just-sold": { kicker: "JUST", status: "SOLD" },
};

const LAYOUT_SIZE = 1080;
const EXPORT_SIZE = 4000;
const EXPORT_RATIO = EXPORT_SIZE / LAYOUT_SIZE;
const BROCHURE_W = 720;
const BROCHURE_H = 521;

const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

let propertyUrl = "";
let propertyObjectUrl = "";
let agentUrl = "";
let activePose = 1;
let poseUrls = new Array(MAX_POSES).fill("");
let lastListing = null;
let photoPos = "50";
let brandAgencyName = "";
let brandAgentName = "";
let brandPhone = "";
let brandEmail = "";
let brandInstagram = "";
let brandCutoutUrl = "";
const PROFILE_FIELDS = ["agentName", "phone", "email", "instagram"];
let colorTarget = null;
let coverPlaceOverride = "";
let featuresOverride = "";
let previewMode = "listing";
let pointerOverPreview = false;
let activeHeadline = "just-leased";
let activeTemplate = "dock";
let brochurePhotoOrder = [];
let listingPhotoSource = "";

const TEMPLATES = ["dock", "editorial", "twin", "side"];

const TEXT_FONTS = [
  { id: "montserrat", family: "var(--font-montserrat), Montserrat, sans-serif" },
  { id: "outfit", family: "var(--font-outfit), Outfit, sans-serif" },
  { id: "playfair", family: "var(--font-playfair), 'Playfair Display', serif" },
  { id: "fraunces", family: "var(--font-fraunces), Fraunces, serif" },
];

let textColorInput;
let colorSwatches;
let studioPanel;
let panelEditor;
let textEditorValue;
let textSizeInput;
let textSizeValue;
let textFonts;
let studioAbort = new AbortController();
const studioObservers = [];

function listen(el, type, handler, options) {
  if (!el) return;
  el.addEventListener(type, handler, { ...options, signal: studioAbort.signal });
}

function resetStudioBindings() {
  studioAbort.abort();
  studioAbort = new AbortController();
  while (studioObservers.length) studioObservers.pop().disconnect();
}

function observeSize(el, handler) {
  if (!el) return;
  const observer = new ResizeObserver(handler);
  observer.observe(el);
  studioObservers.push(observer);
}

function bindDom() {
  listing = document.getElementById("listing");
  bgImage = document.getElementById("bgImage");
  bgBlur = document.getElementById("bgBlur");
  agentImage = document.getElementById("agentImage");
  previewWrap = document.getElementById("previewWrap");
  previewFrame = document.getElementById("previewFrame");
  brochurePreview = document.getElementById("brochurePreview");
  brochurePages = document.getElementById("brochurePages");
  brochureEmpty = document.getElementById("brochureEmpty");
  previewSwitch = document.getElementById("previewSwitch");
  posePicker = document.getElementById("posePicker");
  statusPicker = document.getElementById("statusPicker");
  templatePicker = document.getElementById("templatePicker");
  comingSoonDateInput = document.getElementById("comingSoonDate");
  comingSoonGroup = document.getElementById("comingSoonGroup");
  availableOnLabel = document.getElementById("availableOnLabel");
  agentScaleInput = document.getElementById("agentScale");
  textColorInput = document.getElementById("textColor");
  colorSwatches = document.getElementById("colorSwatches");
  studioPanel = document.getElementById("studioPanel");
  panelEditor = document.getElementById("panelEditor");
  textEditorValue = document.getElementById("textEditorValue");
  textSizeInput = document.getElementById("textSize");
  textSizeValue = document.getElementById("textSizeValue");
  textFonts = document.getElementById("textFonts");
}

function hasRealSrc(img) {
  const src = img.getAttribute("src");
  return Boolean(src) && src !== PLACEHOLDER;
}

function mountIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = ICONS[el.dataset.icon] || "";
  });
}

// The frame is a grid item in #previewWrap. Its own track is the only definite
// box we can trust, so size the square from the track instead of viewport math.
function previewTrack() {
  if (!previewWrap) return null;
  const cs = getComputedStyle(previewWrap);
  const width = parseFloat(cs.gridTemplateColumns);
  const height = parseFloat(cs.gridTemplateRows);
  if (!width || !height) return null;
  return { width, height };
}

function scalePreview() {
  if (!previewFrame || !listing) return;
  const track = previewTrack();
  if (track) {
    const size = Math.max(160, Math.min(track.width, track.height, 1080));
    previewFrame.style.width = `${size}px`;
    previewFrame.style.height = `${size}px`;
  }
  const used = previewFrame.clientWidth || 480;
  listing.style.transform = `scale(${used / 1080})`;
  listing.style.transformOrigin = "top left";
}

function scaleBrochurePages() {
  if (previewMode !== "brochure") return;
  const available = brochurePreview.clientWidth;
  if (!available) return;
  const column = Math.min(available, BROCHURE_W);
  brochurePages.querySelectorAll(".brochure-scale").forEach((slot) => {
    const page = slot.querySelector(".brochure-page");
    const scale = column / BROCHURE_W;
    slot.style.width = `${BROCHURE_W * scale}px`;
    slot.style.height = `${BROCHURE_H * scale}px`;
    if (page) page.style.transform = `scale(${scale})`;
  });
}

function textEl(tag, className, text) {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  return el;
}

function makeEditable(el, field, label) {
  el.classList.add("is-edit");
  el.contentEditable = "true";
  el.spellcheck = false;
  if (field) el.dataset.field = field;
  if (label) el.dataset.colorLabel = label;
  return el;
}

function fieldKey(el) {
  return el?.dataset?.field || el?.id || "";
}

function syncField(field, value, source) {
  if (!field) return;
  if (field === "coverPlace") coverPlaceOverride = value;
  if (field === "features") featuresOverride = value;
  if (field === "furnished") {
    lastListing = { ...(lastListing || {}), furnished: value };
  }
  const listingEl = document.getElementById(field);
  if (listingEl && listingEl !== source) listingEl.textContent = value;
  brochurePages.querySelectorAll(`[data-field="${field}"]`).forEach((node) => {
    if (node !== source) node.textContent = value;
  });
}

function photoEl(src, className = "bp-photo") {
  const img = document.createElement("img");
  img.className = className;
  img.alt = "";
  img.src = photoSrc(src);
  return img;
}

function listingClone() {
  const clone = listing.cloneNode(true);
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((el) => {
    if (el.classList.contains("is-edit")) el.dataset.field = el.id;
    el.removeAttribute("id");
  });
  clone.querySelectorAll(".is-color-target").forEach((el) => {
    el.classList.remove("is-color-target");
  });
  clone.querySelectorAll(".agent-cutout").forEach((img) => {
    delete img.dataset.dragBound;
  });
  // The brochure page centres the clone with its own scale and origin.
  clone.style.removeProperty("transform");
  clone.style.removeProperty("transform-origin");
  return clone;
}

function renderBrochurePage(page) {
  const sheet = document.createElement("figure");
  sheet.className = "brochure-sheet";
  const slot = document.createElement("div");
  slot.className = "brochure-scale";
  const frame = document.createElement("div");
  frame.className = "brochure-page";
  if (page.photo) frame.append(photoEl(page.photo));

  if (page.type === "cover") {
    frame.append(Object.assign(document.createElement("div"), { className: "bp-cover-fade" }));
    const copy = document.createElement("div");
    copy.className = "bp-cover-copy";
    copy.append(makeEditable(textEl("p", "bp-cover-place", page.place), "coverPlace", "Cover location"));
    if (page.hook) {
      copy.append(makeEditable(textEl("p", "bp-cover-hook", page.hook), "note", "Hook"));
    }
    if (page.price) {
      copy.append(makeEditable(textEl("p", "bp-cover-price", page.price), "stat2Value", "Price"));
    }
    if (page.facts?.length) {
      const facts = document.createElement("div");
      facts.className = "bp-cover-facts";
      page.facts.forEach((fact) => {
        const item = document.createElement("span");
        item.className = "bp-cover-fact";
        item.append(makeEditable(textEl("b", "", fact.value), fact.field, fact.label));
        item.append(makeEditable(textEl("small", "", fact.label), fact.labelField, fact.label));
        facts.append(item);
      });
      copy.append(facts);
    }
    frame.append(copy);
  }

  if (page.type === "photo") {
    const footer = document.createElement("div");
    footer.className = "bp-photo-footer";
    footer.append(textEl("span", "", brandAgencyName));
    footer.append(makeEditable(textEl("span", "bp-footer-label", page.label), "propertyName", "Property name"));
    footer.append(textEl("span", "bp-footer-page", `${page.page} / ${page.total}`));
    frame.append(footer);
  }

  if (page.type === "listing") {
    frame.classList.add("is-square");
    const hold = document.createElement("div");
    hold.className = "bp-listing-hold";
    hold.append(listingClone());
    frame.append(hold);
  }

  slot.append(frame);
  const caption = textEl("figcaption", "", page.caption);
  if (page.photo && page.type !== "listing") {
    sheet.classList.add("is-sortable");
    sheet.draggable = true;
    sheet.dataset.photo = page.photo;
  }
  sheet.append(slot, caption);
  return sheet;
}

function refreshBrochureListingPage() {
  const hold = brochurePages.querySelector(".brochure-page.is-square .bp-listing-hold");
  if (!hold) {
    renderBrochurePreview();
    return;
  }
  hold.replaceChildren(listingClone());
  bindBrochureAgentDrag();
  if (colorTarget && !document.contains(colorTarget)) {
    const field = fieldKey(colorTarget);
    const next = field && hold.querySelector(`[data-field="${field}"]`);
    if (next) openTextEditor(next);
    else colorTarget = null;
  }
}

function renderBrochurePreview() {
  const { photos, pages } = brochurePagePlan(brochureData(lastListing || {}));
  const top = brochurePreview?.scrollTop || 0;
  brochurePages.replaceChildren();
  if (!photos.length) {
    brochurePreview.classList.add("is-empty");
    brochureEmpty.textContent = "Paste a listing link to preview the brochure.";
    renderBrochureGallery();
    return;
  }
  brochurePreview.classList.remove("is-empty");
  brochurePages.append(...pages.map(renderBrochurePage));
  bindBrochureDrag();
  bindBrochureAgentDrag();
  renderBrochureGallery();
  scaleBrochurePages();
  brochurePreview.scrollTop = top;
}

function orderBrochurePhotos(urls) {
  const remaining = [...urls];
  const ordered = [];
  for (const url of brochurePhotoOrder) {
    const index = remaining.indexOf(url);
    if (index === -1) continue;
    ordered.push(remaining.splice(index, 1)[0]);
  }
  return [...ordered, ...remaining];
}

function reorderBrochurePhoto(fromUrl, toUrl, after) {
  if (!fromUrl || !toUrl || fromUrl === toUrl) return;
  const photos = orderBrochurePhotos(brochureData(lastListing || {}).photos);
  const from = photos.indexOf(fromUrl);
  let to = photos.indexOf(toUrl);
  if (from < 0 || to < 0) return;
  const [moved] = photos.splice(from, 1);
  if (from < to) to -= 1;
  photos.splice(after ? to + 1 : to, 0, moved);
  brochurePhotoOrder = photos;
  renderBrochurePreview();
  studioHooks.onChange?.();
}

function bindBrochureDrag() {
  brochurePages.querySelectorAll(".brochure-sheet.is-sortable").forEach((sheet) => {
    sheet.addEventListener("pointerdown", (e) => {
      sheet.draggable = !e.target.closest(".is-edit");
    });
    sheet.addEventListener("dragstart", (e) => {
      if (!sheet.draggable) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData("text/plain", sheet.dataset.photo || "");
      e.dataTransfer.effectAllowed = "move";
      sheet.classList.add("is-dragging");
    });
    sheet.addEventListener("dragend", () => {
      sheet.classList.remove("is-dragging");
      brochurePages.querySelectorAll(".drop-before, .drop-after").forEach((node) => {
        node.classList.remove("drop-before", "drop-after");
      });
    });
    sheet.addEventListener("dragover", (e) => {
      e.preventDefault();
      const box = sheet.getBoundingClientRect();
      const after = e.clientY > box.top + box.height / 2;
      sheet.classList.toggle("drop-after", after);
      sheet.classList.toggle("drop-before", !after);
    });
    sheet.addEventListener("dragleave", (e) => {
      if (sheet.contains(e.relatedTarget)) return;
      sheet.classList.remove("drop-before", "drop-after");
    });
    sheet.addEventListener("drop", (e) => {
      e.preventDefault();
      const box = sheet.getBoundingClientRect();
      const after = e.clientY > box.top + box.height / 2;
      sheet.classList.remove("drop-before", "drop-after");
      reorderBrochurePhoto(e.dataTransfer.getData("text/plain"), sheet.dataset.photo, after);
    });
  });
}

function setPreviewPaneState(el, active) {
  if (!el) return;
  el.hidden = false;
  el.setAttribute("aria-hidden", String(!active));
  el.inert = !active;
}

function setPreviewMode(mode, options = {}) {
  previewMode = mode === "brochure" ? "brochure" : "listing";
  const isBrochure = previewMode === "brochure";
  if (options.instant) previewWrap.classList.add("is-instant");
  previewWrap.classList.toggle("is-brochure", isBrochure);
  setPreviewPaneState(previewFrame, !isBrochure);
  setPreviewPaneState(brochurePreview, isBrochure);
  previewSwitch?.querySelectorAll("[data-preview]").forEach((btn) => {
    const active = btn.dataset.preview === previewMode;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  if (previewSwitch) syncSlideLids(previewSwitch);
  renderListingGallery();
  if (isBrochure) renderBrochurePreview();
  else renderBrochureGallery();
  requestAnimationFrame(() => {
    if (isBrochure) scaleBrochurePages();
    else scalePreview();
    if (options.instant) previewWrap.classList.remove("is-instant");
  });
}

function fieldValue(id) {
  return (document.getElementById(id)?.textContent || "").trim();
}

function setField(id, value) {
  if (value == null || value === "") return;
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = String(value);
}

function applyBrandContacts() {
  if (brandAgentName) setField("agentName", brandAgentName);
  if (brandPhone) setField("phone", brandPhone);
  if (brandEmail) setField("email", brandEmail);
  if (brandInstagram) setField("instagram", brandInstagram);
}

function rgbToHex(value) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
  const match = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return "#081d56";
  return `#${[match[1], match[2], match[3]]
    .map((part) => Number(part).toString(16).padStart(2, "0"))
    .join("")}`;
}

function currentTextColor(el) {
  return rgbToHex(getComputedStyle(el).color);
}

function markActiveSwatch(hex) {
  colorSwatches?.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.classList.toggle("is-active", swatch.dataset.color === hex);
  });
}

function selectColorTarget(el) {
  if (!el || !el.classList.contains("is-edit")) return;
  colorTarget = el;
  document.querySelectorAll(".is-edit.is-color-target").forEach((node) => {
    node.classList.remove("is-color-target");
  });
  el.classList.add("is-color-target");
  const hex = currentTextColor(el);
  textColorInput.disabled = false;
  textColorInput.value = hex;
  markActiveSwatch(hex);
}

function fieldTargets(field, fallback) {
  if (!field) return fallback ? [fallback] : [];
  return [...document.querySelectorAll(`[id="${field}"], [data-field="${field}"]`)];
}

function applyTextColor(hex) {
  if (!colorTarget || !hex) return;
  const field = fieldKey(colorTarget);
  const targets = fieldTargets(field, colorTarget);
  targets.forEach((node) => {
    node.style.color = hex;
  });
  textColorInput.value = hex;
  markActiveSwatch(hex);
}

function currentFontId(el) {
  const family = getComputedStyle(el).fontFamily.toLowerCase();
  if (family.includes("playfair")) return "playfair";
  if (family.includes("fraunces")) return "fraunces";
  if (family.includes("outfit")) return "outfit";
  return "montserrat";
}

function syncSlideLids(root = document) {
  const wells = [...root.querySelectorAll(".slide-well")];
  if (root.classList?.contains("slide-well")) wells.unshift(root);
  wells.forEach((well) => {
    const options = [...well.children].filter((el) => el.matches("button") && !el.hidden);
    const index = options.findIndex((el) => el.classList.contains("is-active"));
    well.dataset.index = String(index);
    const lid = well.querySelector(":scope > .slide-lid");
    if (lid) lid.hidden = index < 0;
  });
}

function markActiveFont(id) {
  textFonts?.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.font === id);
  });
  if (textFonts) syncSlideLids(textFonts);
}

function applyTextSize(px) {
  if (!colorTarget || !px) return;
  const size = `${Math.round(Number(px))}px`;
  fieldTargets(fieldKey(colorTarget), colorTarget).forEach((node) => {
    node.style.fontSize = size;
  });
  if (textSizeInput) textSizeInput.value = String(Math.round(Number(px)));
  if (textSizeValue) textSizeValue.textContent = String(Math.round(Number(px)));
}

function applyTextFont(id) {
  if (!colorTarget || !id) return;
  const font = TEXT_FONTS.find((item) => item.id === id);
  if (!font) return;
  fieldTargets(fieldKey(colorTarget), colorTarget).forEach((node) => {
    node.style.fontFamily = font.family;
  });
  markActiveFont(id);
}

function syncEditorFromTarget() {
  if (!colorTarget) return;
  if (textEditorValue && document.activeElement !== textEditorValue) {
    textEditorValue.value = colorTarget.textContent || "";
  }
  const size = Math.round(parseFloat(getComputedStyle(colorTarget).fontSize) || 24);
  if (textSizeInput) textSizeInput.value = String(size);
  if (textSizeValue) textSizeValue.textContent = String(size);
  markActiveFont(currentFontId(colorTarget));
}

function openTextEditor(el) {
  selectColorTarget(el);
  if (!studioPanel) return;
  studioPanel.classList.add("is-editing");
  panelEditor?.setAttribute("aria-hidden", "false");
  syncEditorFromTarget();
}

function closeTextEditor() {
  studioPanel?.classList.remove("is-editing");
  panelEditor?.setAttribute("aria-hidden", "true");
  document.querySelectorAll(".is-edit.is-color-target").forEach((node) => {
    node.classList.remove("is-color-target");
  });
  if (document.activeElement?.closest?.(".is-edit")) {
    document.activeElement.blur();
  }
  colorTarget = null;
  if (textColorInput) textColorInput.disabled = true;
}

function formatComingDate(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHeadlineDate(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  const monthName = new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    month: "short",
  });
  return `${monthName} ${day}`.toUpperCase();
}

function updateComingDateDisplay() {
  const el = document.getElementById("comingDate");
  const formatted = formatComingDate(comingSoonDateInput.value);
  const headlineDate = formatHeadlineDate(comingSoonDateInput.value);
  availableOnLabel.textContent = formatted ? `Available on ${formatted}` : "Available on";
  if (activeHeadline === "available-on") {
    setField("justWord", "AVAILABLE ON");
    setField("statusWord", headlineDate || "ON");
  }
  if (el) {
    el.textContent = formatted;
    el.hidden = true;
  }
  brochurePages.querySelectorAll('[data-field="comingDate"]').forEach((node) => {
    node.textContent = formatted;
    node.hidden = true;
  });
}

function setHeadline(key) {
  const preset = HEADLINES[key];
  if (!preset) return;
  activeHeadline = key;
  setField("justWord", preset.kicker);
  setField("statusWord", preset.status);
  listing.classList.toggle("is-available-on", key === "available-on");
  const comingMode = key === "coming-soon" || key === "available-on";
  comingSoonGroup?.classList.toggle("is-split", comingMode);
  const availableOn = statusPicker?.querySelector('[data-status="available-on"]');
  const availableNow = statusPicker?.querySelector('[data-status="available-now"]');
  if (availableOn) availableOn.hidden = !comingMode;
  if (availableNow) availableNow.hidden = comingMode;
  statusPicker?.querySelectorAll(".status-card").forEach((card) => {
    const on = card.dataset.status === key;
    card.classList.toggle("is-active", on);
    card.setAttribute("aria-pressed", on ? "true" : "false");
  });
  updateComingDateDisplay();
  if (previewMode === "brochure") refreshBrochureListingPage();
  if (key === "available-on") {
    comingSoonDateInput.focus();
    comingSoonDateInput.showPicker?.();
  }
  if (statusPicker) syncSlideLids(statusPicker);
}

function proxiedPhoto(url) {
  return `/api/pf-image?url=${encodeURIComponent(url)}`;
}

function displayPhoto(url) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")) {
    return url;
  }
  return proxiedPhoto(url);
}

function setPfStatus(message, isError = false) {
  const status = document.getElementById("pfStatus");
  status.hidden = !message;
  status.classList.toggle("is-error", isError);
  status.textContent = message || "";
}

async function fetchListing(rawUrl) {
  const response = await fetch(
    `/api/pf?url=${encodeURIComponent(rawUrl.trim())}`
  );
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "Could not read listing.");
  lastListing = { ...payload.listing, _url: rawUrl.trim() };
  return lastListing;
}

function applyListingToForm(listingData) {
  setField("propertyName", listingData.propertyName);
  setField("location", listingData.location);
  setField("note", listingData.title);
  setField("stat0Value", listingData.bedrooms);
  setField("stat1Value", listingData.area);
  setField("stat2Value", listingData.price);
  setField("stat2Label", listingData.priceLabel);
  setField("stat3Value", listingData.cheques);
  setField("stat4Value", listingData.term);
  setField("stat4Label", listingData.termLabel);
  applyBrandContacts();
  if (listingData.photo) {
    listingPhotoSource = listingData.photo;
    setPhoto(displayPhoto(listingData.photo));
    document.getElementById("propertyFileName").textContent = listingData.sourceLabel
      ? `From ${listingData.sourceLabel}`
      : "From listing";
  }
  renderListingGallery();
}

function brochureData(listing = {}) {
  const amenities = Array.isArray(listing.amenities) ? listing.amenities : [];
  const rawPhotos = Array.isArray(listing.photos) && listing.photos.length
    ? listing.photos
    : propertyUrl
      ? [propertyUrl]
      : [];
  const photos = orderBrochurePhotos(rawPhotos);
  return {
    propertyName: fieldValue("propertyName") || listing.propertyName || "",
    cluster: listing.cluster || fieldValue("propertyName") || listing.propertyName || "",
    community:
      listing.community ||
      String(fieldValue("location") || listing.location || "")
        .split(",")
        .map((part) => part.trim())
        .find((part) => part && !/dubai/i.test(part)) ||
      "",
    location: fieldValue("location") || listing.location || "",
    price: fieldValue("stat2Value") || listing.price || "",
    priceLabel: fieldValue("stat2Label") || listing.priceLabel || "",
    bedrooms: fieldValue("stat0Value") || listing.bedrooms || "",
    bathrooms: listing.bathrooms || "",
    area: fieldValue("stat1Value") || listing.area || "",
    plotArea: listing.plotArea || "",
    cheques: fieldValue("stat3Value") || listing.cheques || "",
    term: fieldValue("stat4Value") || listing.term || "",
    termLabel: fieldValue("stat4Label") || listing.termLabel || "Lease Term",
    title: fieldValue("note") || listing.title || "",
    agentName: fieldValue("agentName") || brandAgentName || "",
    email: fieldValue("email") || brandEmail || "",
    phone: fieldValue("phone") || brandPhone || "",
    instagram: fieldValue("instagram") || brandInstagram || "",
    agencyName: brandAgencyName,
    photos,
    propertyType: listing.propertyType || "",
    furnished: listing.furnished || "",
    amenities,
    maid: amenities.some((item) => /maid/i.test(item)),
    coverPlace: coverPlaceOverride,
    featuresText: featuresOverride,
    status: HEADLINES[activeHeadline]?.status || "LEASED",
    availableOn: formatComingDate(comingSoonDateInput.value),
  };
}

function rejectUnsupportedLink(rawUrl) {
  const message = unsupportedListingMessage(rawUrl);
  if (!message) return false;
  const input = document.getElementById("pfUrl");
  if (input) input.value = "";
  setPfStatus(message, true);
  return true;
}

async function fillFromPropertyFinder(rawUrl) {
  if (rejectUnsupportedLink(rawUrl)) return;
  const pasteBtn = document.getElementById("pfPaste");
  if (pasteBtn) pasteBtn.disabled = true;
  setPfStatus("Reading listing…");

  try {
    const listingData = await fetchListing(rawUrl);
    coverPlaceOverride = "";
    featuresOverride = "";
    brochurePhotoOrder = [];
    applyListingToForm(listingData);

    const photoCount = listingData.photos?.length || 0;
    setPfStatus(
      photoCount ? `Listing filled · ${photoCount} photos` : "Listing filled."
    );
    if (previewMode === "brochure") renderBrochurePreview();
    studioHooks.onChange?.();
  } catch (err) {
    setPfStatus(err.message || "Could not read that listing.", true);
  } finally {
    if (pasteBtn) pasteBtn.disabled = false;
  }
}

async function pastePropertyFinderLink() {
  const input = document.getElementById("pfUrl");
  try {
    const text = (await navigator.clipboard.readText()).trim();
    if (!text) {
      setPfStatus("Clipboard is empty.", true);
      return;
    }
    input.value = text;
    await fillFromPropertyFinder(text);
  } catch {
    input.focus();
    input.select();
    setPfStatus("Clipboard blocked. Paste the link into the field.", true);
  }
}

function setPhoto(url) {
  propertyUrl = url && url !== PLACEHOLDER ? url : "";
  const src = propertyUrl || PLACEHOLDER;
  bgImage.src = src;
  document.querySelectorAll("#bgBlur, #bgBlurTop").forEach((img) => {
    img.src = src;
  });
  listing.classList.toggle("has-photo", Boolean(propertyUrl));
}

function listingGalleryPhotos() {
  const photos = lastListing?.photos;
  return Array.isArray(photos) ? [...new Set(photos.filter(Boolean))] : [];
}

function listingPhotoIsActive(url) {
  return (
    listingPhotoSource === url ||
    propertyUrl === url ||
    propertyUrl === proxiedPhoto(url) ||
    propertyUrl === photoSrc(url)
  );
}

function syncGalleryLayout() {
  previewWrap?.classList.add("has-gallery");
  const listingRail = document.getElementById("listingGallery");
  const brochureRail = document.getElementById("brochureGallery");
  setPreviewPaneState(listingRail, previewMode === "listing");
  setPreviewPaneState(brochureRail, previewMode === "brochure");
}

function renderBrochureGallery() {
  const rail = document.getElementById("brochureGallery");
  const list = document.getElementById("brochureGalleryList");
  if (!rail || !list) return;
  const photos = brochurePagePlan(brochureData(lastListing || {})).photos;
  const show = previewMode === "brochure";
  if (!show) {
    syncGalleryLayout();
    return;
  }

  list.replaceChildren(
    ...photos.map((url, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "listing-gallery-item is-sortable";
      btn.draggable = true;
      btn.dataset.photo = url;
      btn.setAttribute("aria-label", index === 0 ? "Cover photo" : `Photo ${index + 1}`);
      const img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      img.src = photoSrc(url);
      btn.append(img);
      if (index === 0) {
        const badge = document.createElement("span");
        badge.className = "listing-gallery-badge";
        badge.textContent = "Cover";
        btn.append(badge);
      }
      let dragged = false;
      btn.addEventListener("click", () => {
        if (dragged) {
          dragged = false;
          return;
        }
        scrollBrochureToPhoto(index);
      });
      btn.addEventListener("dragstart", (event) => {
        dragged = true;
        event.dataTransfer.setData("text/plain", url);
        event.dataTransfer.effectAllowed = "move";
        btn.classList.add("is-dragging");
      });
      btn.addEventListener("dragend", () => {
        btn.classList.remove("is-dragging");
        list.querySelectorAll(".drop-before, .drop-after").forEach((node) => {
          node.classList.remove("drop-before", "drop-after");
        });
      });
      btn.addEventListener("dragover", (event) => {
        event.preventDefault();
        const box = btn.getBoundingClientRect();
        const after = event.clientY > box.top + box.height / 2;
        btn.classList.toggle("drop-after", after);
        btn.classList.toggle("drop-before", !after);
      });
      btn.addEventListener("dragleave", (event) => {
        if (btn.contains(event.relatedTarget)) return;
        btn.classList.remove("drop-before", "drop-after");
      });
      btn.addEventListener("drop", (event) => {
        event.preventDefault();
        const box = btn.getBoundingClientRect();
        const after = event.clientY > box.top + box.height / 2;
        btn.classList.remove("drop-before", "drop-after");
        reorderBrochurePhoto(event.dataTransfer.getData("text/plain"), url, after);
      });
      return wrapGalleryThumb(btn, url);
    })
  );
  syncGalleryLayout();
}

function scrollBrochureToPhoto(index) {
  const sheets = [...brochurePages.querySelectorAll(".brochure-sheet.is-sortable")];
  sheets[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderListingGallery() {
  const rail = document.getElementById("listingGallery");
  const list = document.getElementById("listingGalleryList");
  const photos = listingGalleryPhotos();
  const show = previewMode === "listing";
  if (!show) {
    syncGalleryLayout();
    return;
  }
  list.replaceChildren(
    ...photos.map((url, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "listing-gallery-item";
      if (listingPhotoIsActive(url)) btn.classList.add("is-active");
      btn.setAttribute("aria-label", `Use photo ${index + 1}`);
      const img = document.createElement("img");
      img.alt = "";
      img.src = photoSrc(url);
      btn.append(img);
      btn.addEventListener("click", () => {
        listingPhotoSource = url;
        setPhoto(displayPhoto(url));
        document.getElementById("propertyFileName").textContent = `Photo ${index + 1}`;
        renderListingGallery();
        studioHooks.onChange?.();
      });
      return wrapGalleryThumb(btn, url);
    })
  );
  syncGalleryLayout();
  scalePreview();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function compressPhotoDataUrl(dataUrl, maxEdge = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#cfe0f5";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Could not read that photo."));
    img.src = dataUrl;
  });
}

function setListingPhotos(photos) {
  const next = [...new Set((photos || []).filter(Boolean))];
  lastListing = { ...(lastListing || {}), photos: next };
  if (!next.includes(lastListing.photo)) lastListing.photo = next[0] || "";
  brochurePhotoOrder = orderBrochurePhotos(next);
}

function refreshGalleries() {
  renderListingGallery();
  if (previewMode === "brochure") renderBrochurePreview();
}

function galleryRemoveControl(url) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "listing-gallery-remove";
  btn.setAttribute("aria-label", "Remove photo");
  btn.innerHTML = `
    <span class="listing-gallery-remove-icon listing-gallery-remove-x" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </span>
    <span class="listing-gallery-remove-icon listing-gallery-remove-check" aria-hidden="true">${ICONS.check}</span>
  `;
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (btn.classList.contains("is-confirm")) {
      removeGalleryPhoto(url);
      return;
    }
    btn.classList.add("is-confirm");
    btn.setAttribute("aria-label", "Confirm remove photo");
  });
  return btn;
}

function wrapGalleryThumb(item, url) {
  const wrap = document.createElement("div");
  wrap.className = "listing-gallery-thumb";
  wrap.append(item, galleryRemoveControl(url));
  wrap.addEventListener("mouseleave", () => {
    const remove = wrap.querySelector(".listing-gallery-remove");
    if (!remove) return;
    remove.classList.remove("is-confirm");
    remove.setAttribute("aria-label", "Remove photo");
  });
  return wrap;
}

function setGalleryAddBusy(busy) {
  document.querySelectorAll(".listing-gallery-add").forEach((el) => {
    el.classList.toggle("is-busy", busy);
    const label = [...el.querySelectorAll("span")].find(
      (node) => !node.classList.contains("listing-gallery-add-plus")
    );
    if (label) label.textContent = busy ? "Adding…" : "Add photo";
  });
}

function isImageFile(file) {
  if (!file) return false;
  if (String(file.type || "").startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|heic|heif|avif|bmp)$/i.test(file.name || "");
}

function isEmbeddedPhoto(url) {
  return typeof url === "string" && url.startsWith("data:image") && url.length > 256;
}

async function persistGalleryPhoto(file) {
  const dataUrl = await fileToDataUrl(file);
  try {
    return await compressPhotoDataUrl(dataUrl);
  } catch {
    return dataUrl;
  }
}

async function persistLocalPhoto(file) {
  return persistGalleryPhoto(file);
}

async function shrinkEmbeddedPhoto(url) {
  if (!isEmbeddedPhoto(url) || url.length <= 400000) return url;
  try {
    return await compressPhotoDataUrl(url);
  } catch {
    return url;
  }
}

async function replaceEmbeddedPhotos(value) {
  if (typeof value === "string") return shrinkEmbeddedPhoto(value);
  if (Array.isArray(value)) {
    return Promise.all(value.map(replaceEmbeddedPhotos));
  }
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = await replaceEmbeddedPhotos(child);
    }
    return next;
  }
  return value;
}

async function attachGalleryPhotos(files) {
  const images = [...(files || [])].filter(isImageFile);
  if (!images.length) return;
  setGalleryAddBusy(true);
  try {
    const next = listingGalleryPhotos();
    let added = 0;
    for (const file of images) {
      const url = await persistLocalPhoto(file);
      if (!url || next.includes(url)) continue;
      next.push(url);
      added += 1;
      if (added === 1 && !hasRealSrc(bgImage)) {
        listingPhotoSource = url;
        setPhoto(displayPhoto(url));
        const name = document.getElementById("propertyFileName");
        if (name) name.textContent = file.name || "Added photo";
      }
    }
    if (!added) return;
    setListingPhotos(next);
    refreshGalleries();
    if (previewMode === "brochure") {
      const sheets = brochurePages?.querySelectorAll(".brochure-sheet");
      sheets?.[sheets.length - 1]?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    studioHooks.onChange?.();
  } catch (err) {
    setPfStatus(err.message || "Could not add that photo.", true);
  } finally {
    setGalleryAddBusy(false);
  }
}

function removeGalleryPhoto(url) {
  if (!url) return;
  const wasActive = listingPhotoIsActive(url);
  setListingPhotos(listingGalleryPhotos().filter((photo) => photo !== url));
  if (wasActive) {
    const next = listingGalleryPhotos()[0] || "";
    listingPhotoSource = next;
    setPhoto(next ? displayPhoto(next) : PLACEHOLDER);
    const name = document.getElementById("propertyFileName");
    if (name) name.textContent = next ? "Listing photo" : "No photo";
  }
  refreshGalleries();
  studioHooks.onChange?.();
}

function bindGalleryAddInput(add, input) {
  if (!add || !input) return;
  const fresh = input.cloneNode(true);
  fresh.disabled = false;
  fresh.value = "";
  input.replaceWith(fresh);
  fresh.addEventListener("change", async () => {
    const files = [...(fresh.files || [])];
    bindGalleryAddInput(add, fresh);
    await attachGalleryPhotos(files);
  });
}

function bindGalleryAdds() {
  ["listingGallery", "brochureGallery"].forEach((id) => {
    const rail = document.getElementById(id);
    const add = rail?.querySelector(".listing-gallery-add");
    const input = add?.querySelector("input");
    if (!add || !input || add.dataset.bound) return;
    add.dataset.bound = "true";
    bindGalleryAddInput(add, input);
    add.addEventListener("dragover", (event) => {
      event.preventDefault();
      add.classList.add("is-over");
    });
    add.addEventListener("dragleave", () => add.classList.remove("is-over"));
    add.addEventListener("drop", async (event) => {
      event.preventDefault();
      add.classList.remove("is-over");
      await attachGalleryPhotos(imageFilesFromDataTransfer(event.dataTransfer));
    });
  });
}

async function urlToDataUrl(url) {
  if (!url || url === PLACEHOLDER || url.startsWith("data:")) return url;
  const response = await fetch(url);
  const blob = await response.blob();
  return fileToDataUrl(blob);
}

async function applyPropertyFile(file, label = "Pasted photo") {
  if (!file || !isImageFile(file)) return false;
  try {
    const url = await persistLocalPhoto(file);
    if (propertyObjectUrl) {
      URL.revokeObjectURL(propertyObjectUrl);
      propertyObjectUrl = "";
    }
    listingPhotoSource = url;
    setPhoto(url);
    const name = document.getElementById("propertyFileName");
    if (name) name.textContent = label || file.name || "Pasted photo";
    const photos = listingGalleryPhotos();
    if (url && !photos.includes(url)) {
      setListingPhotos([url, ...photos]);
      refreshGalleries();
    }
    studioHooks.onChange?.();
    return true;
  } catch (err) {
    setPfStatus(err.message || "Could not add that photo.", true);
    return false;
  }
}

function imageFilesFromDataTransfer(data) {
  if (!data) return [];
  const fromItems = [];
  for (const item of data.items || []) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (isImageFile(file)) fromItems.push(file);
  }
  if (fromItems.length) return fromItems;
  return [...(data.files || [])].filter(isImageFile);
}

function imageFileFromDataTransfer(data) {
  return imageFilesFromDataTransfer(data)[0] || null;
}

function isTypingTarget(el) {
  if (!el || el === document.body) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(el.isContentEditable);
}

async function useClipboardImage(event) {
  const files = imageFilesFromDataTransfer(event.clipboardData);
  if (!files.length) return false;
  event.preventDefault();
  if (previewMode === "brochure" && !pointerOverPreview) {
    await attachGalleryPhotos(files);
    return true;
  }
  await applyPropertyFile(
    files[0],
    files[0].name && files[0].name !== "image.png" ? files[0].name : "Pasted photo"
  );
  previewFrame.classList.remove("is-drop-target");
  return true;
}

function setAgent(url, pose = activePose) {
  if (!listing || !agentImage) return;
  agentUrl = url;
  activePose = poseSlot(pose);
  listing.classList.toggle("has-agent", Boolean(url));
  listing.classList.remove("pose-crossed", "pose-presenting");
  listing.classList.toggle("pose-custom", Boolean(url));
  if (!url) {
    agentImage.src = PLACEHOLDER;
    agentImage.hidden = true;
    applyAgentLayout();
    return;
  }
  agentImage.src = url;
  agentImage.hidden = false;
  applyAgentLayout();
  // The image may have been hidden when drag was first bound, so bind on reveal.
  bindAgentDrag();
}

function poseSlot(value) {
  const slot = LEGACY_POSES[value] || Number(value);
  return Number.isInteger(slot) && slot >= 1 && slot <= MAX_POSES ? slot : 1;
}

function firstFilledPose() {
  const index = poseUrls.findIndex(Boolean);
  return index < 0 ? 1 : index + 1;
}

function paintPoseThumbs() {
  posePicker?.querySelectorAll(".pose-card").forEach((card) => {
    const url = poseUrls[poseSlot(card.dataset.pose) - 1] || "";
    const img = card.querySelector("img");
    card.classList.toggle("is-filled", Boolean(url));
    card.classList.toggle("is-empty", !url);
    const slot = card.dataset.pose;
    card.setAttribute("aria-label", url ? `Pose ${slot}` : `Add pose ${slot}`);
    if (!img) return;
    if (url) {
      img.src = url;
      img.hidden = false;
    } else {
      img.removeAttribute("src");
      img.hidden = true;
    }
  });
}

function markActivePose() {
  posePicker?.querySelectorAll(".pose-card").forEach((card) => {
    const on = poseSlot(card.dataset.pose) === activePose && Boolean(poseUrls[activePose - 1]);
    card.classList.toggle("is-active", on);
    card.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if (posePicker) syncSlideLids(posePicker);
}

function setPose(pose) {
  const slot = poseSlot(pose);
  const url = poseUrls[slot - 1] || "";
  if (!url) return;
  activePose = slot;
  brandCutoutUrl = url;
  setAgent(url, slot);
  markActivePose();
  if (previewMode === "brochure") refreshBrochureListingPage();
}

function setPoseStatus(message, isError = false) {
  const el = document.getElementById("poseStatus");
  if (!el) return;
  el.textContent = message || "";
  el.hidden = !message;
  el.classList.toggle("is-error", Boolean(isError));
}

async function uploadPose(slot, file) {
  if (!file || !studioHooks.onUploadPose) return;
  const card = posePicker?.querySelector(`.pose-card[data-pose="${slot}"]`);
  card?.classList.add("is-busy");
  setPoseStatus("Adding pose…");
  try {
    const url = await studioHooks.onUploadPose(slot, file);
    if (!url) throw new Error("Could not add that pose.");
    poseUrls[slot - 1] = url;
    paintPoseThumbs();
    setPose(slot);
    setPoseStatus("");
    studioHooks.onChange?.();
  } catch (err) {
    setPoseStatus(err.message || "Could not add that pose.", true);
  } finally {
    card?.classList.remove("is-busy");
  }
}

function wireDrop(dropId, inputId, onFile, nameId) {
  const drop = document.getElementById(dropId);
  const input = document.getElementById(inputId);
  const name = document.getElementById(nameId);

  const handle = async (file) => {
    if (!file) return;
    onFile(await fileToDataUrl(file));
    name.textContent = file.name;
  };

  listen(input, "change", () => handle(input.files[0]));
  listen(drop, "dragover", (e) => {
    e.preventDefault();
    drop.classList.add("over");
  });
  listen(drop, "dragleave", () => drop.classList.remove("over"));
  listen(drop, "drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    handle(e.dataTransfer.files[0]);
  });
}

function applyPhotoPosition(value) {
  photoPos = String(value ?? "50");
  const pos = `center ${photoPos}%`;
  bgImage.style.objectPosition = pos;
  document.querySelectorAll("#bgBlur, #bgBlurTop").forEach((img) => {
    img.style.objectPosition = pos;
  });
}

function setTemplate(id) {
  const key = TEMPLATES.includes(id) ? id : "dock";
  activeTemplate = key;
  if (!listing) return;
  TEMPLATES.forEach((name) => {
    listing.classList.toggle(`is-tpl-${name}`, name === key);
  });
  listing.dataset.template = key;
  templatePicker?.querySelectorAll("[data-template]").forEach((btn) => {
    const on = btn.dataset.template === key;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if (templatePicker) syncSlideLids(templatePicker);
  if (previewMode === "brochure") refreshBrochureListingPage();
}

function applyAgentLayout() {
  const scale = Number(agentScaleInput?.value || 76) / 100;
  const left = `${agentPosX}px`;
  const bottom = `${agentPosY}px`;
  const height = `${POSE_BASE_HEIGHT * scale}px`;
  document.querySelectorAll(".listing .agent-cutout").forEach((img) => {
    img.style.left = left;
    img.style.bottom = bottom;
    img.style.height = height;
  });
}

function bindAgentDragOn(img) {
  if (!img || img.hidden || img.dataset.dragBound) return;
  img.dataset.dragBound = "true";
  img.classList.add("is-draggable");
  img.draggable = false;
  img.addEventListener("dragstart", (event) => event.preventDefault());

  img.addEventListener("pointerdown", (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const host = img.closest(".listing") || listing;
    const layoutScale = listingPointerScale(host);
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = agentPosX;
    const originY = agentPosY;
    img.classList.add("is-dragging");
    img.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const next = clampAgentPosition(
        originX + (moveEvent.clientX - startX) / layoutScale,
        originY + (startY - moveEvent.clientY) / layoutScale,
        img.offsetWidth,
        img.offsetHeight
      );
      agentPosX = Math.round(next.x);
      agentPosY = Math.round(next.y);
      applyAgentLayout();
    };

    const onUp = () => {
      img.classList.remove("is-dragging");
      img.removeEventListener("pointermove", onMove);
      img.removeEventListener("pointerup", onUp);
      img.removeEventListener("pointercancel", onUp);
      studioHooks.onChange?.();
    };

    img.addEventListener("pointermove", onMove);
    img.addEventListener("pointerup", onUp);
    img.addEventListener("pointercancel", onUp);
  });
}

function bindAgentDrag() {
  bindAgentDragOn(agentImage);
  bindBrochureAgentDrag();
}

function bindBrochureAgentDrag() {
  brochurePages?.querySelectorAll(".bp-listing-hold .agent-cutout").forEach(bindAgentDragOn);
}

const captureImageOptions = {
  cacheBust: true,
  includeQueryParams: true,
  imagePlaceholder: PLACEHOLDER,
  onImageErrorHandler: () => undefined,
};

async function toPngSafe(node, options) {
  const opts = { ...captureImageOptions, ...options };
  try {
    return await toPng(node, opts);
  } catch {
    return await toPng(node, { ...opts, skipFonts: true });
  }
}

async function withInlinedImages(root, run) {
  const originals = [...root.querySelectorAll("img")].map((img) => [
    img,
    img.getAttribute("src"),
  ]);
  try {
    await inlineCloneImages(root);
    return await run();
  } finally {
    originals.forEach(([img, src]) => {
      if (src != null) img.setAttribute("src", src);
    });
  }
}

async function captureListingPng(pixelRatio = EXPORT_RATIO, extra = {}) {
  const exportOptions = {
    width: LAYOUT_SIZE,
    height: LAYOUT_SIZE,
    pixelRatio,
    backgroundColor: extra.backgroundColor,
    style: {
      transform: "none",
      transformOrigin: "top left",
      width: `${LAYOUT_SIZE}px`,
      height: `${LAYOUT_SIZE}px`,
      ...(extra.background ? { background: extra.background } : {}),
    },
  };

  const offscreen = previewMode === "brochure";
  if (offscreen) {
    previewFrame.style.position = "fixed";
    previewFrame.style.left = "-2000px";
    previewFrame.style.top = "0";
    previewFrame.style.opacity = "0";
    previewFrame.style.pointerEvents = "none";
  }

  document.activeElement?.blur?.();
  listing.classList.add("is-exporting");

  try {
    await document.fonts.ready;
    // Export the agent exactly where it was dragged; the listing clips overflow.
    return await withInlinedImages(listing, () => toPngSafe(listing, exportOptions));
  } finally {
    listing.classList.remove("is-exporting");
    if (offscreen) {
      previewFrame.style.position = "";
      previewFrame.style.left = "";
      previewFrame.style.top = "";
      previewFrame.style.opacity = "";
      previewFrame.style.pointerEvents = "";
    }
    if (previewMode === "listing") scalePreview();
  }
}

async function downloadPng() {
  const status = document.getElementById("downloadStatus");
  setDownloadBusy(true);
  status.hidden = false;
  status.classList.remove("is-error");
  status.textContent = "Rendering image…";

  try {
    const dataUrl = await captureListingPng();
    const name = fieldValue("propertyName") || "listing";
    const statusWord = fieldValue("statusWord") || "listing";
    const link = document.createElement("a");
    link.download = `${statusWord.toLowerCase()}-${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
    status.classList.remove("is-error");
    status.textContent = "Saved.";
  } catch (err) {
    console.error(err);
    status.classList.add("is-error");
    status.textContent = "Could not export. Try another photo and download again.";
  } finally {
    closeDownloadMenu();
    setDownloadBusy(false);
  }
}

function forceUppercase(el) {
  const start = el.textContent;
  const next = start.toUpperCase();
  if (start === next) return;
  el.textContent = next;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function bindStudioEvents() {
listen(listing, "focusin", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) openTextEditor(el);
});
listen(listing, "pointerdown", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) openTextEditor(el);
});
listen(brochurePreview, "focusin", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) openTextEditor(el);
});
listen(brochurePreview, "pointerdown", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) openTextEditor(el);
});
listen(textColorInput, "input", (e) => {
  applyTextColor(e.currentTarget.value);
});
listen(colorSwatches, "click", (e) => {
  const swatch = e.target.closest(".color-swatch");
  if (!swatch || !colorTarget) return;
  applyTextColor(swatch.dataset.color);
});
listen(textSizeInput, "input", (e) => {
  applyTextSize(e.currentTarget.value);
  studioHooks.onChange?.();
});
listen(textFonts, "click", (e) => {
  const btn = e.target.closest("[data-font]");
  if (!btn || !colorTarget) return;
  applyTextFont(btn.dataset.font);
  studioHooks.onChange?.();
});
listen(textEditorValue, "input", () => {
  if (!colorTarget) return;
  const field = fieldKey(colorTarget);
  const value = textEditorValue.value;
  if (field === "justWord" || field === "statusWord") {
    colorTarget.textContent = value.toUpperCase();
    if (textEditorValue.value !== colorTarget.textContent) {
      textEditorValue.value = colorTarget.textContent;
    }
  } else {
    colorTarget.textContent = value;
  }
  if (field) syncField(field, colorTarget.textContent, colorTarget);
});
listen(document, "pointerdown", (e) => {
  if (!studioPanel?.classList.contains("is-editing")) return;
  if (e.target.closest(".is-edit") || e.target.closest("#panelEditor")) return;
  closeTextEditor();
});
listen(document, "keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!studioPanel?.classList.contains("is-editing")) return;
  closeTextEditor();
});

listen(listing, "input", (e) => {
  const el = e.target.closest(".is-edit");
  if (!el) return;
  if (el.matches("#justWord, #statusWord")) forceUppercase(el);
  if (colorTarget && (el === colorTarget || fieldKey(el) === fieldKey(colorTarget))) {
    syncEditorFromTarget();
  }
});
listen(brochurePreview, "input", (e) => {
  const el = e.target.closest(".is-edit");
  if (!el) return;
  const field = fieldKey(el);
  if (field === "justWord" || field === "statusWord" || el.id === "justWord" || el.id === "statusWord") {
    forceUppercase(el);
  }
  if (field) syncField(field, el.textContent, el);
});

listen(listing, "keydown", (e) => {
  if (e.key !== "Enter" || !e.target.closest("[contenteditable]")) return;
  e.preventDefault();
  e.target.blur();
});
listen(brochurePreview, "keydown", (e) => {
  if (e.key !== "Enter" || !e.target.closest("[contenteditable]")) return;
  if (e.target.closest("[data-field=\"features\"]")) return;
  e.preventDefault();
  e.target.blur();
});

wireDrop("propertyDrop", "propertyInput", setPhoto, "propertyFileName");
wireDrop(
  "agentDrop",
  "agentInput",
  (url) => {
    brandCutoutUrl = url;
    setAgent(url, activePose);
    posePicker?.querySelectorAll(".pose-card").forEach((card) => {
      card.classList.remove("is-active");
      card.setAttribute("aria-pressed", "false");
    });
    if (posePicker) syncSlideLids(posePicker);
  },
  "agentFileName"
);

listen(posePicker, "click", (e) => {
  const card = e.target.closest(".pose-card");
  if (!card) return;
  const slot = poseSlot(card.dataset.pose);
  // An empty slot is the "add a pose" button; a filled one just selects it.
  if (poseUrls[slot - 1]) {
    setPose(slot);
    studioHooks.onChange?.();
    return;
  }
  const input = document.getElementById("poseInput");
  if (!input) return;
  input.dataset.slot = String(slot);
  input.value = "";
  input.click();
});
listen(document.getElementById("poseInput"), "change", (e) => {
  const input = e.currentTarget;
  const slot = poseSlot(input.dataset.slot);
  const file = input.files?.[0];
  input.value = "";
  uploadPose(slot, file);
});
listen(statusPicker, "click", (e) => {
  if (e.target.closest(".coming-soon-date")) return;
  const card = e.target.closest(".status-card");
  if (!card) return;
  setHeadline(card.dataset.status);
});
listen(templatePicker, "click", (e) => {
  const btn = e.target.closest("[data-template]");
  if (!btn) return;
  setTemplate(btn.dataset.template);
  studioHooks.onChange?.();
});
listen(comingSoonDateInput, "pointerdown", (e) => {
  e.stopPropagation();
  if (activeHeadline !== "available-on") setHeadline("available-on");
});
listen(comingSoonDateInput, "change", () => {
  if (activeHeadline !== "available-on") setHeadline("available-on");
  else updateComingDateDisplay();
  if (previewMode === "brochure") refreshBrochureListingPage();
});
listen(previewSwitch, "click", (e) => {
  const btn = e.target.closest("[data-preview]");
  if (!btn || btn.dataset.preview === previewMode) return;
  setPreviewMode(btn.dataset.preview);
});

listen(agentScaleInput, "input", applyAgentLayout);
bindAgentDrag();
bindGalleryAdds();
}

function downloadButtons() {
  return [
    document.getElementById("downloadBtn"),
    document.getElementById("brochureBtn"),
    document.getElementById("brochureImagesBtn"),
  ].filter(Boolean);
}

function stageDownloads() {
  return document.getElementById("stageDownloads");
}

function downloadLaunch() {
  return document.getElementById("downloadLaunch");
}

function setDownloadBusy(busy) {
  const launch = downloadLaunch();
  if (launch) launch.disabled = busy;
  downloadButtons().forEach((btn) => {
    btn.disabled = busy;
  });
}

const downloadActions = [
  {
    id: "downloadBtn",
    label: "Download PNG",
    run: downloadPng,
  },
  {
    id: "brochureBtn",
    label: "Download PDF brochure",
    run: downloadBrochure,
  },
  {
    id: "brochureImagesBtn",
    label: "Download image folder",
    run: downloadBrochureImages,
  },
];

let armedDownloadId = "";

function setDownloadStep(step) {
  const root = stageDownloads();
  const launch = downloadLaunch();
  const stack = document.getElementById("downloadStack");
  if (root) root.dataset.step = step;
  if (launch) launch.setAttribute("aria-expanded", step === "closed" ? "false" : "true");
  if (stack) stack.setAttribute("aria-hidden", step === "closed" ? "true" : "false");
  downloadActions.forEach((action) => {
    const btn = document.getElementById(action.id);
    if (!btn) return;
    const hide = step === "closed" || (step === "armed" && action.id !== armedDownloadId);
    btn.tabIndex = hide ? -1 : 0;
  });
}

function closeDownloadMenu() {
  armedDownloadId = "";
  downloadActions.forEach((action) => {
    const btn = document.getElementById(action.id);
    const tile = btn?.closest(".download-tile");
    btn?.classList.remove("is-confirm");
    tile?.classList.remove("is-armed");
    btn?.setAttribute("aria-label", action.label);
  });
  setDownloadStep("closed");
}

function setDownloadArmed(id) {
  armedDownloadId = id || "";
  downloadActions.forEach((action) => {
    const btn = document.getElementById(action.id);
    const tile = btn?.closest(".download-tile");
    const armed = action.id === armedDownloadId;
    btn?.classList.toggle("is-confirm", armed);
    tile?.classList.toggle("is-armed", armed);
    btn?.setAttribute("aria-label", armed ? `Confirm download: ${action.label}` : action.label);
  });
  const root = stageDownloads();
  if (root && root.dataset.step !== "closed") {
    setDownloadStep(armedDownloadId ? "armed" : "open");
  }
}

function requestDownload(action) {
  if (armedDownloadId !== action.id) {
    setDownloadArmed(action.id);
    return;
  }
  action.run();
}

async function prepareBrochureData(status) {
  const url = document.getElementById("pfUrl").value.trim();
  if (url && lastListing?._url !== url) {
    status.textContent = "Reading listing photos…";
    applyListingToForm(await fetchListing(url));
  }
  const data = brochureData(lastListing || {});
  if (!data.photos.length) {
    throw new Error("Paste a listing link first so we can pull the photos.");
  }
  return data;
}

function sizeBrochurePagesNative() {
  brochurePages.querySelectorAll(".brochure-scale").forEach((slot) => {
    slot.style.width = `${BROCHURE_W}px`;
    slot.style.height = `${BROCHURE_H}px`;
    const page = slot.querySelector(".brochure-page");
    if (page) page.style.transform = "none";
  });
}

function brochureErrorMessage(err) {
  if (!err) return "Could not build the brochure.";
  if (typeof err === "string" && err.trim()) return err;
  if (err.message) return err.message;
  return "Could not build the brochure.";
}

async function inlineCloneImages(root) {
  await Promise.all(
    [...root.querySelectorAll("img")].map(async (img) => {
      const src = img.getAttribute("src") || "";
      if (!src || src === PLACEHOLDER || src.startsWith("data:")) return;
      try {
        img.src = await urlToDataUrl(src);
        await img.decode?.().catch(() => undefined);
      } catch {
        img.src = PLACEHOLDER;
      }
    })
  );
}

async function captureBrochurePage(pageEl) {
  const options = {
    width: BROCHURE_W,
    height: BROCHURE_H,
    pixelRatio: 2,
    style: {
      transform: "none",
      transformOrigin: "top left",
      width: `${BROCHURE_W}px`,
      height: `${BROCHURE_H}px`,
    },
  };
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-8000px;top:0;width:${BROCHURE_W}px;height:${BROCHURE_H}px;overflow:hidden;`;
  const clone = pageEl.cloneNode(true);
  clone.style.transform = "none";
  clone.style.position = "relative";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = `${BROCHURE_W}px`;
  clone.style.height = `${BROCHURE_H}px`;
  const listingEl = clone.querySelector(".listing");
  if (listingEl) {
    listingEl.classList.add("is-exporting");
    listingEl.style.transform = `scale(${BROCHURE_H / LAYOUT_SIZE})`;
    listingEl.style.transformOrigin = "top center";
    listingEl.style.top = "0";
    listingEl.style.marginTop = "0";
    listingEl.style.overflow = "hidden";
  }
  host.append(clone);
  document.body.append(host);
  try {
    await document.fonts.ready;
    await inlineCloneImages(clone);
    return await toPngSafe(clone, options);
  } catch (err) {
    throw new Error(brochureErrorMessage(err));
  } finally {
    host.remove();
  }
}

function loadCaptureImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load a listing photo."));
    img.src = src;
  });
}

async function captureBrochureListingImage() {
  const page = brochurePages.querySelector(".brochure-page.is-square");
  const photoSrcValue =
    page?.querySelector(".bp-photo")?.currentSrc ||
    page?.querySelector(".bp-photo")?.src ||
    propertyUrl;
  const bg = listing.querySelector(".listing-bg");
  const prevDisplay = bg ? bg.style.display : "";
  if (bg) bg.style.display = "none";
  try {
    const overlayUrl = await captureListingPng(2, {
      backgroundColor: null,
      background: "transparent",
    });
    const canvas = document.createElement("canvas");
    const px = 2;
    canvas.width = BROCHURE_W * px;
    canvas.height = BROCHURE_H * px;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#081d56";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (photoSrcValue && photoSrcValue !== PLACEHOLDER) {
      try {
        const photo = await loadCaptureImage(photoSrcValue);
        const cover = Math.max(canvas.width / photo.naturalWidth, canvas.height / photo.naturalHeight);
        const dw = photo.naturalWidth * cover;
        const dh = photo.naturalHeight * cover;
        ctx.drawImage(photo, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
      } catch {
        /* keep the navy fill */
      }
    }
    const overlay = await loadCaptureImage(overlayUrl);
    const side = canvas.height;
    ctx.drawImage(overlay, (canvas.width - side) / 2, 0, side, side);
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn(err);
    return "";
  } finally {
    if (bg) bg.style.display = prevDisplay;
  }
}

async function downloadBrochure() {
  const status = document.getElementById("downloadStatus");
  setDownloadBusy(true);
  status.hidden = false;
  status.classList.remove("is-error");
  status.textContent = "Preparing brochure…";

  const wasBrochure = previewMode === "brochure";
  try {
    const data = await prepareBrochureData(status);
    renderBrochurePreview();
    brochurePreview.style.position = "fixed";
    brochurePreview.style.left = "-4000px";
    brochurePreview.style.top = "0";
    brochurePreview.style.opacity = "0";
    brochurePreview.style.pointerEvents = "none";
    sizeBrochurePagesNative();
    status.textContent = "Capturing listing page…";
    let listingImage = "";
    try {
      listingImage = await captureBrochureListingImage();
    } catch (err) {
      console.warn(err);
    }
    await buildBrochurePdf(data, (message) => {
      status.textContent = message;
    }, listingImage);
    status.classList.remove("is-error");
    status.textContent = "Brochure saved.";
  } catch (err) {
    console.error(err);
    status.classList.add("is-error");
    status.textContent = brochureErrorMessage(err);
  } finally {
    brochurePreview.style.position = "";
    brochurePreview.style.left = "";
    brochurePreview.style.top = "";
    brochurePreview.style.opacity = "";
    brochurePreview.style.pointerEvents = "";
    if (wasBrochure) scaleBrochurePages();
    closeDownloadMenu();
    setDownloadBusy(false);
  }
}

async function downloadBrochureImages() {
  const status = document.getElementById("downloadStatus");
  setDownloadBusy(true);
  status.hidden = false;
  status.classList.remove("is-error");
  status.textContent = "Preparing images…";

  const wasBrochure = previewMode === "brochure";
  try {
    const data = await prepareBrochureData(status);
    renderBrochurePreview();
    brochurePreview.style.position = "fixed";
    brochurePreview.style.left = "-4000px";
    brochurePreview.style.top = "0";
    brochurePreview.style.opacity = "0";
    brochurePreview.style.pointerEvents = "none";
    sizeBrochurePagesNative();

    const pages = [...brochurePages.querySelectorAll(".brochure-page")];
    if (!pages.length) throw new Error("Could not build the brochure pages.");

    const zip = new JSZip();
    const stem = filenameFrom(data).replace(/\.pdf$/i, "");
    const folder = zip.folder(stem);
    const pad = String(pages.length).length;

    for (let i = 0; i < pages.length; i += 1) {
      const page = pages[i];
      const caption = (
        page.closest(".brochure-sheet")?.querySelector("figcaption")?.textContent ||
        `Page ${i + 1}`
      ).replace(/[\\/:*?"<>|]+/g, "-");
      status.textContent = `Capturing ${caption}…`;
      const dataUrl = await captureBrochurePage(page);
      const blob = await (await fetch(dataUrl)).blob();
      folder.file(`${String(i + 1).padStart(pad, "0")} ${caption}.png`, blob);
    }

    status.textContent = "Packing folder…";
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = `${stem}.zip`;
    link.href = URL.createObjectURL(zipBlob);
    link.click();
    URL.revokeObjectURL(link.href);
    status.classList.remove("is-error");
    status.textContent = "Image folder saved.";
  } catch (err) {
    console.error(err);
    status.classList.add("is-error");
    status.textContent = brochureErrorMessage(err);
  } finally {
    brochurePreview.style.position = "";
    brochurePreview.style.left = "";
    brochurePreview.style.top = "";
    brochurePreview.style.opacity = "";
    brochurePreview.style.pointerEvents = "";
    if (wasBrochure) scaleBrochurePages();
    closeDownloadMenu();
    setDownloadBusy(false);
  }
}

function bindDownloadEvents() {
downloadActions.forEach((action) => {
  listen(document.getElementById(action.id), "click", () => {
    requestDownload(action);
  });
});
listen(downloadLaunch(), "click", (e) => {
  e.stopPropagation();
  setDownloadStep("open");
});
setDownloadStep("closed");
listen(document, "click", (e) => {
  const root = stageDownloads();
  if (!root || root.contains(e.target) || root.dataset.step === "closed") return;
  if (armedDownloadId) setDownloadArmed("");
  else closeDownloadMenu();
});
listen(document, "keydown", (e) => {
  if (e.key !== "Escape") return;
  const root = stageDownloads();
  if (!root || root.dataset.step === "closed") return;
  if (armedDownloadId) setDownloadArmed("");
  else closeDownloadMenu();
});
document.querySelectorAll(".download-tile").forEach((tile) => {
  const info = tile.querySelector(".download-info");
  if (!info) return;
  listen(tile, "pointerenter", () => tile.classList.add("is-hot"));
  listen(tile, "pointerleave", () => tile.classList.remove("is-hot", "is-tip"));
  listen(info, "pointerenter", () => tile.classList.add("is-tip"));
  listen(info, "pointerleave", () => tile.classList.remove("is-tip"));
  listen(info, "click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});
listen(document.getElementById("pfPaste"), "click", pastePropertyFinderLink);
listen(document.getElementById("pfUrl"), "keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    fillFromPropertyFinder(e.currentTarget.value);
  }
});
listen(document.getElementById("pfUrl"), "paste", (e) => {
  if (imageFileFromDataTransfer(e.clipboardData)) return;
  const text = e.clipboardData?.getData("text")?.trim();
  if (!text) return;
  if (unsupportedListingMessage(text)) {
    e.preventDefault();
    rejectUnsupportedLink(text);
    return;
  }
  window.setTimeout(() => fillFromPropertyFinder(text), 0);
});

listen(document, "pointermove", (e) => {
  pointerOverPreview = Boolean(e.target.closest?.("#previewWrap"));
}, { passive: true });
listen(document, "paste", (e) => {
  if (isTypingTarget(e.target) && e.target.id !== "previewFrame" && !e.target.closest?.("#previewWrap")) {
    return;
  }
  useClipboardImage(e);
});

listen(previewFrame, "click", (e) => {
  if (e.target.closest("[contenteditable]")) return;
  previewFrame.focus();
});

["dragenter", "dragover"].forEach((type) => {
  listen(previewFrame, type, (e) => {
    if (!imageFileFromDataTransfer(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    previewFrame.classList.add("is-drop-target");
  });
});
listen(previewFrame, "dragleave", (e) => {
  if (e.relatedTarget && previewFrame.contains(e.relatedTarget)) return;
  previewFrame.classList.remove("is-drop-target");
});
listen(previewFrame, "drop", (e) => {
  e.preventDefault();
  previewFrame.classList.remove("is-drop-target");
  const file = imageFileFromDataTransfer(e.dataTransfer);
  if (file) applyPropertyFile(file, file.name || "Dropped photo");
});

paintPoseThumbs();
setPose(firstFilledPose());
}

const FIELD_IDS = [
  "justWord",
  "statusWord",
  "propertyName",
  "location",
  "note",
  "stat0Value",
  "stat0Label",
  "stat1Value",
  "stat1Label",
  "stat2Value",
  "stat2Label",
  "stat3Value",
  "stat3Label",
  "stat4Value",
  "stat4Label",
  "agentName",
  "phone",
  "email",
  "instagram",
  "comingDate",
];

function persistablePhoto(url) {
  if (!url) return "";
  if (url.startsWith("blob:")) return listingPhotoSource || "";
  return url;
}

export function getStudioState() {
  const fields = {};
  const colors = {};
  const sizes = {};
  const fonts = {};
  FIELD_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    fields[id] = el.textContent || "";
    if (el.style.color) colors[id] = el.style.color;
    if (el.style.fontSize) sizes[id] = el.style.fontSize;
    if (el.style.fontFamily) fonts[id] = currentFontId(el);
  });
  if (brandAgentName) fields.agentName = brandAgentName;
  if (brandPhone) fields.phone = brandPhone;
  if (brandEmail) fields.email = brandEmail;
  if (brandInstagram) fields.instagram = brandInstagram;

  const title = (fields.propertyName || "").trim() || "Untitled listing";
  const listingUrl =
    document.getElementById("pfUrl")?.value?.trim() || lastListing?._url || "";

  return {
    title,
    listing_url: listingUrl,
    listing: lastListing || {},
    studio: {
      headline: activeHeadline,
      template: activeTemplate,
      comingSoonDate: comingSoonDateInput?.value || "",
      pose: activePose,
      photoPos: photoPos,
      agentScale: agentScaleInput?.value || "76",
      agentX: String(agentPosX),
      agentY: String(agentPosY),
      listingPhotoSource,
      brochurePhotoOrder,
      coverPlaceOverride,
      featuresOverride,
      previewMode,
      propertyUrl: persistablePhoto(propertyUrl),
      fields,
      colors,
      sizes,
      fonts,
    },
  };
}

export async function getPersistableStudioState() {
  const state = getStudioState();
  const listing = await replaceEmbeddedPhotos(state.listing || {});
  const studio = await replaceEmbeddedPhotos(state.studio || {});
  const copies = new Set(
    [listing.photo, ...(Array.isArray(listing.photos) ? listing.photos : [])].filter(Boolean)
  );
  if (isEmbeddedPhoto(studio.propertyUrl) && copies.has(studio.propertyUrl)) {
    studio.propertyUrl = "";
  }
  if (isEmbeddedPhoto(studio.listingPhotoSource) && copies.has(studio.listingPhotoSource)) {
    studio.listingPhotoSource = "";
  }
  lastListing = listing;
  if (studio.listingPhotoSource) listingPhotoSource = studio.listingPhotoSource;
  if (studio.propertyUrl && (isEmbeddedPhoto(propertyUrl) || String(propertyUrl).startsWith("blob:"))) {
    setPhoto(studio.propertyUrl);
  } else if (studio.propertyUrl) {
    propertyUrl = studio.propertyUrl;
  }
  if (Array.isArray(studio.brochurePhotoOrder)) brochurePhotoOrder = studio.brochurePhotoOrder;
  return { ...state, listing, studio };
}

export function applyStudioState(data = {}) {
  const studio = data.studio || {};
  const listingUrl = data.listing_url || "";
  const pfUrl = document.getElementById("pfUrl");
  if (pfUrl && listingUrl) pfUrl.value = listingUrl;

  if (data.listing && Object.keys(data.listing).length) {
    lastListing = data.listing;
    applyListingToForm(data.listing);
  }

  if (studio.comingSoonDate && comingSoonDateInput) {
    comingSoonDateInput.value = studio.comingSoonDate;
  }
  if (studio.headline) setHeadline(studio.headline);
  setTemplate(studio.template || "dock");
  if (studio.pose && studio.pose !== "custom") setPose(studio.pose);

  if (studio.photoPos != null) applyPhotoPosition(studio.photoPos);
  if (studio.agentScale != null && agentScaleInput) agentScaleInput.value = studio.agentScale;
  if (studio.agentX != null) agentPosX = Number(studio.agentX);
  if (studio.agentY != null) agentPosY = Number(studio.agentY);
  applyAgentLayout();

  if (Array.isArray(studio.brochurePhotoOrder)) brochurePhotoOrder = studio.brochurePhotoOrder;
  if (studio.coverPlaceOverride != null) coverPlaceOverride = studio.coverPlaceOverride;
  if (studio.featuresOverride != null) featuresOverride = studio.featuresOverride;
  if (studio.listingPhotoSource) listingPhotoSource = studio.listingPhotoSource;

  const photo = studio.listingPhotoSource
    ? displayPhoto(studio.listingPhotoSource)
    : persistablePhoto(studio.propertyUrl);
  if (photo) setPhoto(displayPhoto(photo));

  const fields = studio.fields || {};
  Object.entries(fields).forEach(([id, value]) => {
    if (PROFILE_FIELDS.includes(id)) return;
    setField(id, value);
  });
  Object.entries(studio.colors || {}).forEach(([id, color]) => {
    const el = document.getElementById(id);
    if (el && color) el.style.color = color;
  });
  Object.entries(studio.sizes || {}).forEach(([id, size]) => {
    const el = document.getElementById(id);
    if (!el || !size) return;
    el.style.fontSize = String(size).includes("px") ? size : `${size}px`;
  });
  Object.entries(studio.fonts || {}).forEach(([id, fontId]) => {
    const el = document.getElementById(id);
    const font = TEXT_FONTS.find((item) => item.id === fontId);
    if (el && font) el.style.fontFamily = font.family;
  });

  if (studio.previewMode) setPreviewMode(studio.previewMode, { instant: true });
  applyBrandContacts();
  renderListingGallery();
  if (previewMode === "brochure") renderBrochurePreview();
  requestAnimationFrame(() => scalePreview());
}

export function applyBrand(brand = {}) {
  brandAgencyName = String(brand.agencyName || "").trim();
  brandAgentName = String(brand.agentName || "").trim();
  brandPhone = String(brand.phone || "").trim();
  brandEmail = String(brand.email || "").trim();
  brandInstagram = String(brand.instagram || "").trim();
  const brandEl = document.querySelector(".brand");
  const nameEl = document.getElementById("brandName");
  const subEl = document.getElementById("brandSub");
  const logoEl = document.getElementById("brandLogo");
  if (nameEl) nameEl.textContent = brandAgencyName;
  if (subEl) subEl.textContent = brand.agencySub || "";
  if (logoEl && brandEl) {
    if (brand.logoUrl) {
      logoEl.src = brand.logoUrl;
      logoEl.hidden = false;
      brandEl.classList.add("has-logo");
    } else {
      logoEl.removeAttribute("src");
      logoEl.hidden = true;
      brandEl.classList.remove("has-logo");
    }
  }
  applyBrandContacts();
  poseUrls = new Array(MAX_POSES)
    .fill("")
    .map((_, index) => String(brand.poses?.[index] || "").trim());
  paintPoseThumbs();
  setPose(poseUrls[activePose - 1] ? activePose : firstFilledPose());
}

export function bootStudio(hooks = {}) {
  studioHooks = hooks;
  resetStudioBindings();
  bindDom();
  mountIcons();
  scalePreview();
  listen(window, "resize", () => {
    scalePreview();
    scaleBrochurePages();
  });
  observeSize(previewWrap, scalePreview);
  observeSize(brochurePreview, scaleBrochurePages);
  bindStudioEvents();
  bindDownloadEvents();
  setPreviewPaneState(previewFrame, true);
  setPreviewPaneState(brochurePreview, false);
  setTemplate(activeTemplate);
  syncSlideLids();
  renderListingGallery();
  listen(document.querySelector(".app"), "input", () => studioHooks.onChange?.());
  listen(document.querySelector(".app"), "change", () => studioHooks.onChange?.());
}
