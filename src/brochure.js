import { jsPDF } from "jspdf";

const PAGE_W = 720;
const PAGE_H = 521;
const NAVY = [8, 29, 86];
const ACCENT = [23, 84, 234];
const MUTED = [51, 67, 111];
const MAX_GALLERY = 16;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src && !src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load a listing photo."));
    img.src = src;
  });
}

function compressPhoto(img, maxEdge = 1800) {
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
  return { canvas, width, height };
}

export function photoSrc(url) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")) {
    return url;
  }
  return `/api/pf-image?url=${encodeURIComponent(url)}`;
}

async function preparePhoto(url) {
  const src = photoSrc(url);
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return compressPhoto(await loadImage(src));
  }
  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error("Could not load a listing photo.");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      return compressPhoto(await loadImage(objectUrl));
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return compressPhoto(await loadImage(src));
  }
}

function drawSky(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#9ec7f4");
  sky.addColorStop(0.38, "#d7e7fb");
  sky.addColorStop(1, "#cbb892");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
}

function drawPhotoCover(ctx, photo, w, h) {
  if (!photo) {
    drawSky(ctx, w, h);
    return;
  }
  const fit = Math.max(w / photo.width, h / photo.height);
  const dw = photo.width * fit;
  const dh = photo.height * fit;
  ctx.drawImage(photo.canvas, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function roundRectPath(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

let imageAlias = 0;

function addCanvasImage(doc, canvas, x, y, w, h, type = "JPEG") {
  imageAlias += 1;
  try {
    const data = canvas.toDataURL(type === "PNG" ? "image/png" : "image/jpeg", 0.88);
    doc.addImage(data, type, x, y, w, h, `img-${imageAlias}`, "FAST");
  } catch (err) {
    if (type !== "JPEG") {
      const jpeg = canvas.toDataURL("image/jpeg", 0.88);
      doc.addImage(jpeg, "JPEG", x, y, w, h, `img-${imageAlias}-jpg`, "FAST");
      return;
    }
    throw new Error(err?.message || "Could not add a page to the brochure.");
  }
}

function drawPagePhoto(doc, photo, fadeBottom = false) {
  const px = 2;
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_W * px;
  canvas.height = PAGE_H * px;
  const ctx = canvas.getContext("2d");
  drawPhotoCover(ctx, photo, canvas.width, canvas.height);
  if (fadeBottom) {
    const fade = ctx.createLinearGradient(0, canvas.height * 0.58, 0, canvas.height);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  addCanvasImage(doc, canvas, 0, 0, PAGE_W, PAGE_H);
}

function makeGlassCard(photo, x, y, w, h, radius) {
  const px = 2;
  const pad = 28;
  const blur = document.createElement("canvas");
  blur.width = Math.round((w + pad * 2) * px);
  blur.height = Math.round((h + pad * 2) * px);
  const bctx = blur.getContext("2d");
  bctx.filter = "blur(16px) saturate(1.05)";
  bctx.translate(-(x - pad) * px, -(y - pad) * px);
  drawPhotoCover(bctx, photo, PAGE_W * px, PAGE_H * px);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * px));
  canvas.height = Math.max(1, Math.round(h * px));
  const ctx = canvas.getContext("2d");
  roundRectPath(ctx, 0, 0, canvas.width, canvas.height, radius * px);
  ctx.clip();
  ctx.drawImage(blur, -pad * px, -pad * px);

  const frost = ctx.createLinearGradient(0, 0, 0, canvas.height);
  frost.addColorStop(0, "rgba(255,255,255,0.24)");
  frost.addColorStop(1, "rgba(255,255,255,0.36)");
  ctx.fillStyle = frost;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tr = ctx.createRadialGradient(
    canvas.width,
    0,
    0,
    canvas.width,
    0,
    canvas.width * 0.62
  );
  tr.addColorStop(0, "rgba(255,255,255,0.88)");
  tr.addColorStop(0.32, "rgba(255,255,255,0.32)");
  tr.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = tr;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bl = ctx.createRadialGradient(
    0,
    canvas.height,
    0,
    0,
    canvas.height,
    canvas.width * 0.55
  );
  bl.addColorStop(0, "rgba(255,255,255,0.55)");
  bl.addColorStop(0.36, "rgba(255,255,255,0.18)");
  bl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bl;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.6 * px;
  roundRectPath(ctx, 0.8 * px, 0.8 * px, canvas.width - 1.6 * px, canvas.height - 1.6 * px, radius * px);
  ctx.stroke();
  return canvas;
}

function drawGlass(doc, photo, x, y, w, h, radius = 28) {
  addCanvasImage(doc, makeGlassCard(photo, x, y, w, h, radius), x, y, w, h, "PNG");
}

function setText(doc, rgb) {
  doc.setTextColor(...rgb);
}

function wrapLines(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text || ""), maxWidth);
}

export function coverPlace(data) {
  if (data.coverPlace) return data.coverPlace;
  const cluster = data.cluster || data.propertyName || "";
  const community = data.community || "";
  const seen = new Set();
  return [cluster, community, "Dubai"]
    .map((part) => String(part || "").trim())
    .filter((part) => {
      const key = part.toLowerCase();
      if (!part || seen.has(key) || key === "dubai" && seen.has("dubai")) return false;
      seen.add(key);
      return true;
    })
    .join(", ");
}

function clusterCode(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const phase = [...parts].reverse().find((part) => /^\d+$/.test(part)) || "";
  const initials = parts
    .filter((part) => !/^\d+$/.test(part))
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return `${initials}${phase}`;
}

export function filenameFrom(data) {
  const community = String(data.community || "")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const cluster = clusterCode(data.cluster || data.propertyName);
  const beds = String(data.bedrooms || "").replace(/\D/g, "");
  const status =
    data.status === "ON" && data.availableOn
      ? String(data.availableOn).replace(/[\\/:*?"<>|]+/g, " ").trim()
      : String(data.status || "LISTING").toUpperCase();
  const parts = [community, cluster, beds ? `${beds}B` : "", status].filter(Boolean);
  return `${parts.join(" ") || "brochure"}.pdf`;
}

export function coverFacts(data) {
  const facts = [];
  if (data.bedrooms) {
    facts.push({
      value: data.bedrooms,
      label: data.bedrooms === "1" ? "Bedroom" : "Bedrooms",
      field: "stat0Value",
      labelField: "stat0Label",
    });
  }
  if (data.area) {
    facts.push({
      value: data.area,
      label: "Sq. Ft.",
      field: "stat1Value",
      labelField: "stat1Label",
    });
  }
  if (data.furnished) {
    facts.push({
      value: data.furnished,
      label: "Status",
      field: "furnished",
    });
  }
  if (data.cheques) {
    facts.push({
      value: data.cheques,
      label: data.cheques === "1" ? "Cheque" : "Cheques",
      field: "stat3Value",
      labelField: "stat3Label",
    });
  }
  if (data.term) {
    facts.push({
      value: data.term,
      label: data.termLabel || "Lease Term",
      field: "stat4Value",
      labelField: "stat4Label",
    });
  }
  return facts;
}

export function featureLines(data) {
  if (data.featuresText) {
    return String(data.featuresText)
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  const lines = [];
  if (data.bedrooms) {
    lines.push(
      `${data.bedrooms} Bedroom${data.bedrooms === "1" ? "" : "s"}${
        data.maid ? " + Maid" : ""
      }`
    );
  }
  if (data.bathrooms) {
    lines.push(`${data.bathrooms} Bathroom${data.bathrooms === "1" ? "" : "s"}`);
  }
  if (data.furnished) lines.push(data.furnished);
  if (data.propertyType) lines.push(data.propertyType);
  if (data.area) lines.push(`Built-Up Area: ${data.area} sq ft`);
  if (data.plotArea) lines.push(`Plot Area: ${data.plotArea} sq ft`);
  if (data.cheques) {
    lines.push(`${data.cheques} Cheque${data.cheques === "1" ? "" : "s"}`);
  }
  if (data.term) lines.push(data.term);
  for (const amenity of data.amenities || []) {
    if (lines.length >= 9) break;
    if (!lines.some((line) => line.toLowerCase() === amenity.toLowerCase())) {
      lines.push(amenity);
    }
  }
  return lines;
}

function addCover(doc, data, photo) {
  drawPagePhoto(doc, photo, true);
  const x = 28;
  let y = PAGE_H - 28;
  const facts = coverFacts(data);
  setText(doc, [255, 255, 255]);

  if (facts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      facts.map((fact) => `${fact.value} ${fact.label}`).join("    "),
      x,
      y
    );
    y -= 22;
  }

  if (data.price) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(42);
    doc.text(data.price, x, y);
    y -= 36;
  }

  if (data.title) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text(data.title, x, y);
    y -= 18;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(coverPlace(data), x, y);
}

function addPhotoPage(doc, photo, label, page, total, agencyName) {
  drawPagePhoto(doc, photo);
  setText(doc, [255, 255, 255]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(agencyName || "", 28, PAGE_H - 22);
  doc.text(label, PAGE_W / 2, PAGE_H - 22, { align: "center" });
  doc.text(`${page} / ${total}`, PAGE_W - 28, PAGE_H - 22, { align: "right" });
}

async function addListingPage(doc, dataUrl) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const px = 2;
  canvas.width = Math.max(1, Math.round(PAGE_W * px));
  canvas.height = Math.max(1, Math.round(PAGE_H * px));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#081d56";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  doc.addPage([PAGE_W, PAGE_H], "landscape");
  addCanvasImage(doc, canvas, 0, 0, PAGE_W, PAGE_H);
}

function addFallbackListingPage(doc, data, photo) {
  doc.addPage([PAGE_W, PAGE_H], "landscape");
  drawPagePhoto(doc, photo, true);
  const x = 36;
  let y = 72;
  setText(doc, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(String(data.propertyName || "Listing"), x, y);
  y += 28;
  if (data.location) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(String(data.location), x, y);
    y += 26;
  }
  if (data.price) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.text(String(data.price), x, y);
    y += 40;
  }
  const facts = [
    data.bedrooms ? `${data.bedrooms} Beds` : "",
    data.area ? `${data.area} Sq. Ft.` : "",
    data.cheques ? `${data.cheques} Cheques` : "",
    data.term || "",
  ].filter(Boolean);
  if (facts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(facts.join("    "), x, y);
    y += 28;
  }
  if (data.agentName || data.phone || data.email) {
    doc.setFontSize(11);
    doc.text(
      [data.agentName, data.phone, data.email].filter(Boolean).join("  ·  "),
      x,
      PAGE_H - 28
    );
  }
}

function savePdf(doc, filename) {
  const blob = doc.output("blob");
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}

export function brochurePagePlan(data) {
  const urls = [...new Set((data.photos || []).filter(Boolean))].slice(
    0,
    MAX_GALLERY
  );
  const gallery = urls.slice(1);
  const total = 1 + gallery.length + 1;
  return {
    photos: urls,
    pages: [
      {
        type: "cover",
        caption: "Cover",
        photo: urls[0] || "",
        place: coverPlace(data),
        hook: data.title || "",
        price: data.price || "",
        facts: coverFacts(data),
      },
      ...gallery.map((photo, index) => ({
        type: "photo",
        caption: `Photo ${index + 2} of ${total}`,
        photo,
        label: data.propertyName || "Listing",
        page: index + 2,
        total,
      })),
      {
        type: "listing",
        caption: "Listing",
        photo: urls[0] || "",
      },
    ],
  };
}

export async function buildBrochurePdf(data, onProgress, listingImage) {
  imageAlias = 0;
  const urls = [...new Set((data.photos || []).filter(Boolean))].slice(
    0,
    MAX_GALLERY
  );
  if (!urls.length) {
    throw new Error("No listing photos to put in the brochure.");
  }

  const photos = [];
  for (let i = 0; i < urls.length; i += 1) {
    onProgress?.(`Loading photo ${i + 1} of ${urls.length}…`);
    try {
      const photo = await preparePhoto(urls[i]);
      if (photo) photos.push(photo);
    } catch {
      /* skip a broken image */
    }
  }
  if (!photos.length) {
    throw new Error("Could not load the listing photos.");
  }

  const gallery = photos.slice(1);
  const total = 1 + gallery.length + 1;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [PAGE_W, PAGE_H],
    compress: true,
  });

  onProgress?.("Building cover…");
  addCover(doc, data, photos[0]);

  gallery.forEach((photo, index) => {
    onProgress?.(`Adding photo page ${index + 1} of ${gallery.length}…`);
    doc.addPage([PAGE_W, PAGE_H], "landscape");
    addPhotoPage(
      doc,
      photo,
      data.propertyName || "Listing",
      index + 2,
      total,
      data.agencyName
    );
  });

  onProgress?.("Adding listing page…");
  if (listingImage) {
    await addListingPage(doc, listingImage);
  } else {
    addFallbackListingPage(doc, data, photos[0]);
  }

  onProgress?.("Saving PDF…");
  try {
    savePdf(doc, filenameFrom(data));
  } catch (err) {
    throw new Error(err?.message || "Could not save the brochure.");
  }
}
