import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | PokeExplorer",
    default: "PokeExplorer – Discover Pokémon",
  },
  description: "Browse and discover Pokémon from the official PokéAPI",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PokeExplorer",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontPreconnect =
    process.env.NEXT_PUBLIC_FONT_PRECONNECT_URL ?? "https://api.fontshare.com";
  const fontStylesheet =
    process.env.NEXT_PUBLIC_FONT_STYLESHEET_URL ??
    "https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap";

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href={fontPreconnect} />
        <link rel="stylesheet" href={fontStylesheet} />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white mt-16 py-8">
          <div className="w-full px-6 lg:px-8 text-center">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} PokeExplorer — Built with Next.js
              &amp; PokéAPI for Checkit
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
