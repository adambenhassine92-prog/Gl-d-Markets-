// Live crypto prices via CoinGecko (free, no key). One batched call.
import { COINS } from "../../stocks";
export const dynamic = "force-dynamic";

export async function GET(){
  const ids=COINS.map(c=>c.id).join(",");
  try{
    const r=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,{cache:"no-store"});
    const j=await r.json();
    const out={};
    COINS.forEach(c=>{
      const row=j[c.id];
      if(row && typeof row.usd==="number") out[c.t]={p:row.usd,c:typeof row.usd_24h_change==="number"?row.usd_24h_change:0};
    });
    return Response.json({quotes:out});
  }catch(e){ return Response.json({quotes:{}}); }
}
