import { Archivo, Barlow_Condensed, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "AAA Doors — Stock Control",
  description:
    "Inventory in/out tracking with facilities, truck dispatch proof and role-based access for AAA Doors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${barlow.variable} ${plexMono.variable} ${playfair.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
