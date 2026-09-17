import { Fraunces, Montserrat, Outfit, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

export const metadata = {
  title: "Lystly",
  description: "Create listing squares and brochures from a link.",
  icons: {
    icon: [
      { url: "/brand/lystly-l.png", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/brand/lystly-l-white.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${montserrat.variable} ${playfair.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className={outfit.className} style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,s=sessionStorage,p=location.pathname.replace(/\\/+$/,"")||"/";function take(k,a,ok){if(s.getItem(k)!=="1")return;if(ok)d.dataset[a]="1";else s.removeItem(k)}take("lystly.home-enter","homeEnter",p==="/");take("lystly.app-enter","appEnter",p.indexOf("/app")===0);take("lystly.auth-enter","authEnter",p==="/login"||p==="/signup")}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
