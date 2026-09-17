"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  afterPaint,
  cleanAppPath,
  clearEnterFlags,
  isAppPath,
  isAuthMeshPath,
  isHomePath,
  markAppEnter,
  markAuthSwap,
  markHomeEnter,
  takeAppEnter,
  takeAuthEnter,
  takeAuthSwap,
} from "@/lib/app-nav.js";

const MESH_IN_MS = 700;
const UI_IN_MS = 480;
const UI_OUT_MS = 420;
const MESH_OUT_MS = 560;
const SWAP_OUT_MS = 280;
const SWAP_IN_MS = 320;

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMeshPageMotion(currentPath) {
  const router = useRouter();
  const [intro, setIntro] = useState("idle");
  const [outro, setOutro] = useState("idle");
  const destRef = useRef("");
  const outroRef = useRef(outro);
  outroRef.current = outro;

  useLayoutEffect(() => {
    if (takeAuthSwap()) {
      if (prefersReduced()) {
        clearEnterFlags();
        return;
      }
      setIntro("swap");
      return;
    }
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

  useEffect(() => {
    if (intro !== "swap") return undefined;
    return afterPaint(() => setIntro("swap-on"));
  }, [intro]);

  useEffect(() => {
    if (intro !== "swap-on") return undefined;
    const timer = window.setTimeout(() => {
      setIntro("done");
      clearEnterFlags();
    }, SWAP_IN_MS);
    return () => window.clearTimeout(timer);
  }, [intro]);

  const leaveTo = useCallback(
    (path) => {
      if (outroRef.current !== "idle") return;
      const next = cleanAppPath(path);
      if (prefersReduced()) {
        if (isHomePath(next)) markHomeEnter();
        else if (isAppPath(next)) markAppEnter();
        else if (isAuthMeshPath(next)) markAuthSwap();
        router.push(next);
        return;
      }
      destRef.current = next;
      if (isHomePath(next) || isAppPath(next)) {
        if (isHomePath(next)) markHomeEnter();
        else markAppEnter();
        setOutro("ui-off");
        return;
      }
      if (isAuthMeshPath(next) && next !== currentPath) {
        markAuthSwap();
        setOutro("swap-off");
      }
    },
    [currentPath, router],
  );

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
      const path = cleanAppPath(next.pathname);
      const leavingMesh =
        isHomePath(path) || isAppPath(path) || (isAuthMeshPath(path) && path !== currentPath);
      if (!leavingMesh) return;
      event.preventDefault();
      leaveTo(path);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [currentPath, leaveTo]);

  useEffect(() => {
    if (outro !== "ui-off") return undefined;
    const timer = window.setTimeout(() => setOutro("mesh-off"), UI_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [outro]);

  useEffect(() => {
    if (outro !== "mesh-off") return undefined;
    const timer = window.setTimeout(() => {
      router.push(destRef.current || "/");
    }, MESH_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [outro, router]);

  useEffect(() => {
    if (outro !== "swap-off") return undefined;
    const timer = window.setTimeout(() => {
      router.push(destRef.current);
    }, SWAP_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [outro, router]);

  const pageClass = [
    "auth-page",
    intro !== "idle" && intro !== "done" ? `is-intro is-${intro}` : "",
    outro !== "idle" ? `is-outro is-${outro}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { intro, outro, leaveTo, pageClass };
}
