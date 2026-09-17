"use client";

import { useState } from "react";
import { completeOnboarding, lookupAgencyAction } from "@/app/onboarding/actions";
import { LIQUID_MESH_COLORS, LiquidMesh } from "@/components/LiquidMesh";
import { SiteLogo } from "@/components/SiteLogo";
import { useMeshPageMotion } from "@/lib/use-mesh-page-motion.js";

export function OnboardingForm() {
  const { pageClass } = useMeshPageMotion("/onboarding");
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
    if (result.homepage) setHomepage(result.homepage);
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
    <div className={`${pageClass} is-onboarding`}>
      <div className="auth-mesh">
        <LiquidMesh colors={[...LIQUID_MESH_COLORS]} playWhenVisible={false} />
        <div className="auth-mesh-veil" aria-hidden />
      </div>
      <div className="auth-stage">
        <form className={`auth-card${isNewAgency ? " is-new-agency" : ""}`} onSubmit={onSubmit}>
        <div className="onboard-head">
          <SiteLogo tone="white" />
          <h1>Set up your studio</h1>
          <p>Paste your agency homepage, then add the logo and your cutout.</p>
          {error ? <p className="auth-error">{error}</p> : null}
        </div>

        <div className="onboard-fields">
          <label className="onboard-span">
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
            <p className="auth-note onboard-span">
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
                <span className="auth-tip">Transparent background works best.</span>
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
          <label className="onboard-span">
            Agent cutout
            <input name="cutout" type="file" accept="image/png,image/webp" required />
            <span className="auth-tip">Use a PNG with a transparent background.</span>
          </label>
        </div>

        <button className="btn-primary" type="submit" disabled={pending || !lookup}>
          {pending ? "Saving…" : "Continue"}
        </button>
        </form>
      </div>
    </div>
  );
}
