"use client";

import Link from "next/link";
import { useState } from "react";
import { HomePreview } from "@/components/HomePreview";
import { LIQUID_MESH_COLORS, LiquidMesh } from "@/components/LiquidMesh";
import {
  comingSoonMessage,
  isSupportedListingLink,
  parseListingUrl,
  portalFromHostname,
} from "@/lib/listing-sites.js";

const OOPS_LINK = "Oops that wasnt a link! Try again!";
import "@/src/styles.css";

const SAMPLE = {
  propertyName: "District One Villas",
  location: "Mohammed Bin Rashid City, Dubai",
  title: "Exclusive | Corner Villa | Luxury Furnished",
  bedrooms: "6",
  bathrooms: "7",
  area: "12,397",
  price: "AED 2,500,000",
  priceLabel: "Annual Rent",
  cheques: "1",
  term: "1y+",
  termLabel: "Lease Term",
  furnished: "Furnished",
  propertyType: "Villa",
  photo:
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/38dfbae8-4f76-4c65-b4e7-30530dc58047/1312x894.jpg?v=37332dadff0b4b16a6d962c876b326fa",
  photos: [
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/38dfbae8-4f76-4c65-b4e7-30530dc58047/1312x894.jpg?v=37332dadff0b4b16a6d962c876b326fa",
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/c0827f7e-2263-40bf-bd35-36f7da01e485/1312x894.jpg?v=db6cdcf9d4f87aef292f240b572b5811",
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/2a899c33-a537-4c25-9958-970688372f05/1312x894.jpg?v=54216c2c02c269169798bb7b198761d1",
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/97ae8a81-eb90-4bdb-ab8c-5a4991636f91/1312x894.jpg?v=4b46ea0ed3ddef9647066635a1236284",
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/75ffcb8b-a2e2-41d2-a345-169aa1fe5dac/1312x894.jpg?v=9287ce84754157d300a3b99601eb7e05",
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/77934da1-e719-4c60-bb9d-370315a61a57/1312x894.jpg?v=d23b9872032f4283b72de6dd525e9737",
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/74c0df6e-c4b8-4ad6-84b0-f780bba1297a/1312x894.jpg?v=24d6b5326e0c5f955fc8cd67eb38188c",
    "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/8e2cdea9-172d-498d-be86-9a79864ab6b2/1312x894.jpg?v=b9aa4bc0566c283fe9600c8ce824d7ee",
  ],
};

export function HomeLanding() {
  const [url, setUrl] = useState("");
  const [listing, setListing] = useState(SAMPLE);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [filled, setFilled] = useState(false);
  const [busy, setBusy] = useState(false);

  function rejectUnsupportedLink(raw) {
    if (isSupportedListingLink(raw)) return false;
    const parsed = parseListingUrl(raw);
    const portal = parsed ? portalFromHostname(parsed.hostname) : null;
    setUrl("");
    setError(true);
    setStatus(
      portal && !portal.supported ? comingSoonMessage(raw) : OOPS_LINK
    );
    return true;
  }

  async function fillFromLink(raw) {
    const value = String(raw || url).trim();
    if (rejectUnsupportedLink(value)) return;
    setBusy(true);
    setError(false);
    setStatus("Reading listing…");
    try {
      const response = await fetch(`/api/pf?url=${encodeURIComponent(value)}`);
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "Could not read listing.");
      const next = { ...SAMPLE, ...payload.listing };
      if (!next.photos?.length && next.photo) next.photos = [next.photo];
      setListing(next);
      setFilled(true);
      setUrl(value);
      window.sessionStorage.setItem("lystly.listingUrl", value);
      window.sessionStorage.setItem("lystly.listing", JSON.stringify(next));
      setStatus("Your square is ready. Log in to download.");
    } catch (err) {
      setError(true);
      setStatus(err.message || "Could not read that listing.");
    } finally {
      setBusy(false);
    }
  }

  async function pasteLink() {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        setError(true);
        setStatus(OOPS_LINK);
        return;
      }
      setUrl(text);
      await fillFromLink(text);
    } catch {
      setError(true);
      setStatus("Clipboard blocked. Paste the link into the field.");
    }
  }

  return (
    <div className="home">
      <div className="home-hero">
      <div className="home-mesh">
        <LiquidMesh colors={[...LIQUID_MESH_COLORS]} playWhenVisible={false} />
      </div>

      <div className="home-ui">
        <nav className="site-nav">
          <Link className="site-logo" href="/">
            Lystly
          </Link>
          <div className="site-nav-links">
            <Link className="nav-link" href="/login">
              Log in
            </Link>
            <Link className="nav-cta" href="/signup">
              Get started
            </Link>
          </div>
        </nav>

        <section className="home-demo">
          <div className="home-copy">
            <h1>Listing posts in seconds, not an hour of design.</h1>
            <p>
              Paste a listing from a major real estate portal in the UAE. Preview
              the square or brochure, drop in your cutout, then log in to
              download. Canada support coming soon.
            </p>

            <form
              className="home-paste"
              onSubmit={(event) => {
                event.preventDefault();
                fillFromLink(url);
              }}
            >
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onPaste={(event) => {
                  const text = event.clipboardData?.getData("text")?.trim() || "";
                  if (!text) return;
                  event.preventDefault();
                  if (rejectUnsupportedLink(text)) return;
                  setUrl(text);
                  fillFromLink(text);
                }}
                placeholder="Paste a listing link"
                aria-label="Listing link"
              />
              <button type="button" onClick={pasteLink} disabled={busy}>
                {busy ? "Reading…" : "Paste"}
              </button>
            </form>
            {status ? (
              <p className={`home-paste-status${error ? " is-error" : ""}`}>{status}</p>
            ) : (
              <p className="home-paste-status">Try a live listing link. The preview updates here.</p>
            )}

            <div className="hero-actions">
              <Link
                className="btn-primary"
                href={filled ? "/signup" : "/signup"}
              >
                {filled ? "Save this listing" : "Get started"}
              </Link>
              <Link className="btn-secondary" href="/login">
                Log in
              </Link>
            </div>
          </div>

          <HomePreview listing={listing} />
        </section>
      </div>
      </div>
    </div>
  );
}
