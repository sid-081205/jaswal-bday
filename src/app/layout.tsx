import type { Metadata, Viewport } from "next";
import { Bangers, Caveat, Fredoka, Press_Start_2P } from "next/font/google";
import "./globals.css";

const bangers = Bangers({ variable: "--font-bangers", weight: "400", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const pixel = Press_Start_2P({ variable: "--font-pixel", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "⚠️ URGENT: a message for Navya Jaswal",
  description: "An extremely late, extremely sorry, extremely unhinged birthday experience.",
};

export const viewport: Viewport = {
  themeColor: "#14001f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bangers.variable} ${caveat.variable} ${fredoka.variable} ${pixel.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
