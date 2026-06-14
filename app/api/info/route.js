// Company / coin profile: description (Wikipedia) + key stats (Finnhub / CoinGecko).
export const dynamic = "force-dynamic";

async function wiki(name){
  if(!name) return "";
  for(const lang of ["da","en"]){
    try{
      const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,{cache:"no-store"});
      if(!r.ok) continue;
      const j = await r.json();
      if(j && j.extract && j.type !== "disambiguation") return j.extract;
    }catch(e){}
  }
  return "";
}

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  try{
    if(kind === "coin"){
      const id = searchParams.get("id");
      if(!id) return Response.json({});
      const r = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,{cache:"no-store"});
      const j = await r.json();
      const md = j.market_data || {};
      const desc = (j.description && j.description.en ? j.description.en : "").replace(/<[^>]+>/g,"").split(". ").slice(0,3).join(". ");
      return Response.json({
        desc,
        web: (j.links && j.links.homepage && j.links.homepage[0]) || "",
        stats: {
          marketCap: md.market_cap?.usd ?? null,
          ath: md.ath?.usd ?? null,
          high52: md.high_24h?.usd ?? null,
          low52: md.low_24h?.usd ?? null,
          circulating: md.circulating_supply ?? null,
          total: md.total_supply ?? null,
          genesis: j.genesis_date || null,
          rank: j.market_cap_rank ?? null,
        },
      });
    } else {
      const symbol = searchParams.get("symbol");
      const name = searchParams.get("name") || "";
      const key = process.env.FINNHUB_API_KEY;
      const [prof, met, desc] = await Promise.all([
        key ? fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${key}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({})) : {},
        key ? fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${key}`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({})) : {},
        wiki(name),
      ]);
      const m = (met && met.metric) || {};
      return Response.json({
        desc,
        web: prof.weburl || "",
        stats: {
          marketCap: prof.marketCapitalization ? prof.marketCapitalization * 1e6 : null,
          pe: m.peTTM ?? null,
          high52: m["52WeekHigh"] ?? null,
          low52: m["52WeekLow"] ?? null,
          hq: prof.country || null,
          exchange: prof.exchange || null,
          ipo: prof.ipo || null,
          industry: prof.finnhubIndustry || null,
        },
      });
    }
  }catch(e){ return Response.json({}); }
}
