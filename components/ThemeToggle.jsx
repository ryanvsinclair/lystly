"use client";

import { SlideToggle } from "@/components/SlideToggle";
import { useThemeState } from "@/components/ThemeState";

export function ThemeToggle() {
  const { mode, setAppearance } = useThemeState();

  return (
    <SlideToggle
      className="theme-mode"
      ariaLabel="Color mode"
      value={mode}
      options={[
        { id: "light", label: "Light" },
        { id: "dark", label: "Dark" },
      ]}
      onChange={(next) => {
        if (next !== mode) setAppearance({ mode: next });
      }}
    />
  );
}
