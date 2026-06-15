import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GLØD MARKETS · Aktier & Krypto i realtid";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #080a0f 0%, #0d1320 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 8,
            background: "linear-gradient(90deg, #f5a623, #ffce6e)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#f5a623", display: "flex" }} />
          <div style={{ color: "#f5a623", fontSize: 26, letterSpacing: 6, fontWeight: 600 }}>
            MARKEDSINTELLIGENS · REALTID
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 106, fontWeight: 800, letterSpacing: -2 }}>
          <span style={{ color: "#f5a623" }}>GLØD</span>
          <span style={{ color: "#eef1f6" }}>&nbsp;MARKETS</span>
        </div>
        <div
          style={{
            display: "flex",
            color: "#8a93a6",
            fontSize: 34,
            marginTop: 24,
            maxWidth: 860,
            textAlign: "center",
          }}
        >
          Aktier &amp; krypto i realtid — live kurser, grafer og nyheder samlet ét sted.
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
          {["NVDA", "BTC", "TSLA", "ETH", "SPCX"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                color: "#cdd3df",
                fontSize: 26,
                background: "#10141d",
                border: "1px solid #1d2230",
                borderRadius: 30,
                padding: "10px 22px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
