export const metadata = {
  title: "GLØD MARKETS · Markedsintelligens",
  description: "Aktiekurser, bevægelser, logoer og nyheder samlet ét sted.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body style={{ margin: 0, background: "#080a0f" }}>{children}</body>
    </html>
  );
}
