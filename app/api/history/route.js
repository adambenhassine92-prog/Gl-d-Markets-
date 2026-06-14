// Historical price data: stocks via Stooq (free), coins via CoinGecko (free).
export const dynamic = "force-dynamic";
const DAYS = { "1m":31, "3m":92, "6m":183, "1y":366, "5y":1830 };
function ymd(d){ return d.toISOString().slice(0,10).replace(/-/g,""); }

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const range = searchParams.get("range") || "6m";
  try{
    if(kind === "coin"){
      const id = searchParams.get("id");
      if(!id) return Response.json({ points: [] });
      const days = range === "max" ? "max" : range;
      const r = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`, { cache:"no-store" });
      const j = await r.json();
      const points = (j.prices || []).map(a => ({ t: a[0], p: a[1] }));
      return Response.json({ points });
    } else {
      const sym = (searchParams.get("symbol") || "").toLowerCase();
      if(!sym) return Response.json({ points: [] });
      let url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}.us&i=d`;
      if(range !== "max" && DAYS[range]){
        const d2 = new Date();
        const d1 = new Date(Date.now() - DAYS[range]*86400000);
        url += `&d1=${ymd(d1)}&d2=${ymd(d2)}`;
      }
      const r = await fetch(url, { cache:"no-store" });
      const txt = await r.text();
      const lines = txt.trim().split("\n").slice(1);
      const points = [];
      for(const ln of lines){
        const c = ln.split(",");
        const close = parseFloat(c[4]);
        if(!isNaN(close)) points.push({ t: c[0], p: close });
      }
      return Response.json({ points });
    }
  }catch(e){ return Response.json({ points: [] }); }
}
