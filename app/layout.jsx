export const metadata = {
  metadataBase: new URL("https://xn--gldmarkets-1cb.com"),
  title: {
    default: "GLØD MARKETS · Aktier & Krypto i realtid",
    template: "%s · GLØD MARKETS",
  },
  description:
    "Følg aktier og kryptovalutaer i realtid — live kurser, interaktive grafer, markedsnyheder og dybdegående info om hvert selskab og hver coin. Alt samlet ét sted.",
  keywords: [
    "aktier", "krypto", "kryptovaluta", "aktiekurser", "live kurser",
    "Bitcoin", "Nvidia", "SpaceX aktie", "investering", "børs",
    "markedsnyheder", "aktier realtid", "krypto kurser", "GLØD MARKETS",
  ],
  authors: [{ name: "Adam Mehdi Ben Hassine" }],
  creator: "Adam Mehdi Ben Hassine",
  applicationName: "GLØD MARKETS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: "https://xn--gldmarkets-1cb.com",
    siteName: "GLØD MARKETS",
    title: "GLØD MARKETS · Aktier & Krypto i realtid",
    description:
      "Live kurser, grafer, nyheder og info om aktier og krypto — følg markederne som en professionel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GLØD MARKETS · Aktier & Krypto i realtid",
    description:
      "Live kurser, grafer, nyheder og info om aktier og krypto — alt samlet ét sted.",
    creator: "@glodmarkets",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport = {
  themeColor: "#080a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body style={{ margin: 0, background: "#080a0f" }}>{children}</body>
    </html>
  );
}
