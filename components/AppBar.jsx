"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/app/actions";
import { useAppTransition } from "@/components/AppTransition";
import { SiteLogo } from "@/components/SiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { titleFromPath } from "@/lib/app-nav.js";

const AppBarSlotContext = createContext(() => {});

export function AppBarProvider({ children }) {
  const [slot, setSlot] = useState(null);

  return (
    <AppBarSlotContext.Provider value={setSlot}>
      <AppBar extras={slot} />
      {children}
    </AppBarSlotContext.Provider>
  );
}

export function AppBarSlot({ children }) {
  const setSlot = useContext(AppBarSlotContext);

  useLayoutEffect(() => {
    setSlot(children);
    return () => setSlot(null);
  }, [children, setSlot]);

  return null;
}

function AppBar({ extras }) {
  const { title, titleMotion, phase } = useAppTransition();
  const label = title || titleFromPath("/app");

  return (
    <header className={`listly-bar${phase === "leave" ? " is-leave" : ""}`}>
      <div className="listly-bar-start">
        <SiteLogo className="listly-bar-brand" href="/" />
        <div className="listly-bar-title-well">
          <h1 key={label} className={`listly-bar-title${titleMotion === "idle" ? "" : ` is-${titleMotion}`}`}>
            {label}
          </h1>
        </div>
      </div>
      <div className="listly-bar-actions">
        {extras}
        <Link className="ghost" href="/app" prefetch>
          Projects
        </Link>
        <Link className="ghost" href="/app/settings" prefetch>
          Settings
        </Link>
        <ThemeToggle />
        <form action={signOut}>
          <button className="ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
