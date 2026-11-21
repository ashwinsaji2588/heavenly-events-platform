import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heavenly Events | Luxury Event Planning & Stage Décor in Punalur",
  description:
    "Heavenly Events crafts bespoke weddings, grand receptions, and intimate celebrations in Punalur, Kerala. View our setups and plan your celebration.",
};

export const viewport: Viewport = {
  themeColor: "#141813",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark">
        {children}
      </body>
    </html>
  );
}
