// Live general market news (stocks + crypto) via Finnhub.
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return Response.json({ news: [] });
  try {
    const [g, c] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/news?category=general&token=${key}`, { cache: "no-store" }).then(r=>r.json()).catch(()=>[]),
      fetch(`https://finnhub.io/api/v1/news?category=crypto&token=${key}`, { cache: "no-store" }).then(r=>r.json()).catch(()=>[]),
    ]);
    const map = (arr, cat) => (Array.isArray(arr) ? arr : [])
      .filter(n => n.headline && n.url)
      .map(n => ({ h: n.headline, src: n.source, url: n.url, dt: n.datetime, img: n.image || "", cat }));
    const seen = new Set();
    const news = [...map(g, "Aktier"), ...map(c, "Krypto")]
      .filter(n => { if (seen.has(n.url)) return false; seen.add(n.url); return true; })
      .sort((a, b) => (b.dt || 0) - (a.dt || 0))
      .slice(0, 24);
    return Response.json({ news });
  } catch (e) {
    return Response.json({ news: [] });
  }
}
