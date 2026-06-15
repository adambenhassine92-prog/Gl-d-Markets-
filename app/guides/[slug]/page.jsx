import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "../articles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/guides/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.description,
      url: `/guides/${a.slug}`,
    },
  };
}

export default function ArticlePage({ params }) {
  const a = getArticle(params.slug);
  if (!a) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    author: { "@type": "Person", name: "Adam Mehdi Ben Hassine" },
    publisher: { "@type": "Organization", name: "GLØD MARKETS" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#eef1f6", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .awrap{max-width:760px;margin:0 auto;padding:22px;}
        .anav{display:flex;align-items:center;justify-content:space-between;padding:6px 0 26px;}
        .abrand{display:flex;align-items:center;gap:9px;font-family:'Sora';font-weight:800;letter-spacing:2px;font-size:16px;color:#eef1f6;}
        .adot{width:10px;height:10px;border-radius:50%;background:#f5a623;box-shadow:0 0 12px 2px rgba(245,166,35,.7);}
        .aback{color:#8a93a6;font-size:14px;border:1px solid #1d2230;border-radius:10px;padding:8px 14px;}
        .atag{display:inline-block;font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:#f5a623;background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.25);padding:4px 10px;border-radius:20px;}
        .ah1{font-family:'Sora';font-weight:800;font-size:clamp(26px,5.5vw,40px);letter-spacing:-1px;line-height:1.15;margin:14px 0 10px;}
        .ameta{color:#5f6878;font-size:13px;margin-bottom:22px;}
        .aintro{font-size:18px;line-height:1.6;color:#cdd3df;border-left:3px solid #f5a623;padding-left:16px;margin:22px 0;}
        .abody h2{font-family:'Sora';font-weight:700;font-size:21px;margin:32px 0 12px;color:#eef1f6;}
        .abody p{font-size:16px;line-height:1.75;color:#aeb6c4;margin:0 0 14px;}
        .adisc{margin:40px 0 20px;padding:16px 18px;background:#10141d;border:1px solid #1d2230;border-radius:14px;color:#8a93a6;font-size:13px;line-height:1.6;}
        .acta{display:inline-block;margin:8px 0 60px;background:linear-gradient(135deg,#f5a623,#ffce6e);color:#1a1305;font-weight:700;font-family:'Sora';padding:14px 24px;border-radius:13px;}
        a{text-decoration:none;}
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="awrap">
        <div className="anav">
          <Link href="/" className="abrand"><span className="adot" />GLØD·MARKETS</Link>
          <Link href="/guides" className="aback">← Guides</Link>
        </div>
        <span className="atag">{a.tag}</span>
        <h1 className="ah1">{a.title}</h1>
        <div className="ameta">{a.read} læsning</div>
        <p className="aintro">{a.intro}</p>
        <div className="abody">
          {a.body.map((sec, i) => (
            <div key={i}>
              <h2>{sec.h}</h2>
              {sec.p.map((para, j) => (<p key={j}>{para}</p>))}
            </div>
          ))}
        </div>
        <div className="adisc">⚠️ Indholdet er kun til oplysning og udgør ikke investeringsrådgivning. Invester altid ansvarligt og undersøg selv, før du træffer beslutninger.</div>
        <div>
          <Link href="/" className="acta">Se live kurser →</Link>
        </div>
      </div>
    </div>
  );
}
