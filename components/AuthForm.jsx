"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LIQUID_MESH_COLORS, LiquidMesh } from "@/components/LiquidMesh";
import { SiteLogo } from "@/components/SiteLogo";
import { markAppEnter } from "@/lib/app-nav.js";
import { useMeshPageMotion } from "@/lib/use-mesh-page-motion.js";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const { pageClass } = useMeshPageMotion(isSignup ? "/signup" : "/login");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [wantsDownload, setWantsDownload] = useState(false);
  const morphRef = useRef(null);

  useEffect(() => {
    try {
      setWantsDownload(Boolean(window.sessionStorage.getItem("lystly.download")));
    } catch {
      setWantsDownload(false);
    }
  }, []);

  function playCreated() {
    const el = morphRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el) {
      if (reduceMotion) {
        el.style.width = "88px";
        el.style.height = "88px";
      } else {
        el.style.width = `${el.offsetWidth}px`;
        el.style.height = `${el.offsetHeight}px`;
      }
    }
    setCreated(true);
    if (reduceMotion) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!morphRef.current) return;
        morphRef.current.style.width = "88px";
        morphRef.current.style.height = "88px";
      });
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setNote("");

    if (!hasSupabaseEnv()) {
      setError("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirm_password") || "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError("Those passwords do not match.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    try {
      if (isSignup) {
        const { data, error: signError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (signError) throw signError;
        const confirmEmail = Boolean(data.user && !data.session);
        setNeedsConfirm(confirmEmail);
        playCreated();
        setNote(
          confirmEmail
            ? "Check your inbox to confirm your email, then log in."
            : "You're in.",
        );
        if (!confirmEmail) {
          window.setTimeout(() => {
            markAppEnter();
            window.location.assign("/app");
          }, 1800);
        }
        return;
      } else {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signError) throw signError;
      }
      markAppEnter();
      window.location.assign("/app");
    } catch (err) {
      setError(err.message || "Could not continue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={pageClass}>
      <div className="auth-mesh">
        <LiquidMesh colors={[...LIQUID_MESH_COLORS]} playWhenVisible={false} />
        <div className="auth-mesh-veil" aria-hidden />
      </div>
      <div className={`auth-stage${created ? " is-created" : ""}`}>
        <div className="auth-morph" ref={morphRef}>
          <form
            className="auth-card"
            onSubmit={onSubmit}
            aria-hidden={created}
            inert={created || undefined}
          >
            <SiteLogo tone="white" />
            <h1>{isSignup ? "Create an account" : "Log in"}</h1>
            <p>
              {wantsDownload
                ? isSignup
                  ? "Create an account to download the square, PDF, or photo folder."
                  : "Log in to download the square, PDF, or photo folder."
                : isSignup
                  ? "Save listings and come back to them."
                  : "Open your saved listing studio projects."}
            </p>
            {error ? <p className="auth-error">{error}</p> : null}
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </label>
            {isSignup ? (
              <label>
                Confirm password
                <input
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
            ) : null}
            <button className="btn-primary" type="submit" disabled={pending}>
              {pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}
            </button>
            <p className="auth-switch">
              {isSignup ? (
                <>
                  Already have an account? <Link href="/login">Log in</Link>
                </>
              ) : (
                <>
                  New here? <Link href="/signup">Get started</Link>
                </>
              )}
            </p>
          </form>
          <div className="auth-created-mark" aria-hidden={!created}>
            <svg viewBox="0 0 52 52" fill="none">
              <path
                className="auth-created-tick"
                d="M14 27.2l8.2 8.2L38.4 17.6"
                stroke="#042f2e"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {created ? (
          <div className="auth-created-copy" aria-live="polite">
            <p className="auth-created-msg">{note}</p>
            {needsConfirm ? (
              <p className="auth-switch">
                Already confirmed? <Link href="/login">Log in</Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
