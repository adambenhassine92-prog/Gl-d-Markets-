// Live stock quotes via Finnhub. Fetches only the requested symbols (lazy).
export const dynamic = "force-dynamic";

async function one(sym, key){
  try{
    const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`,{cache:"no-store"});
    const q=await r.json();
    if(q && typeof q.c==="number" && q.c>0) return {sym,data:{p:q.c,c:typeof q.dp==="number"?q.dp:0}};
  }catch(e){}
  return null;
}

export async function GET(req){
  const key=process.env.FINNHUB_API_KEY;
  if(!key) return Response.json({error:"missing_key"},{status:500});
  const {searchParams}=new URL(req.url);
  const syms=(searchParams.get("symbols")||"").split(",").map(s=>s.trim()).filter(Boolean).slice(0,40);
  const quotes={};
  const batch=10;
  for(let i=0;i<syms.length;i+=batch){
    const chunk=syms.slice(i,i+batch);
    const res=await Promise.all(chunk.map(s=>one(s,key)));
    res.forEach(r=>{ if(r) quotes[r.sym]=r.data; });
    if(i+batch<syms.length) await new Promise(r=>setTimeout(r,1100));
  }
  return Response.json({quotes});
}
