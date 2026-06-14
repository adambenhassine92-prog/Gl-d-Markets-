// Server-side proxy for live company news.
export const dynamic = "force-dynamic";

export async function GET(req) {
  const key = process.env.FINNHUB_API_KEY;
  const { searchParams } = new URL(req.url);
  const sym = searchParams.get("symbol");
  if (!key || !sym) return Response.json({ news: [] });

  const fmt = (d) => d.toISOString().slice(0, 10);
  const to = new Date();
  const from = new Date(Date.now() - 21 * 86400000);

  try {
    const r = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(sym)}&from=${fmt(from)}&to=${fmt(to)}&token=${key}`,
      { cache: "no-store" }
    );
    const arr = await r.json();
    const news = (Array.isArray(arr) ? arr : [])
      .filter((n) => n.headline)
      .slice(0, 6)
      .map((n) => ({ h: n.headline, src: n.source, url: n.url, dt: n.datetime }));
    return Response.json({ news });
  } catch (e) {
    return Response.json({ news: [] });
  }
}
