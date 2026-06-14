"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";

/* GLØD MARKETS · live prices + news via /api/quote and /api/news */

const STOCKS = [
  { t:"NVDA", n:"Nvidia",               s:"Halvledere",     d:"nvidia.com",            p:178.20, c:2.1,  mc:4.30e12, pe:58,
    news:[{h:"Datacenter-efterspørgsel driver ny rekordomsætning",src:"MarketWire",tm:"2t"}]},
  { t:"AMD",  n:"Advanced Micro Devices", s:"Halvledere",   d:"amd.com",               p:168.40, c:1.4,  mc:2.70e11, pe:45,
    news:[{h:"MI400-serien vinder frem hos hyperscalere",src:"Reuters",tm:"4t"}]},
  { t:"TSM",  n:"Taiwan Semiconductor",  s:"Halvledere",    d:"tsmc.com",              p:245.10, c:1.1,  mc:1.27e12, pe:32,
    news:[{h:"3nm-kapacitet udsolgt resten af året",src:"Nikkei",tm:"1t"}]},
  { t:"AVGO", n:"Broadcom",              s:"Halvledere",    d:"broadcom.com",          p:1750.0, c:1.9,  mc:8.20e11, pe:42,
    news:[{h:"AI-netværkschips løfter kvartalsomsætning",src:"CNBC",tm:"3t"}]},
  { t:"AAPL", n:"Apple",                 s:"Teknologi",     d:"apple.com",             p:232.40, c:0.4,  mc:3.50e12, pe:35,
    news:[{h:"Services-segment når ny indtjeningsrekord",src:"WSJ",tm:"5t"}]},
  { t:"MSFT", n:"Microsoft",             s:"Teknologi",     d:"microsoft.com",         p:478.20, c:0.7,  mc:3.55e12, pe:37,
    news:[{h:"Azure-vækst accelererer på AI-arbejdsbelastninger",src:"Bloomberg",tm:"2t"}]},
  { t:"GOOGL",n:"Alphabet",              s:"Teknologi",     d:"google.com",            p:185.10, c:0.9,  mc:2.27e12, pe:26,
    news:[{h:"Cloud-margin forbedres tredje kvartal i træk",src:"Reuters",tm:"7t"}]},
  { t:"META", n:"Meta Platforms",        s:"Teknologi",     d:"meta.com",              p:720.50, c:1.2,  mc:1.83e12, pe:28,
    news:[{h:"Annonceindtægter overgår forventninger",src:"CNBC",tm:"4t"}]},
  { t:"AMZN", n:"Amazon",                s:"Teknologi",     d:"amazon.com",            p:220.30, c:0.8,  mc:2.30e12, pe:44,
    news:[{h:"AWS udvider kapacitet med nye datacentre",src:"MarketWire",tm:"3t"}]},
  { t:"TSLA", n:"Tesla",                 s:"Bil",           d:"tesla.com",             p:345.10, c:-1.5, mc:1.10e12, pe:95,
    news:[{h:"Leveringstal under estimater presser aktien",src:"Reuters",tm:"1t"}]},
  { t:"TMUS", n:"T-Mobile US",           s:"Telekom",       d:"t-mobile.com",          p:235.20, c:0.3,  mc:2.70e11, pe:24,
    news:[{h:"Stabil abonnentvækst i seneste kvartal",src:"Bloomberg",tm:"8t"}]},
  { t:"NVO",  n:"Novo Nordisk",          s:"Sundhed",       d:"novonordisk.com",       p:72.40,  c:-0.6, mc:3.20e11, pe:22,
    news:[{h:"Ny fedmestudie viser lovende resultater",src:"Børsen",tm:"5t"}]},
  { t:"BNTX", n:"BioNTech",              s:"Biotek",        d:"biontech.com",          p:118.20, c:2.4,  mc:2.80e10, pe:null,
    news:[{h:"Onkologi-pipeline rykker i fase-2 forsøg",src:"Reuters",tm:"2t"}]},
  { t:"VERU", n:"Veru Inc.",             s:"Biotek",        d:"verupharma.com",        p:1.35,   c:6.2,  mc:2.00e8,  pe:null,
    news:[{h:"Positive data sender small-cap biotek op",src:"Benzinga",tm:"1t"}]},
  { t:"FRD",  n:"Friedman Industries",   s:"Stål",          d:"friedmanindustries.com",p:35.12,  c:29.5, mc:2.47e8,  pe:12.87,
    news:[{h:"Rekordvolumen i Q4 udløser kraftig optur",src:"GlobeNewswire",tm:"1d"}]},
  { t:"ONDS", n:"Ondas Holdings",        s:"Forsvar/Drone", d:"ondas.com",             p:4.80,   c:5.5,  mc:5.50e8,  pe:null,
    news:[{h:"Ny droneordre fra forsvarssektoren",src:"Benzinga",tm:"3t"}]},
  { t:"FLY",  n:"Firefly Aerospace",     s:"Rumfart",       d:"fireflyspace.com",      p:38.00,  c:4.0,  mc:9.00e9,  pe:null,
    news:[{h:"Vellykket opsendelse styrker ordrebog",src:"SpaceNews",tm:"6t"}]},
  { t:"ENVX", n:"Enovix",                s:"Batteri",       d:"enovix.com",            p:9.50,   c:3.2,  mc:1.90e9,  pe:null,
    news:[{h:"Silicon-batteri når ny produktionsmilepæl",src:"MarketWire",tm:"4t"}]},
  { t:"QS",   n:"QuantumScape",          s:"Batteri",       d:"quantumscape.com",      p:7.80,   c:4.5,  mc:4.20e9,  pe:null,
    news:[{h:"Solid-state celler til pilotproduktion",src:"Reuters",tm:"2t"}]},
  { t:"BITF", n:"Bitfarms",              s:"Krypto",        d:"bitfarms.com",          p:1.80,   c:7.0,  mc:8.00e8,  pe:null,
    news:[{h:"Mining-kapacitet udvides før halving-cyklus",src:"CoinDesk",tm:"5t"}]},
];

const fmtCap = (x) => x>=1e12?(x/1e12).toFixed(2)+" T":x>=1e9?(x/1e9).toFixed(2)+" B":x>=1e6?(x/1e6).toFixed(1)+" M":String(x);
const fmtP = (x) => x.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const COLORS = ["#f5a623","#26d07c","#5b8def","#e0556b","#9b6dff","#15bcc4","#ff8a3d","#cdd34a"];
const colorFor = (t)=>COLORS[[...t].reduce((a,ch)=>a+ch.charCodeAt(0),0)%COLORS.length];
const ago = (ts)=>{ const s=Date.now()/1000-ts; if(s<3600) return Math.max(1,Math.round(s/60))+"m"; if(s<86400) return Math.round(s/3600)+"t"; return Math.round(s/86400)+"d"; };

function spark(t, change, w=120, h=40, n=26){
  let seed=[...t].reduce((a,c)=>a+c.charCodeAt(0),0)+1;
  const rnd=()=>{ seed=(seed*9301+49297)%233280; return seed/233280; };
  const drift=(change>=0?1:-1)*0.55;
  let y=0.5, pts=[];
  for(let i=0;i<n;i++){ y+=(rnd()-0.5)*0.34+(drift/n); y=Math.max(0.08,Math.min(0.92,y)); pts.push(y); }
  const xs=(i)=>(i/(n-1))*w, ys=(v)=>h-(v*h);
  return pts.map((v,i)=>`${i?"L":"M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
}

function Reveal({children, delay=0, y=26, className=""}){
  const ref=useRef(null); const [vis,setVis]=useState(false);
  useEffect(()=>{ const el=ref.current; if(!el) return;
    const ob=new IntersectionObserver((es)=>es.forEach(e=>{ if(e.isIntersecting){ setVis(true); ob.unobserve(el);} }),{threshold:0.12});
    ob.observe(el); return ()=>ob.disconnect();
  },[]);
  return <div ref={ref} className={`reveal ${vis?"in":""} ${className}`} style={{transitionDelay:`${delay}ms`,"--ry":`${y}px`}}>{children}</div>;
}

function useCountUp(target, dur=1300){
  const [v,setV]=useState(0); const ref=useRef(null); const [run,setRun]=useState(false);
  useEffect(()=>{ const el=ref.current; if(!el) return;
    const ob=new IntersectionObserver((es)=>es.forEach(e=>{ if(e.isIntersecting){ setRun(true); ob.unobserve(el);} }),{threshold:0.4});
    ob.observe(el); return ()=>ob.disconnect();
  },[]);
  useEffect(()=>{ if(!run) return; let raf; const s=performance.now();
    const tick=(now)=>{ const p=Math.min(1,(now-s)/dur); setV(target*(1-Math.pow(1-p,3))); if(p<1) raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(raf);
  },[run,target,dur]);
  return [v, ref];
}

function Logo({t,d,size=42}){
  const [err,setErr]=useState(false);
  const st={width:size,height:size};
  if(err||!d) return <div className="logo fb" style={{...st,background:colorFor(t)}}>{t.slice(0,2)}</div>;
  return <div className="logo" style={st}><img src={`https://logo.clearbit.com/${d}`} alt={t} loading="lazy" onError={()=>setErr(true)}/></div>;
}

export default function Page(){
  const [stocks,setStocks]=useState(STOCKS);
  const [filter,setFilter]=useState("alle");
  const [sel,setSel]=useState(null);
  const [modalNews,setModalNews]=useState(null);
  const [progress,setProgress]=useState(0);
  const [live,setLive]=useState(false);
  const [qLoading,setQLoading]=useState(false);
  const [qStatus,setQStatus]=useState(null);
  const [clock,setClock]=useState(null);

  useEffect(()=>{ setClock(new Date()); const id=setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(id); },[]);
  useEffect(()=>{
    const onScroll=()=>{ const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; setProgress(max>0?(h.scrollTop/max)*100:0); };
    window.addEventListener("scroll",onScroll,{passive:true}); return ()=>window.removeEventListener("scroll",onScroll);
  },[]);
  useEffect(()=>{ const onKey=(e)=>{ if(e.key==="Escape") setSel(null); }; window.addEventListener("keydown",onKey); return ()=>window.removeEventListener("keydown",onKey); },[]);

  async function refreshQuotes(){
    setQLoading(true); setQStatus(null);
    try{
      const r=await fetch("/api/quote",{cache:"no-store"});
      const j=await r.json();
      if(j && j.quotes && Object.keys(j.quotes).length){
        setStocks(prev=>prev.map(s=> j.quotes[s.t] ? {...s,p:j.quotes[s.t].p,c:j.quotes[s.t].c} : s));
        setLive(true);
        setQStatus({type:"ok",msg:`Opdateret kl. ${new Date().toLocaleTimeString("da-DK")}`});
      } else if(j && j.error==="missing_key"){
        setQStatus({type:"err",msg:"FINNHUB_API_KEY mangler i Vercel → Settings → Environment Variables."});
      } else {
        setQStatus({type:"err",msg:"Ingen live priser modtaget."});
      }
    }catch(e){ setQStatus({type:"err",msg:"Forbindelse mislykkedes."}); }
    setQLoading(false);
  }

  useEffect(()=>{ refreshQuotes(); /* eslint-disable-next-line */ },[]);

  useEffect(()=>{
    if(!sel){ setModalNews(null); return; }
    let alive=true;
    fetch(`/api/news?symbol=${sel.t}`,{cache:"no-store"})
      .then(r=>r.json()).then(j=>{ if(alive && j && j.news && j.news.length) setModalNews(j.news); })
      .catch(()=>{});
    return ()=>{ alive=false; };
  },[sel]);

  const up=stocks.filter(s=>s.c>0).length;
  const down=stocks.filter(s=>s.c<0).length;
  const avg=stocks.reduce((a,s)=>a+s.c,0)/stocks.length;
  const [cUp,upRef]=useCountUp(up);
  const [cAvg,avgRef]=useCountUp(Math.abs(avg));
  const [cN,nRef]=useCountUp(stocks.length);

  const sectors=useMemo(()=>{ const m={};
    stocks.forEach(s=>{ (m[s.s]=m[s.s]||[]).push(s.c); });
    return Object.entries(m).map(([k,v])=>({s:k,avg:v.reduce((a,b)=>a+b,0)/v.length})).sort((a,b)=>b.avg-a.avg);
  },[stocks]);
  const sMax=Math.max(...sectors.map(x=>Math.abs(x.avg)),1);
  const shown=stocks.filter(s=> filter==="alle"?true: filter==="up"? s.c>0 : s.c<0);
  const tape=[...stocks,...stocks];

  return (
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .root{--bg:#080a0f;--bg2:#0c0f16;--panel:#10141d;--panel2:#0d1118;--line:#1d2230;--txt:#eef1f6;--mut:#8a93a6;--gold:#f5a623;--gold2:#ffce6e;--up:#26d07c;--down:#ff5470;
          font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
        .mono{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;}
        .up{color:var(--up);}.down{color:var(--down);}
        a{color:inherit;text-decoration:none;}
        .reveal{opacity:0;transform:translateY(var(--ry,26px));transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1);}
        .reveal.in{opacity:1;transform:none;}
        @media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none;}}
        .prog{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));z-index:60;box-shadow:0 0 10px rgba(245,166,35,.6);}
        .nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:14px 22px;background:rgba(8,10,15,.72);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);}
        .brand{display:flex;align-items:center;gap:10px;}
        .gdot{width:11px;height:11px;border-radius:50%;background:var(--gold);box-shadow:0 0 14px 2px rgba(245,166,35,.75);}
        .bname{font-family:'Sora';font-weight:800;letter-spacing:2px;font-size:17px;}
        .bname small{color:var(--gold);}
        .navr{display:flex;align-items:center;gap:14px;}
        .clock{font-size:12px;color:var(--mut);}
        .ref{background:none;border:1px solid var(--line);color:var(--mut);height:34px;padding:0 13px;border-radius:9px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:7px;font-family:inherit;transition:.2s;}
        .ref:hover{color:var(--gold);border-color:var(--gold);}
        .ref .ic{display:inline-block;transition:transform .6s;}
        .ref.spin .ic{transform:rotate(360deg);}
        .livepill{font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:var(--up);display:flex;align-items:center;gap:6px;}
        .livepill .b{width:7px;height:7px;border-radius:50%;background:var(--up);box-shadow:0 0 8px var(--up);animation:pulse 1.6s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        .tape{border-bottom:1px solid var(--line);background:var(--bg2);overflow:hidden;white-space:nowrap;padding:9px 0;}
        .tape-track{display:inline-flex;gap:30px;animation:marq 48s linear infinite;}
        .tape:hover .tape-track{animation-play-state:paused;}
        @keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .tape-item{font-size:12.5px;display:inline-flex;gap:8px;align-items:center;}
        .tape-item .sy{font-family:'JetBrains Mono';font-weight:700;}
        .tape-item .pc{font-family:'JetBrains Mono';font-weight:600;}
        .hero{position:relative;padding:78px 22px 60px;max-width:1180px;margin:0 auto;}
        .hero-bg{position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;}
        .hero-bg::before{content:"";position:absolute;width:680px;height:680px;left:-160px;top:-260px;border-radius:50%;background:radial-gradient(circle,rgba(245,166,35,.16),transparent 62%);filter:blur(18px);}
        .hero-bg::after{content:"";position:absolute;width:520px;height:520px;right:-140px;top:-80px;border-radius:50%;background:radial-gradient(circle,rgba(38,208,124,.10),transparent 62%);}
        .grid-lines{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:46px 46px;opacity:.18;mask-image:radial-gradient(circle at 30% 20%,#000,transparent 72%);}
        .hero-in{position:relative;z-index:1;}
        .eyebrow{font-size:12px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:600;opacity:0;animation:fadeUp .7s .05s forwards;}
        .h1{font-family:'Sora';font-weight:800;font-size:clamp(34px,6vw,60px);line-height:1.04;letter-spacing:-1px;margin:16px 0 0;max-width:14ch;opacity:0;animation:fadeUp .8s .15s forwards;}
        .h1 .gl{background:linear-gradient(120deg,var(--gold),var(--gold2));-webkit-background-clip:text;background-clip:text;color:transparent;}
        .sub{margin-top:18px;color:var(--mut);font-size:17px;max-width:50ch;line-height:1.6;opacity:0;animation:fadeUp .8s .28s forwards;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:42px;max-width:560px;}
        .stat{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;}
        .stat .v{font-family:'Sora';font-weight:700;font-size:30px;letter-spacing:-.5px;}
        .stat .l{font-size:11px;color:var(--mut);text-transform:uppercase;letter-spacing:1.4px;margin-top:5px;}
        .sec{max-width:1180px;margin:0 auto;padding:38px 22px;}
        .sec-h{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap;}
        .sec-t{font-family:'Sora';font-weight:700;font-size:24px;letter-spacing:-.4px;}
        .sec-d{color:var(--mut);font-size:13.5px;margin-top:4px;}
        .seg{display:flex;border:1px solid var(--line);border-radius:11px;overflow:hidden;}
        .seg button{background:var(--panel);border:none;color:var(--mut);padding:9px 16px;font-size:13px;cursor:pointer;font-family:inherit;transition:.18s;}
        .seg button.act{background:var(--gold);color:#1a1305;font-weight:600;}
        .secgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;}
        .secbar{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:15px 16px;}
        .secbar .row{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;}
        .secbar .nm{font-weight:600;}
        .secbar .track{height:7px;border-radius:6px;background:var(--panel2);margin-top:11px;overflow:hidden;border:1px solid var(--line);}
        .secbar .fill{height:100%;border-radius:6px;transition:width 1.1s cubic-bezier(.2,.7,.2,1);}
        .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
        .card{background:linear-gradient(180deg,var(--panel),var(--panel2));border:1px solid var(--line);border-radius:18px;padding:18px;cursor:pointer;transition:transform .28s cubic-bezier(.2,.7,.2,1),border-color .28s,box-shadow .28s;position:relative;overflow:hidden;}
        .card:hover{transform:translateY(-5px);border-color:rgba(245,166,35,.45);box-shadow:0 18px 40px -22px rgba(0,0,0,.9);}
        .card-top{display:flex;align-items:center;gap:13px;}
        .logo{border-radius:12px;overflow:hidden;flex-shrink:0;display:grid;place-items:center;background:#fff;}
        .logo img{width:100%;height:100%;object-fit:contain;padding:6px;background:#fff;}
        .logo.fb{color:#0b0b0b;font-family:'JetBrains Mono';font-weight:700;font-size:15px;}
        .ci{flex:1;min-width:0;}
        .ci .sy{font-family:'JetBrains Mono';font-weight:700;font-size:16px;}
        .ci .co{font-size:12.5px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .chg{display:inline-flex;align-items:center;gap:5px;font-family:'JetBrains Mono';font-weight:700;font-size:15px;padding:5px 9px;border-radius:9px;}
        .chg.u{color:var(--up);background:rgba(38,208,124,.12);}
        .chg.dn{color:var(--down);background:rgba(255,84,112,.12);}
        .card-mid{display:flex;align-items:flex-end;justify-content:space-between;margin-top:16px;gap:10px;}
        .price{font-family:'Sora';font-weight:700;font-size:26px;letter-spacing:-.5px;}
        .price small{font-size:13px;color:var(--mut);font-weight:500;margin-left:3px;}
        .spark path.line{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1.4s .2s forwards;}
        @keyframes draw{to{stroke-dashoffset:0}}
        .meta{display:flex;gap:8px;margin-top:15px;flex-wrap:wrap;}
        .tag{font-size:11px;color:var(--mut);background:var(--panel2);border:1px solid var(--line);padding:4px 10px;border-radius:20px;}
        .news1{margin-top:15px;padding-top:14px;border-top:1px solid var(--line);}
        .news1 .hl{font-size:13px;line-height:1.45;font-weight:500;}
        .news1 .meta2{font-size:11px;color:var(--mut);margin-top:6px;display:flex;gap:8px;align-items:center;}
        .news1 .dot{width:3px;height:3px;border-radius:50%;background:var(--mut);}
        .ov{position:fixed;inset:0;background:rgba(4,6,10,.74);backdrop-filter:blur(6px);z-index:80;display:grid;place-items:center;padding:18px;animation:fade .25s;}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        .modal{background:linear-gradient(180deg,var(--panel),var(--panel2));border:1px solid var(--line);border-radius:22px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;animation:pop .3s cubic-bezier(.2,.8,.2,1);position:relative;}
        @keyframes pop{from{opacity:0;transform:translateY(20px) scale(.98)}to{opacity:1;transform:none}}
        .mhead{padding:22px 22px 18px;border-bottom:1px solid var(--line);display:flex;gap:15px;align-items:center;}
        .mclose{position:absolute;top:14px;right:14px;background:var(--panel2);border:1px solid var(--line);color:var(--mut);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;}
        .mbody{padding:20px 22px 24px;}
        .mprice{display:flex;align-items:baseline;gap:12px;}
        .mprice .pp{font-family:'Sora';font-weight:800;font-size:38px;}
        .mstats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0 6px;}
        .mstat{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px;}
        .mstat .l{font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1.2px;}
        .mstat .v{font-family:'JetBrains Mono';font-weight:700;font-size:16px;margin-top:5px;}
        .mnews-t{font-family:'Sora';font-weight:600;font-size:14px;margin:20px 0 12px;letter-spacing:.3px;display:flex;align-items:center;gap:9px;}
        .liveb{font-size:9px;letter-spacing:1.2px;color:var(--up);border:1px solid rgba(38,208,124,.4);padding:2px 7px;border-radius:20px;}
        .nrow{display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--line);}
        .nrow .bar{width:3px;border-radius:3px;background:var(--gold);flex-shrink:0;}
        .nrow .nt{font-size:13.5px;line-height:1.45;font-weight:500;}
        .nrow .nm{font-size:11px;color:var(--mut);margin-top:5px;}
        footer{max-width:1180px;margin:30px auto 0;padding:26px 22px 50px;border-top:1px solid var(--line);color:var(--mut);font-size:12px;line-height:1.7;}
        @media (max-width:640px){.stats{grid-template-columns:1fr 1fr;}.stats .stat:last-child{grid-column:span 2;}.clock{display:none;}}
      `}</style>

      <div className="prog" style={{width:progress+"%"}} />

      <div className="nav">
        <div className="brand"><div className="gdot"/><div className="bname">GLØD<small>·</small>MARKETS</div></div>
        <div className="navr">
          {live && <span className="livepill"><span className="b"/>Live</span>}
          {clock && <span className="clock mono">{clock.toLocaleTimeString("da-DK")}</span>}
          <button className={`ref ${qLoading?"spin":""}`} onClick={refreshQuotes} disabled={qLoading}>
            <span className="ic">↻</span>{qLoading?"Henter":"Opdater"}
          </button>
        </div>
      </div>

      <div className="tape">
        <div className="tape-track">
          {tape.map((s,i)=>(
            <span className="tape-item" key={i}>
              <span className="sy">{s.t}</span>
              <span className="mono" style={{color:"var(--mut)"}}>{fmtP(s.p)}</span>
              <span className={`pc ${s.c>=0?"up":"down"}`}>{s.c>=0?"▲":"▼"} {Math.abs(s.c).toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>

      <section className="hero">
        <div className="hero-bg"><div className="grid-lines"/></div>
        <div className="hero-in">
          <div className="eyebrow">Markedsintelligens · Realtid</div>
          <h1 className="h1">Markedet i ét <span className="gl">klart</span> overblik.</h1>
          <p className="sub">Følg dine aktier med kurser, bevægelser, logoer og nyheder samlet ét sted — designet til hurtige, skarpe beslutninger.</p>
          <div className="stats">
            <div className="stat" ref={upRef}><div className="v up mono">{Math.round(cUp)}</div><div className="l">Aktier i plus</div></div>
            <div className="stat" ref={avgRef}><div className={`v mono ${avg>=0?"up":"down"}`}>{avg>=0?"+":"−"}{cAvg.toFixed(2)}%</div><div className="l">Gns. bevægelse</div></div>
            <div className="stat" ref={nRef}><div className="v mono">{Math.round(cN)}</div><div className="l">Fulgte aktier</div></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <Reveal><div className="sec-h"><div><div className="sec-t">Sektorer i dag</div><div className="sec-d">Gennemsnitlig bevægelse pr. sektor</div></div></div></Reveal>
        <div className="secgrid">
          {sectors.map((x,i)=>(
            <Reveal key={x.s} delay={i*55}>
              <div className="secbar">
                <div className="row"><span className="nm">{x.s}</span><span className={`mono ${x.avg>=0?"up":"down"}`}>{x.avg>=0?"+":""}{x.avg.toFixed(2)}%</span></div>
                <div className="track"><div className="fill" style={{width:(Math.abs(x.avg)/sMax*100)+"%",background:x.avg>=0?"var(--up)":"var(--down)"}}/></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="sec">
        <Reveal>
          <div className="sec-h">
            <div><div className="sec-t">Markeder</div><div className="sec-d">Tryk på en aktie for kurser, graf og nyheder</div></div>
            <div className="seg">
              {[["alle","Alle"],["up","Stigere"],["down","Faldere"]].map(([k,l])=>(
                <button key={k} className={filter===k?"act":""} onClick={()=>setFilter(k)}>{l}</button>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="cards">
          {shown.map((s,i)=>{ const u=s.c>=0; return (
            <Reveal key={s.t} delay={(i%3)*70} y={32}>
              <div className="card" onClick={()=>setSel(s)}>
                <div className="card-top">
                  <Logo t={s.t} d={s.d}/>
                  <div className="ci"><div className="sy">{s.t}</div><div className="co">{s.n}</div></div>
                  <div className={`chg ${u?"u":"dn"}`}>{u?"▲":"▼"} {Math.abs(s.c).toFixed(2)}%</div>
                </div>
                <div className="card-mid">
                  <div className="price mono">{fmtP(s.p)}<small>USD</small></div>
                  <svg className="spark" width="120" height="40" viewBox="0 0 120 40"><path className="line" d={spark(s.t,s.c)} stroke={u?"var(--up)":"var(--down)"}/></svg>
                </div>
                <div className="meta">
                  <span className="tag">{s.s}</span><span className="tag">Mkt {fmtCap(s.mc)}</span>
                  {s.pe!=null && <span className="tag">P/E {s.pe}</span>}
                </div>
                {s.news?.[0] && (
                  <div className="news1">
                    <div className="hl">{s.news[0].h}</div>
                    <div className="meta2"><span>{s.news[0].src}</span><span className="dot"/><span>{s.news[0].tm} siden</span></div>
                  </div>
                )}
              </div>
            </Reveal>
          );})}
        </div>
      </section>

      <footer>
        <strong style={{color:"var(--txt)"}}>GLØD MARKETS</strong> · Live kurser via Finnhub. Forsinkelser kan forekomme.
        Intet på denne side udgør investeringsrådgivning. {qStatus && <span className={qStatus.type==="err"?"down":"up"}> · {qStatus.msg}</span>}
      </footer>

      {sel && (
        <div className="ov" onClick={()=>setSel(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="mclose" onClick={()=>setSel(null)}>✕</button>
            <div className="mhead">
              <Logo t={sel.t} d={sel.d} size={54}/>
              <div><div className="mono" style={{fontWeight:700,fontSize:18}}>{sel.t}</div><div style={{color:"var(--mut)",fontSize:13}}>{sel.n} · {sel.s}</div></div>
            </div>
            <div className="mbody">
              <div className="mprice">
                <span className="pp mono">{fmtP(sel.p)}</span>
                <span className={`chg ${sel.c>=0?"u":"dn"}`}>{sel.c>=0?"▲":"▼"} {Math.abs(sel.c).toFixed(2)}%</span>
              </div>
              <svg width="100%" height="92" viewBox="0 0 120 40" preserveAspectRatio="none" style={{marginTop:14}}>
                <path d={spark(sel.t,sel.c)} fill="none" strokeWidth="1.6" stroke={sel.c>=0?"var(--up)":"var(--down)"} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="mstats">
                <div className="mstat"><div className="l">Markedsværdi</div><div className="v">{fmtCap(sel.mc)}</div></div>
                <div className="mstat"><div className="l">P/E</div><div className="v">{sel.pe==null?"—":sel.pe}</div></div>
                <div className="mstat"><div className="l">Sektor</div><div className="v" style={{fontSize:13}}>{sel.s}</div></div>
              </div>
              <div className="mnews-t">Seneste nyheder {modalNews && <span className="liveb">LIVE</span>}</div>
              {(modalNews || sel.news).map((nw,i)=>{
                const time = nw.dt ? ago(nw.dt)+" siden" : (nw.tm? nw.tm+" siden":"");
                const inner=(
                  <div className="nrow" key={i}>
                    <div className="bar"/>
                    <div><div className="nt">{nw.h}</div><div className="nm">{nw.src}{time?` · ${time}`:""}</div></div>
                  </div>
                );
                return nw.url ? <a key={i} href={nw.url} target="_blank" rel="noreferrer">{inner}</a> : inner;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
