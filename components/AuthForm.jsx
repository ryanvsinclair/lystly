"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LIQUID_MESH_COLORS, LiquidMesh } from "@/components/LiquidMesh";
import { SiteLogo } from "@/components/SiteLogo";
import {
  afterPaint,
  cleanAppPath,
  clearEnterFlags,
  isHomePath,
  markAppEnter,
  markHomeEnter,
  takeAppEnter,
  takeAuthEnter,
} from "@/lib/app-nav.js";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const MESH_IN_MS = 700;
const UI_IN_MS = 480;
const UI_OUT_MS = 420;
const MESH_OUT_MS = 560;

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AuthForm({ mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [wantsDownload, setWantsDownload] = useState(false);
  const [intro, setIntro] = useState("idle");
  const [outro, setOutro] = useState("idle");
  const morphRef = useRef(null);
  const outroRef = useRef(outro);
  outroRef.current = outro;

  useEffect(() => {
    try {
      setWantsDownload(Boolean(window.sessionStorage.getItem("lystly.download")));
    } catch {
      setWantsDownload(false);
    }
  }, []);

  useLayoutEffect(() => {
    const flagged = takeAuthEnter() || takeAppEnter();
    if (!flagged) return;
    if (prefersReduced()) {
      clearEnterFlags();
      return;
    }
    document.documentElement.dataset.authEnter = "1";
    setIntro("mesh");
  }, []);

  useEffect(() => {
    if (intro !== "mesh") return undefined;
    return afterPaint(() => setIntro("mesh-on"));
  }, [intro]);

  useEffect(() => {
    if (intro !== "mesh-on") return undefined;
    const timer = window.setTimeout(() => setIntro("ui-on"), MESH_IN_MS);
    return () => window.clearTimeout(timer);
  }, [intro]);

  useEffect(() => {
    if (intro !== "ui-on") return undefined;
    const timer = window.setTimeout(() => {
      setIntro("done");
      clearEnterFlags();
    }, UI_IN_MS);
    return () => window.clearTimeout(timer);
  }, [intro]);

  function leaveHome() {
    if (outroRef.current !== "idle") return;
    if (prefersReduced()) {
      markHomeEnter();
      router.push("/");
      return;
    }
    markHomeEnter();
    setOutro("ui-off");
  }

  useEffect(() => {
    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      const next = new URL(link.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (!isHomePath(cleanAppPath(next.pathname))) return;
      event.preventDefault();
      leaveHome();
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (outro !== "ui-off") return undefined;
    const timer = window.setTimeout(() => setOutro("mesh-off"), UI_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [outro]);

  useEffect(() => {
    if (outro !== "mesh-off") return undefined;
    const timer = window.setTimeout(() => {
      router.push("/");
    }, MESH_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [outro, router]);

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
    if (!email || !password) {
      setError("Enter your email and password.");
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

  const pageClass = [
    "auth-page",
    intro !== "idle" && intro !== "done" ? `is-intro is-${intro}` : "",
    outro !== "idle" ? `is-outro is-${outro}` : "",
  ]
    .filter(Boolean)
    .join(" ");

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
