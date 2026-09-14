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
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m3.8 16.2 4.6-4.6a1.5 1.5 0 0 1 2.1 0L15 16"/><path d="m13.2 14.2 1.6-1.6a1.5 1.5 0 0 1 2.1 0l3.6 3.6"/><circle cx="9" cy="9.2" r="1.2"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.2A1.7 1.7 0 0 1 5.2 6.5H10l2 2h6.8A1.7 1.7 0 0 1 20.5 10v8.3a1.7 1.7 0 0 1-1.7 1.7H5.2A1.7 1.7 0 0 1 3.5 18.3z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 5 5 9-10"/></svg>`,
};

const AGENT_POSES = {
  crossed: {
    src: "/agents/arms-crossed.png?v=5",
    scale: 76,
    x: -14,
    height: 720,
  },
  presenting: {
    src: "/agents/presenting.png?v=5",
    scale: 70,
    x: -22,
    height: 640,
  },
};

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
let stageHint;
let posePicker;
let statusPicker;
let comingSoonDateInput;
let comingSoonGroup;
let availableOnLabel;
let agentScaleInput;
let agentXInput;
let agentYInput;
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
let activePose = "crossed";
let poseBaseHeight = AGENT_POSES.crossed.height;
let lastListing = null;
let brandAgencyName = "Your agency";
let colorTarget = null;
let coverPlaceOverride = "";
let featuresOverride = "";
let previewMode = "listing";
let activeHeadline = "just-leased";
let brochurePhotoOrder = [];
let listingPhotoSource = "";

const COLOR_LABELS = {
  justWord: "Kicker",
  statusWord: "Status",
  comingDate: "Available from",
  propertyName: "Property name",
  location: "Location",
  note: "Note",
  stat0Value: "Bedrooms",
  stat0Label: "Bedrooms label",
  stat1Value: "Area",
  stat1Label: "Area label",
  stat2Value: "Price",
  stat2Label: "Price label",
  stat3Value: "Cheques",
  stat3Label: "Cheques label",
  stat4Value: "Term",
  stat4Label: "Term label",
  agentName: "Agent name",
  phone: "Phone",
  email: "Email",
  instagram: "Instagram",
  note: "Hook",
  coverPlace: "Cover location",
  features: "Property features",
  priceLabel: "Price label",
};

let textColorInput;
let colorTargetLabel;
let colorSwatches;

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
  stageHint = document.getElementById("stageHint");
  posePicker = document.getElementById("posePicker");
  statusPicker = document.getElementById("statusPicker");
  comingSoonDateInput = document.getElementById("comingSoonDate");
  comingSoonGroup = document.getElementById("comingSoonGroup");
  availableOnLabel = document.getElementById("availableOnLabel");
  agentScaleInput = document.getElementById("agentScale");
  agentXInput = document.getElementById("agentX");
  agentYInput = document.getElementById("agentY");
  textColorInput = document.getElementById("textColor");
  colorTargetLabel = document.getElementById("colorTargetLabel");
  colorSwatches = document.getElementById("colorSwatches");
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

function scalePreview() {
  if (previewMode !== "listing") return;
  const size = Math.min(previewFrame.clientWidth, previewFrame.clientHeight || previewFrame.clientWidth);
  listing.style.transform = `scale(${size / 1080})`;
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
  clone.style.removeProperty("transform");
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
  if (colorTarget && !document.contains(colorTarget)) {
    const field = fieldKey(colorTarget);
    const next = field && hold.querySelector(`[data-field="${field}"]`);
    if (next) selectColorTarget(next);
    else colorTarget = null;
  }
}

function renderBrochurePreview() {
  const { photos, pages } = brochurePagePlan(brochureData(lastListing || {}));
  const top = previewWrap.scrollTop;
  brochurePages.replaceChildren();
  if (!photos.length) {
    brochurePreview.classList.add("is-empty");
    brochureEmpty.textContent = "Paste a listing link to preview the brochure.";
    return;
  }
  brochurePreview.classList.remove("is-empty");
  brochurePages.append(...pages.map(renderBrochurePage));
  bindBrochureDrag();
  scaleBrochurePages();
  previewWrap.scrollTop = top;
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

function setPreviewMode(mode) {
  previewMode = mode === "brochure" ? "brochure" : "listing";
  const isBrochure = previewMode === "brochure";
  previewWrap.classList.toggle("is-brochure", isBrochure);
  previewFrame.hidden = isBrochure;
  brochurePreview.hidden = !isBrochure;
  stageHint.textContent = isBrochure
    ? "Click text to edit · drag pages to reorder"
    : "Click text to edit · paste a photo onto the preview";
  previewSwitch.querySelectorAll("[data-preview]").forEach((btn) => {
    const active = btn.dataset.preview === previewMode;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  renderListingGallery();
  if (isBrochure) renderBrochurePreview();
  else scalePreview();
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
  colorSwatches.querySelectorAll(".color-swatch").forEach((swatch) => {
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
  const key = fieldKey(el);
  colorTargetLabel.textContent = COLOR_LABELS[key] || el.dataset.colorLabel || "Selected text";
  markActiveSwatch(hex);
}

function applyTextColor(hex) {
  if (!colorTarget || !hex) return;
  const field = fieldKey(colorTarget);
  const targets = field
    ? document.querySelectorAll(`[id="${field}"], [data-field="${field}"]`)
    : [colorTarget];
  targets.forEach((node) => {
    node.style.color = hex;
  });
  if (!field) colorTarget.style.color = hex;
  textColorInput.value = hex;
  markActiveSwatch(hex);
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
  comingSoonGroup.classList.toggle("is-split", comingMode);
  document.querySelector('[data-status="available-on"]').hidden = !comingMode;
  statusPicker.querySelectorAll(".status-card").forEach((card) => {
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
}

function proxiedPhoto(url) {
  return `/api/pf-image?url=${encodeURIComponent(url)}`;
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
  setField("agentName", listingData.agentName);
  setField("email", listingData.agentEmail);
  setField("phone", listingData.agentPhone);
  if (listingData.photo) {
    listingPhotoSource = listingData.photo;
    setPhoto(proxiedPhoto(listingData.photo));
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
    agentName: fieldValue("agentName") || listing.agentName || "",
    email: fieldValue("email") || listing.agentEmail || "",
    phone: fieldValue("phone") || listing.agentPhone || "",
    instagram: fieldValue("instagram") || "",
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
  const fetchBtn = document.getElementById("pfFetch");
  const pasteBtn = document.getElementById("pfPaste");
  fetchBtn.disabled = true;
  pasteBtn.disabled = true;
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
    fetchBtn.disabled = false;
    pasteBtn.disabled = false;
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
    setPfStatus("Clipboard blocked. Paste the link, then click fill.", true);
  }
}

function setPhoto(url) {
  propertyUrl = url;
  bgImage.src = url;
  bgBlur.src = url;
  listing.classList.toggle("has-photo", Boolean(url));
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

function renderListingGallery() {
  const rail = document.getElementById("listingGallery");
  const list = document.getElementById("listingGalleryList");
  const photos = listingGalleryPhotos();
  const show = previewMode === "listing" && photos.length > 0;
  previewWrap.classList.toggle("has-gallery", show);
  rail.hidden = !show;
  if (!show) {
    list.replaceChildren();
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
        setPhoto(proxiedPhoto(url));
        document.getElementById("propertyFileName").textContent = `Photo ${index + 1}`;
        renderListingGallery();
      });
      return btn;
    })
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function urlToDataUrl(url) {
  if (!url || url === PLACEHOLDER || url.startsWith("data:")) return url;
  const response = await fetch(url);
  const blob = await response.blob();
  return fileToDataUrl(blob);
}

async function applyPropertyFile(file, label = "Pasted photo") {
  if (!file || !String(file.type || "").startsWith("image/")) return false;
  const dataUrl = await fileToDataUrl(file);
  if (propertyObjectUrl) {
    URL.revokeObjectURL(propertyObjectUrl);
    propertyObjectUrl = "";
  }
  setPhoto(dataUrl);
  document.getElementById("propertyFileName").textContent =
    label || file.name || "Pasted photo";
  return true;
}

function imageFileFromDataTransfer(data) {
  if (!data) return null;
  const items = [...(data.items || [])];
  for (const item of items) {
    if (item.kind === "file" && String(item.type || "").startsWith("image/")) {
      return item.getAsFile();
    }
  }
  return [...(data.files || [])].find((file) =>
    String(file.type || "").startsWith("image/")
  ) || null;
}

function isTypingTarget(el) {
  if (!el || el === document.body) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(el.isContentEditable);
}

function useClipboardImage(event) {
  const file = imageFileFromDataTransfer(event.clipboardData);
  if (!file) return false;
  event.preventDefault();
  applyPropertyFile(
    file,
    file.name && file.name !== "image.png" ? file.name : "Pasted photo"
  );
  previewFrame.classList.remove("is-drop-target");
  return true;
}

function setAgent(url, pose = "custom") {
  agentUrl = url;
  activePose = pose;
  poseBaseHeight = AGENT_POSES[pose]?.height || 640;
  listing.classList.toggle("has-agent", Boolean(url));
  listing.classList.remove("pose-crossed", "pose-presenting", "pose-custom");
  if (url) listing.classList.add(`pose-${pose}`);
  if (!url) {
    agentImage.src = PLACEHOLDER;
    agentImage.hidden = true;
    applyAgentLayout();
    return;
  }
  agentImage.src = url;
  agentImage.hidden = false;
  applyAgentLayout();
}

function setPose(pose) {
  const preset = AGENT_POSES[pose];
  if (!preset) return;
  agentScaleInput.value = String(preset.scale);
  agentXInput.value = String(preset.x);
  if (agentYInput) agentYInput.value = "0";
  setAgent(preset.src, pose);
  document.getElementById("agentFileName").textContent = "Optional";
  posePicker.querySelectorAll(".pose-card").forEach((card) => {
    const on = card.dataset.pose === pose;
    card.classList.toggle("is-active", on);
    card.setAttribute("aria-pressed", on ? "true" : "false");
  });
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

  input.addEventListener("change", () => handle(input.files[0]));
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    handle(e.dataTransfer.files[0]);
  });
}

function applyPhotoPosition(value) {
  const pos = `center ${value}%`;
  bgImage.style.objectPosition = pos;
  bgBlur.style.objectPosition = pos;
}

function applyAgentLayout() {
  const scale = Number(agentScaleInput.value) / 100;
  const x = Number(agentXInput.value);
  const y = Number(agentYInput?.value || 0);
  agentImage.style.left = `${x}px`;
  agentImage.style.bottom = `${y}px`;
  agentImage.style.height = `${poseBaseHeight * scale}px`;
}

function bindAgentDrag() {
  if (!agentImage || agentImage.dataset.dragBound) return;
  agentImage.dataset.dragBound = "true";
  agentImage.classList.add("is-draggable");

  agentImage.addEventListener("pointerdown", (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const layoutScale = listingPointerScale(listing);
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = Number(agentXInput.value);
    const originY = Number(agentYInput?.value || 0);
    agentImage.classList.add("is-dragging");
    agentImage.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const next = clampAgentPosition(
        originX + (moveEvent.clientX - startX) / layoutScale,
        originY + (startY - moveEvent.clientY) / layoutScale,
        agentImage.offsetWidth,
        agentImage.offsetHeight
      );
      agentXInput.value = String(Math.round(next.x));
      if (agentYInput) agentYInput.value = String(Math.round(next.y));
      applyAgentLayout();
    };

    const onUp = () => {
      agentImage.classList.remove("is-dragging");
      agentImage.removeEventListener("pointermove", onMove);
      agentImage.removeEventListener("pointerup", onUp);
      agentImage.removeEventListener("pointercancel", onUp);
      studioHooks.onChange?.();
    };

    agentImage.addEventListener("pointermove", onMove);
    agentImage.addEventListener("pointerup", onUp);
    agentImage.addEventListener("pointercancel", onUp);
  });
}

async function captureListingPng(pixelRatio = EXPORT_RATIO) {
  const exportOptions = {
    width: LAYOUT_SIZE,
    height: LAYOUT_SIZE,
    pixelRatio,
    cacheBust: true,
    includeQueryParams: true,
    imagePlaceholder: PLACEHOLDER,
    style: {
      transform: "none",
      transformOrigin: "top left",
      width: `${LAYOUT_SIZE}px`,
      height: `${LAYOUT_SIZE}px`,
    },
  };

  const wasHidden = previewFrame.hidden;
  if (wasHidden) {
    previewFrame.hidden = false;
    previewFrame.style.position = "fixed";
    previewFrame.style.left = "-2000px";
    previewFrame.style.top = "0";
    previewFrame.style.opacity = "0";
    previewFrame.style.pointerEvents = "none";
  }

  document.activeElement?.blur?.();
  listing.classList.add("is-exporting");

  try {
    await Promise.all(
      [bgImage, bgBlur, agentImage]
        .filter((img) => (img.getAttribute("src") || "").startsWith("blob:"))
        .map(async (img) => {
          img.src = await urlToDataUrl(img.src);
        })
    );
    await document.fonts.ready;
    await Promise.all(
      [bgImage, bgBlur, agentImage]
        .filter(hasRealSrc)
        .map((img) => img.decode?.().catch(() => undefined) ?? Promise.resolve())
    );

    try {
      return await toPng(listing, exportOptions);
    } catch {
      return await toPng(listing, { ...exportOptions, skipFonts: true });
    }
  } finally {
    listing.classList.remove("is-exporting");
    if (wasHidden) {
      previewFrame.hidden = true;
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
  const btn = document.getElementById("downloadBtn");
  const status = document.getElementById("downloadStatus");
  btn.disabled = true;
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
    setDownloadArmed("");
    btn.disabled = false;
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
listing.addEventListener("focusin", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) selectColorTarget(el);
});
listing.addEventListener("pointerdown", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) selectColorTarget(el);
});
brochurePreview.addEventListener("focusin", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) selectColorTarget(el);
});
brochurePreview.addEventListener("pointerdown", (e) => {
  const el = e.target.closest(".is-edit");
  if (el) selectColorTarget(el);
});
textColorInput.addEventListener("input", (e) => {
  applyTextColor(e.currentTarget.value);
});
colorSwatches.addEventListener("click", (e) => {
  const swatch = e.target.closest(".color-swatch");
  if (!swatch || !colorTarget) return;
  applyTextColor(swatch.dataset.color);
});

listing.addEventListener("input", (e) => {
  const el = e.target.closest("#justWord, #statusWord");
  if (!el) return;
  forceUppercase(el);
});
brochurePreview.addEventListener("input", (e) => {
  const el = e.target.closest(".is-edit");
  if (!el) return;
  const field = fieldKey(el);
  if (field === "justWord" || field === "statusWord" || el.id === "justWord" || el.id === "statusWord") {
    forceUppercase(el);
  }
  if (field) syncField(field, el.textContent, el);
});

listing.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || !e.target.closest("[contenteditable]")) return;
  e.preventDefault();
  e.target.blur();
});
brochurePreview.addEventListener("keydown", (e) => {
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
    setAgent(url, "custom");
    posePicker.querySelectorAll(".pose-card").forEach((card) => {
      card.classList.remove("is-active");
      card.setAttribute("aria-pressed", "false");
    });
  },
  "agentFileName"
);

posePicker.addEventListener("click", (e) => {
  const card = e.target.closest(".pose-card");
  if (!card) return;
  setPose(card.dataset.pose);
});
statusPicker.addEventListener("click", (e) => {
  if (e.target.closest(".coming-soon-date")) return;
  const card = e.target.closest(".status-card");
  if (!card) return;
  setHeadline(card.dataset.status);
});
comingSoonDateInput.addEventListener("pointerdown", (e) => {
  e.stopPropagation();
  if (activeHeadline !== "available-on") setHeadline("available-on");
});
comingSoonDateInput.addEventListener("change", () => {
  if (activeHeadline !== "available-on") setHeadline("available-on");
  else updateComingDateDisplay();
  if (previewMode === "brochure") refreshBrochureListingPage();
});
previewSwitch.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-preview]");
  if (!btn) return;
  setPreviewMode(btn.dataset.preview);
});

document.getElementById("photoPos").addEventListener("input", (e) => {
  applyPhotoPosition(e.target.value);
});
agentScaleInput.addEventListener("input", applyAgentLayout);
agentXInput.addEventListener("input", applyAgentLayout);
agentYInput?.addEventListener("input", applyAgentLayout);
bindAgentDrag();
}

function downloadButtons() {
  return [
    document.getElementById("downloadBtn"),
    document.getElementById("brochureBtn"),
    document.getElementById("brochureImagesBtn"),
  ];
}

function setDownloadBusy(busy) {
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

function setDownloadArmed(id) {
  armedDownloadId = id || "";
  downloadActions.forEach((action) => {
    const btn = document.getElementById(action.id);
    const armed = action.id === armedDownloadId;
    btn.classList.toggle("is-confirm", armed);
    btn.setAttribute("aria-label", armed ? `Confirm download: ${action.label}` : action.label);
  });
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

async function captureBrochurePage(pageEl) {
  const options = {
    width: BROCHURE_W,
    height: BROCHURE_H,
    pixelRatio: 3,
    cacheBust: true,
    includeQueryParams: true,
    imagePlaceholder: PLACEHOLDER,
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
  host.append(clone);
  document.body.append(host);
  try {
    await Promise.all(
      [...clone.querySelectorAll("img")]
        .filter(hasRealSrc)
        .map((img) => img.decode?.().catch(() => undefined) ?? Promise.resolve())
    );
    try {
      return await toPng(clone, options);
    } catch {
      return await toPng(clone, { ...options, skipFonts: true });
    }
  } finally {
    host.remove();
  }
}

async function downloadBrochure() {
  const status = document.getElementById("downloadStatus");
  setDownloadBusy(true);
  status.hidden = false;
  status.classList.remove("is-error");
  status.textContent = "Preparing brochure…";

  const wasBrochure = previewMode === "brochure";
  const wasHidden = brochurePreview.hidden;
  try {
    const data = await prepareBrochureData(status);
    renderBrochurePreview();
    brochurePreview.hidden = false;
    brochurePreview.style.position = "fixed";
    brochurePreview.style.left = "-4000px";
    brochurePreview.style.top = "0";
    brochurePreview.style.opacity = "0";
    brochurePreview.style.pointerEvents = "none";
    sizeBrochurePagesNative();
    status.textContent = "Capturing listing page…";
    const listingPage = brochurePages.querySelector(".brochure-page.is-square");
    if (!listingPage) throw new Error("Could not build the listing page.");
    const listingImage = await captureBrochurePage(listingPage);
    await buildBrochurePdf(data, (message) => {
      status.textContent = message;
    }, listingImage);
    status.classList.remove("is-error");
    status.textContent = "Brochure saved.";
  } catch (err) {
    console.error(err);
    status.classList.add("is-error");
    status.textContent = err.message || "Could not build the brochure.";
  } finally {
    brochurePreview.style.position = "";
    brochurePreview.style.left = "";
    brochurePreview.style.top = "";
    brochurePreview.style.opacity = "";
    brochurePreview.style.pointerEvents = "";
    if (wasHidden && !wasBrochure) brochurePreview.hidden = true;
    if (wasBrochure) scaleBrochurePages();
    setDownloadArmed("");
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
  const wasHidden = brochurePreview.hidden;
  try {
    const data = await prepareBrochureData(status);
    renderBrochurePreview();
    brochurePreview.hidden = false;
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
    status.textContent = err.message || "Could not export the images.";
  } finally {
    brochurePreview.style.position = "";
    brochurePreview.style.left = "";
    brochurePreview.style.top = "";
    brochurePreview.style.opacity = "";
    brochurePreview.style.pointerEvents = "";
    if (wasHidden && !wasBrochure) brochurePreview.hidden = true;
    if (wasBrochure) scaleBrochurePages();
    setDownloadArmed("");
    setDownloadBusy(false);
  }
}

function bindDownloadEvents() {
downloadActions.forEach((action) => {
  document.getElementById(action.id).addEventListener("click", () => {
    requestDownload(action);
  });
});
document.addEventListener("click", (e) => {
  const tile = document.getElementById(armedDownloadId)?.closest(".download-tile");
  if (!armedDownloadId || tile?.contains(e.target)) return;
  setDownloadArmed("");
});
document.querySelectorAll(".download-tile").forEach((tile) => {
  const info = tile.querySelector(".download-info");
  tile.addEventListener("pointerenter", () => tile.classList.add("is-hot"));
  tile.addEventListener("pointerleave", () => tile.classList.remove("is-hot", "is-tip"));
  info.addEventListener("pointerenter", () => tile.classList.add("is-tip"));
  info.addEventListener("pointerleave", () => tile.classList.remove("is-tip"));
  info.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});
document.getElementById("pfPaste").addEventListener("click", pastePropertyFinderLink);
document.getElementById("pfFetch").addEventListener("click", () => {
  fillFromPropertyFinder(document.getElementById("pfUrl").value);
});
document.getElementById("pfUrl").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    fillFromPropertyFinder(e.currentTarget.value);
  }
});
document.getElementById("pfUrl").addEventListener("paste", (e) => {
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

document.addEventListener("paste", (e) => {
  if (isTypingTarget(e.target) && e.target.id !== "previewFrame") return;
  useClipboardImage(e);
});

previewFrame.addEventListener("click", (e) => {
  if (e.target.closest("[contenteditable]")) return;
  previewFrame.focus();
});

["dragenter", "dragover"].forEach((type) => {
  previewFrame.addEventListener(type, (e) => {
    if (!imageFileFromDataTransfer(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    previewFrame.classList.add("is-drop-target");
  });
});
previewFrame.addEventListener("dragleave", (e) => {
  if (e.relatedTarget && previewFrame.contains(e.relatedTarget)) return;
  previewFrame.classList.remove("is-drop-target");
});
previewFrame.addEventListener("drop", (e) => {
  e.preventDefault();
  previewFrame.classList.remove("is-drop-target");
  const file = imageFileFromDataTransfer(e.dataTransfer);
  if (file) applyPropertyFile(file, file.name || "Dropped photo");
});

setPose("crossed");
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
  FIELD_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    fields[id] = el.textContent || "";
    if (el.style.color) colors[id] = el.style.color;
  });

  const title = (fields.propertyName || "").trim() || "Untitled listing";
  const listingUrl =
    document.getElementById("pfUrl")?.value?.trim() || lastListing?._url || "";

  return {
    title,
    listing_url: listingUrl,
    listing: lastListing || {},
    studio: {
      headline: activeHeadline,
      comingSoonDate: comingSoonDateInput?.value || "",
      pose: activePose,
      photoPos: document.getElementById("photoPos")?.value || "50",
      agentScale: agentScaleInput?.value || "76",
      agentX: agentXInput?.value || "-14",
      agentY: agentYInput?.value || "0",
      listingPhotoSource,
      brochurePhotoOrder,
      coverPlaceOverride,
      featuresOverride,
      previewMode,
      propertyUrl: persistablePhoto(propertyUrl),
      fields,
      colors,
    },
  };
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
  if (studio.pose && studio.pose !== "custom") setPose(studio.pose);

  if (studio.photoPos != null) {
    const photoPos = document.getElementById("photoPos");
    if (photoPos) {
      photoPos.value = studio.photoPos;
      applyPhotoPosition(studio.photoPos);
    }
  }
  if (studio.agentScale != null && agentScaleInput) agentScaleInput.value = studio.agentScale;
  if (studio.agentX != null && agentXInput) agentXInput.value = studio.agentX;
  if (studio.agentY != null && agentYInput) agentYInput.value = studio.agentY;
  applyAgentLayout();

  if (Array.isArray(studio.brochurePhotoOrder)) brochurePhotoOrder = studio.brochurePhotoOrder;
  if (studio.coverPlaceOverride != null) coverPlaceOverride = studio.coverPlaceOverride;
  if (studio.featuresOverride != null) featuresOverride = studio.featuresOverride;
  if (studio.listingPhotoSource) listingPhotoSource = studio.listingPhotoSource;

  const photo = studio.listingPhotoSource
    ? proxiedPhoto(studio.listingPhotoSource)
    : persistablePhoto(studio.propertyUrl);
  if (photo) setPhoto(photo);

  const fields = studio.fields || {};
  Object.entries(fields).forEach(([id, value]) => setField(id, value));
  Object.entries(studio.colors || {}).forEach(([id, color]) => {
    const el = document.getElementById(id);
    if (el && color) el.style.color = color;
  });

  if (studio.previewMode) setPreviewMode(studio.previewMode);
  renderListingGallery();
  if (previewMode === "brochure") renderBrochurePreview();
}

export function applyBrand(brand = {}) {
  brandAgencyName = String(brand.agencyName || "").trim() || "Your agency";
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
  if (brand.agentName) setField("agentName", brand.agentName);
  if (brand.phone) setField("phone", brand.phone);
  if (brand.email) setField("email", brand.email);
  if (brand.instagram) setField("instagram", brand.instagram);
  if (brand.cutoutUrl) setAgent(brand.cutoutUrl, "custom");
}

export function bootStudio(hooks = {}) {
  studioHooks = hooks;
  if (bootStudio.done) return;
  bootStudio.done = true;
  bindDom();
  mountIcons();
  scalePreview();
  window.addEventListener("resize", () => {
    scalePreview();
    scaleBrochurePages();
  });
  new ResizeObserver(scalePreview).observe(previewFrame);
  new ResizeObserver(scaleBrochurePages).observe(brochurePreview);
  bindStudioEvents();
  bindDownloadEvents();
  document.querySelector(".app")?.addEventListener("input", () => studioHooks.onChange?.());
  document.querySelector(".app")?.addEventListener("change", () => studioHooks.onChange?.());
}
