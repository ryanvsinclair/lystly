import { LandingMockIndex } from "./LandingMock";

export const metadata = {
  title: "Landing mocks · Lystly",
  robots: { index: false, follow: false },
};

export default function MeshTempPage() {
  return <LandingMockIndex />;
}
