"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  afterPaint,
  cleanAppPath,
  clearEnterFlags,
  clearForeignEnterFlags,
  isAppPath,
  isHomePath,
  markHomeEnter,
  takeAppEnter,
  titleFromPath,
} from "@/lib/app-nav.js";

export const EXIT_MS = 280;
export const LEAVE_MS = 320;
export const ARRIVE_BAR_MS = 320;
export const WASH_MS = 520;
export const TITLE_IN_MS = 260;
export const CONTENT_IN_MS = 340;
export const MIN_SPIN_MS = 320;

const AppTransitionContext = createContext({
  phase: "idle",
  title: "Projects",
  titleMotion: "idle",
  navigate: null,
});

export function useAppTransition() {
  return useContext(AppTransitionContext);
}

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AppTransition({ children }) {
  const pathname = usePathname() || "/app";
  const router = useRouter();
  const [phase, setPhase] = useState("idle");
  const [title, setTitle] = useState(titleFromPath(pathname));
  const [titleMotion, setTitleMotion] = useState("idle");
  const pending = useRef("");
  const shownPath = useRef(cleanAppPath(pathname));
  const startedAt = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const navigate = useMemo(() => {
    return function navigate(href) {
      const path = cleanAppPath(href);
      if (isHomePath(path)) {
        if (phaseRef.current === "leave") return;
        markHomeEnter();
        pending.current = "/";
        if (prefersReduced()) {
          router.push("/");
          return;
        }
        startedAt.current = Date.now();
        setPhase("leave");
        return;
      }
      if (!isAppPath(path)) {
        window.location.assign(href);
        return;
      }
      if (path === cleanAppPath(pathname) && phaseRef.current === "idle") return;
      if (path === pending.current && phaseRef.current !== "idle") return;

      pending.current = path;

      if (prefersReduced()) {
        shownPath.current = path;
        setTitle(titleFromPath(path));
        setTitleMotion("idle");
        setPhase("idle");
        if (path !== cleanAppPath(pathname)) router.push(path);
        return;
      }

      startedAt.current = Date.now();

      if (phaseRef.current === "load" || phaseRef.current === "title" || phaseRef.current === "in") {
        setTitleMotion("out");
        setPhase("load");
        router.push(path);
        return;
      }

      setTitleMotion("out");
      setPhase("out");
    };
  }, [pathname, router]);

  useEffect(() => {
    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const path = cleanAppPath(url.pathname);
      if (!isAppPath(path) && !isHomePath(path)) return;
      event.preventDefault();
      navigate(path);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  useLayoutEffect(() => {
    clearForeignEnterFlags();
    if (!takeAppEnter()) {
      delete document.documentElement.dataset.appEnter;
      return;
    }
    if (prefersReduced()) {
      clearEnterFlags();
      return;
    }
    document.documentElement.dataset.appEnter = "1";
    setPhase("arrive-hold");
  }, []);

  useEffect(() => {
    if (phase !== "arrive-hold") return undefined;
    return afterPaint(() => setPhase("wash"));
  }, [phase]);

  useEffect(() => {
    if (phase !== "wash") return undefined;
    delete document.documentElement.dataset.appEnter;
    const timer = window.setTimeout(() => {
      setPhase("arrive");
    }, WASH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "arrive") return undefined;
    const timer = window.setTimeout(() => {
      setPhase("in");
    }, ARRIVE_BAR_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useLayoutEffect(() => {
    const shell = document.querySelector(".app-shell");
    if (!shell) return undefined;
    shell.classList.toggle("is-leave", phase === "leave");
    shell.classList.toggle("is-arrive-hold", phase === "arrive-hold");
    shell.classList.toggle("is-wash", phase === "wash" || phase === "arrive");
    shell.classList.toggle("is-arrive", phase === "arrive");
    return () => {
      shell.classList.remove("is-leave", "is-arrive-hold", "is-wash", "is-arrive");
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leave") return undefined;
    const timer = window.setTimeout(() => {
      router.push("/");
    }, LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, router]);

  useEffect(() => {
    if (phase !== "out") return undefined;
    const timer = window.setTimeout(() => {
      const path = pending.current;
      setPhase("load");
      if (path && cleanAppPath(pathname) !== path) router.push(path);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, pathname, router]);

  useLayoutEffect(() => {
    const next = cleanAppPath(pathname);
    if (pending.current) return;
    if (next === shownPath.current) return;
    pending.current = next;
    startedAt.current = Date.now();
    if (prefersReduced()) {
      shownPath.current = next;
      setTitle(titleFromPath(next));
      setTitleMotion("idle");
      setPhase("idle");
      return;
    }
    setTitleMotion("out");
    setPhase("load");
  }, [pathname]);

  const value = useMemo(
    () => ({
      phase,
      title,
      titleMotion,
      navigate,
      setPhase,
      setTitle,
      setTitleMotion,
      pending,
      shownPath,
      startedAt,
    }),
    [phase, title, titleMotion, navigate]
  );

  return <AppTransitionContext.Provider value={value}>{children}</AppTransitionContext.Provider>;
}

function Loop() {
  return (
    <div className="app-page-loop" aria-busy="true" aria-live="polite">
      <i className="app-page-spinner" />
    </div>
  );
}

export function AppTransitionBody({ children }) {
  const { phase, setPhase, setTitle, setTitleMotion, pending, shownPath, startedAt } = useAppTransition();
  const pathname = usePathname() || "/app";

  useEffect(() => {
    if (phase !== "load") return undefined;

    function finish() {
      const path = pending.current || cleanAppPath(pathname);
      shownPath.current = path;
      setTitle(titleFromPath(path));
      setTitleMotion("in");
      setPhase("title");
    }

    const path = pending.current;
    const ready = !path || cleanAppPath(pathname) === path;
    const wait = Math.max(0, MIN_SPIN_MS - (Date.now() - startedAt.current));

    if (ready) {
      const timer = window.setTimeout(finish, wait);
      return () => window.clearTimeout(timer);
    }

    const failsafe = window.setTimeout(finish, 4000);
    return () => window.clearTimeout(failsafe);
  }, [phase, pathname, pending, setPhase, setTitle, setTitleMotion, shownPath, startedAt]);

  useEffect(() => {
    if (phase !== "title") return undefined;
    const timer = window.setTimeout(() => {
      setTitleMotion("idle");
      setPhase("in");
    }, TITLE_IN_MS);
    return () => window.clearTimeout(timer);
  }, [phase, setPhase, setTitleMotion]);

  useEffect(() => {
    if (phase !== "in") return undefined;
    const timer = window.setTimeout(() => {
      pending.current = "";
      clearEnterFlags();
      setPhase("idle");
    }, CONTENT_IN_MS);
    return () => window.clearTimeout(timer);
  }, [phase, pending, setPhase]);

  return (
    <div className="app-shell-stage">
      {phase === "load" ? <Loop /> : null}
      <div
        className={[
          "app-shell-page",
          phase === "out" || phase === "leave" ? "is-out" : "",
          phase === "load" ||
          phase === "title" ||
          phase === "arrive-hold" ||
          phase === "wash" ||
          phase === "arrive"
            ? "is-wait"
            : "",
          phase === "in" ? "is-in" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={phase === "load" || phase === "title" || undefined}
      >
        {children}
      </div>
    </div>
  );
}
