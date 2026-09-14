"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";

export const LIQUID_MESH_COLORS = ["#059669", "#0ea5e9", "#eab308", "#042f2e"];

export const LIQUID_MESH_ON_WHITE = [
  "#ffffff",
  "#ffffff",
  "#059669",
  "#0ea5e9",
  "#eab308",
  "#f5f5f7",
];

export function LiquidMesh({
  colors = [...LIQUID_MESH_COLORS],
  distortion = 1,
  swirl = 0.85,
  speed = 0.85,
  grainMixer = 0,
  grainOverlay = 0,
  offsetX,
  offsetY,
  scale,
  rotation,
  className,
  style,
  playWhenVisible = true,
}) {
  const rootRef = useRef(null);
  const intersectingRef = useRef(!playWhenVisible);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const canRun = () =>
      intersectingRef.current &&
      document.visibilityState === "visible" &&
      document.hasFocus();

    const sync = () => setActive(canRun());

    intersectingRef.current = !playWhenVisible;
    sync();

    const io = new IntersectionObserver(
      ([entry]) => {
        intersectingRef.current = entry.isIntersecting;
        sync();
      },
      {
        root: null,
        rootMargin: playWhenVisible ? "120px 0px" : "0px",
        threshold: 0.01,
      }
    );
    io.observe(el);

    window.addEventListener("focus", sync);
    window.addEventListener("blur", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      window.removeEventListener("focus", sync);
      window.removeEventListener("blur", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [playWhenVisible]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {active ? (
        <MeshGradient
          colors={colors}
          distortion={distortion}
          swirl={swirl}
          speed={speed}
          grainMixer={grainMixer}
          grainOverlay={grainOverlay}
          offsetX={offsetX}
          offsetY={offsetY}
          scale={scale}
          rotation={rotation}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: "100%",
            height: "100%",
            background: staticMeshFallback(colors),
          }}
        />
      )}
    </div>
  );
}

function staticMeshFallback(colors) {
  const a = colors[0] ?? "#059669";
  const b = colors[1] ?? a;
  const c = colors[2] ?? b;
  return `linear-gradient(125deg, ${a} 0%, ${b} 48%, ${c} 100%)`;
}
