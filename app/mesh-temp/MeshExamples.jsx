"use client";

import { LiquidMesh } from "@/components/LiquidMesh";
import "./mesh-temp.css";

const EXAMPLES = [
  {
    id: "valley",
    name: "Valley (reference)",
    note: "Same triad as your other site. This is the look we were missing.",
    colors: ["#059669", "#0ea5e9", "#eab308", "#042f2e"],
  },
  {
    id: "cream",
    name: "Lystly on cream",
    note: "White + cream so the field dissolves, navy and blue as the liquid.",
    colors: ["#ffffff", "#ece7dc", "#081d56", "#1754ea", "#f4f0e8"],
  },
  {
    id: "navy",
    name: "Lystly navy slab",
    note: "Deep field, no white. Reads as a solid liquid panel.",
    colors: ["#071433", "#081d56", "#1754ea", "#0c2466"],
  },
  {
    id: "ink",
    name: "Lystly ink on paper",
    note: "Cream page, quieter blues, almost no electric accent.",
    colors: ["#ffffff", "#f4f0e8", "#10182c", "#081d56", "#ece7dc"],
  },
];

function MeshCard({ example }) {
  return (
    <article className="mesh-card">
      <LiquidMesh colors={example.colors} playWhenVisible={false} />
      <div className="mesh-card-copy">
        <h2>{example.name}</h2>
        <p>{example.note}</p>
        <div className="mesh-swatches">
          {example.colors.map((color) => (
            <span key={color}>
              <i style={{ background: color }} />
              {color}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function MeshExamples() {
  return (
    <div className="mesh-temp">
      <header className="mesh-temp-head">
        <h1>Paper MeshGradient tests</h1>
        <p>
          Same LiquidMesh wrapper as Valley: Paper shader, distortion 1, swirl
          0.85, speed 0.85. Only the colors change.
        </p>
      </header>
      <div className="mesh-grid">
        {EXAMPLES.map((example) => (
          <MeshCard key={example.id} example={example} />
        ))}
      </div>
    </div>
  );
}
