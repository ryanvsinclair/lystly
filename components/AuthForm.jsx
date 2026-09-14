"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LIQUID_MESH_COLORS, LiquidMesh } from "@/components/LiquidMesh";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [wantsDownload, setWantsDownload] = useState(false);

  useEffect(() => {
    try {
      setWantsDownload(Boolean(window.sessionStorage.getItem("lystly.download")));
    } catch {
      setWantsDownload(false);
    }
  }, []);

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
        if (data.user && !data.session) {
          setNote("Check your inbox to confirm your email, then log in.");
          return;
        }
      } else {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signError) throw signError;
      }
      window.location.assign("/app");
    } catch (err) {
      setError(err.message || "Could not continue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-mesh">
        <LiquidMesh colors={[...LIQUID_MESH_COLORS]} playWhenVisible={false} />
      </div>
      <form className="auth-card" onSubmit={onSubmit}>
        <Link className="site-logo" href="/">
          Lystly
        </Link>
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
        {note ? <p className="auth-note">{note}</p> : null}
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
    </div>
  );
}
