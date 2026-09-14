import { Montserrat, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Lystly",
  description: "Create listing squares and brochures from a link.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${montserrat.variable}`}>
      <body className={outfit.className} style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
