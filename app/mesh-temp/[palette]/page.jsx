import { notFound } from "next/navigation";
import { LandingMock } from "../LandingMock";
import { LANDING_PALETTES } from "../palettes";

export const metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return Object.keys(LANDING_PALETTES).map((palette) => ({ palette }));
}

export default async function LandingMockPage({ params }) {
  const { palette } = await params;
  if (!LANDING_PALETTES[palette]) notFound();
  return <LandingMock paletteId={palette} />;
}
