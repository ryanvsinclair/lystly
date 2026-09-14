"use client";

import Link from "next/link";
import { useState } from "react";
import { completeOnboarding, lookupAgencyAction } from "@/app/onboarding/actions";
import { LIQUID_MESH_COLORS, LiquidMesh } from "@/components/LiquidMesh";

export function OnboardingForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [homepage, setHomepage] = useState("");
  const [lookup, setLookup] = useState(null);

  async function onHomepageBlur() {
    const value = homepage.trim();
    if (!value) {
      setLookup(null);
      return;
    }
    setError("");
    const result = await lookupAgencyAction(value);
    if (!result.ok) {
      setLookup(null);
      setError(result.error);
      return;
    }
    setLookup(result);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await completeOnboarding(new FormData(event.currentTarget));
      if (result && !result.ok) setError(result.error || "Could not finish setup.");
    } catch (err) {
      if (typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")) return;
      setError(err.message || "Could not finish setup.");
    } finally {
      setPending(false);
    }
  }

  const isNewAgency = lookup && !lookup.exists;

  return (
    <div className="auth-page">
      <div className="auth-mesh">
        <LiquidMesh colors={[...LIQUID_MESH_COLORS]} playWhenVisible={false} />
      </div>
      <form className="auth-card" onSubmit={onSubmit}>
        <Link className="site-logo" href="/">
          Lystly
        </Link>
        <h1>Set up your studio</h1>
        <p>Paste your agency homepage, then add the logo and your cutout.</p>
        {error ? <p className="auth-error">{error}</p> : null}

        <label>
          Agency homepage
          <input
            name="homepage"
            type="url"
            inputMode="url"
            placeholder="https://youragency.com"
            value={homepage}
            onChange={(event) => {
              setHomepage(event.target.value);
              setLookup(null);
            }}
            onBlur={onHomepageBlur}
            required
          />
        </label>

        {lookup?.exists ? (
          <p className="auth-note">
            You&apos;ll use {lookup.agency.name}&apos;s existing logo.
          </p>
        ) : null}

        {isNewAgency ? (
          <>
            <label>
              Agency name
              <input
                name="agency_name"
                type="text"
                defaultValue={lookup.name || ""}
                required
              />
            </label>
            <label>
              Agency logo
              <input name="logo" type="file" accept="image/png,image/webp,image/jpeg" required />
              <span className="auth-tip">
                Pro tip: the logo should have a transparent background.
              </span>
            </label>
          </>
        ) : null}

        <label>
          Agent name
          <input name="display_name" type="text" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" />
        </label>
        <label>
          Email on the square
          <input name="public_email" type="email" />
        </label>
        <label>
          Instagram
          <input name="instagram" type="text" placeholder="handle" />
        </label>
        <label>
          Agent cutout
          <input name="cutout" type="file" accept="image/png,image/webp" required />
          <span className="auth-tip">
            Pro tip: use a PNG with a transparent background.
          </span>
        </label>

        <button className="btn-primary" type="submit" disabled={pending || !lookup}>
          {pending ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
