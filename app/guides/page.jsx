import Link from "next/link";
import { ARTICLES } from "./articles";

export const metadata = {
  title: "Guides & Læring — Aktier og krypto forklaret",
  description: "Lær om aktier, kryptovaluta og investering med GLØD MARKETS' guides. Enkle forklaringer for både begyndere og erfarne.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#eef1f6", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .gwrap{max-width:1080px;margin:0 auto;padding:22px;}
        .gnav{display:flex;align-items:center;justify-content:space-between;padding:6px 0 26px;}
        .gbrand{display:flex;align-items:center;gap:9px;font-family:'Sora';font-weight:800;letter-spacing:2px;font-size:16px;color:#eef1f6;}
        .gdot{width:10px;height:10px;border-radius:50%;background:#f5a623;box-shadow:0 0 12px 2px rgba(245,166,35,.7);}
        .gback{color:#8a93a6;font-size:14px;border:1px solid #1d2230;border-radius:10px;padding:8px 14px;}
        .ghero{padding:18px 0 30px;}
        .geyebrow{color:#f5a623;font-size:12px;letter-spacing:4px;text-transform:uppercase;font-weight:600;}
        .gh1{font-family:'Sora';font-weight:800;font-size:clamp(28px,6vw,46px);letter-spacing:-1px;margin:12px 0 0;}
        .gsub{color:#8a93a6;font-size:16px;margin-top:14px;max-width:60ch;line-height:1.6;}
        .ggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding-bottom:60px;}
        .gcard{display:block;background:linear-gradient(180deg,#10141d,#0d1118);border:1px solid #1d2230;border-radius:18px;padding:22px;transition:transform .2s,border-color .2s;}
        .gcard:hover{transform:translateY(-4px);border-color:rgba(245,166,35,.45);}
        .gtag{display:inline-block;font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:#f5a623;background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.25);padding:4px 10px;border-radius:20px;}
        .gtitle{font-family:'Sora';font-weight:700;font-size:19px;line-height:1.3;margin:14px 0 8px;color:#eef1f6;}
        .gdesc{color:#8a93a6;font-size:14px;line-height:1.55;}
        .gmeta{color:#5f6878;font-size:12px;margin-top:14px;}
        a{text-decoration:none;}
      `}</style>
      <div className="gwrap">
        <div className="gnav">
          <Link href="/" className="gbrand"><span className="gdot" />GLØD·MARKETS</Link>
          <Link href="/" className="gback">← Forside</Link>
        </div>
        <div className="ghero">
          <div className="geyebrow">Guides & Læring</div>
          <h1 className="gh1">Forstå aktier og krypto</h1>
          <p className="gsub">Enkle, danske guides der hjælper dig med at forstå markederne — uanset om du er nybegynder eller erfaren investor.</p>
        </div>
        <div className="ggrid">
          {ARTICLES.map((a) => (
            <Link key={a.slug} href={`/guides/${a.slug}`} className="gcard">
              <span className="gtag">{a.tag}</span>
              <div className="gtitle">{a.title}</div>
              <div className="gdesc">{a.description}</div>
              <div className="gmeta">{a.read} læsning</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
