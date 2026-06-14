"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { STOCKS, COINS } from "./stocks";

/* GLØD MARKETS · 150+ aktier + 20 coins · live priser pr. sektor (lazy) */

const ALL = [
  ...STOCKS.map(s=>({...s})),
  ...COINS.map(c=>({t:c.t,n:c.n,s:"Krypto",d:null,coin:true,id:c.id,c:c.c})),
];

const fmtCap = (x) => x>=1e12?(x/1e12).toFixed(2)+" T":x>=1e9?(x/1e9).toFixed(2)+" B":x>=1e6?(x/1e6).toFixed(1)+" M":String(x);
const fmtP = (x) => x>=1000? x.toLocaleString("en-US",{maximumFractionDigits:0}) : x.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:x<1?6:2});
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

function Reveal({children, delay=0, y=24, className=""}){
  const ref=useRef(null); const [vis,setVis]=useState(false);
  useEffect(()=>{ const el=ref.current; if(!el) return;
    const ob=new IntersectionObserver((es)=>es.forEach(e=>{ if(e.isIntersecting){ setVis(true); ob.unobserve(el);} }),{threshold:0.08});
    ob.observe(el); return ()=>ob.disconnect();
  },[]);
  return <div ref={ref} className={`reveal ${vis?"in":""} ${className}`} style={{transitionDelay:`${delay}ms`,"--ry":`${y}px`}}>{children}</div>;
}

function Logo({t,d,size=42}){
  const [err,setErr]=useState(false);
  const st={width:size,height:size};
  if(err||!d) return <div className="logo fb" style={{...st,background:colorFor(t)}}>{t.slice(0,2)}</div>;
  return <div className="logo" style={st}><img src={`https://logo.clearbit.com/${d}`} alt={t} loading="lazy" onError={()=>setErr(true)}/></div>;
}

function ChartBox({points,loading,kind,range,onRange}){
  const ranges = kind==="coin" ? [["7","1U"],["30","1M"],["90","3M"],["365","1Å"],["max","Maks"]]
                               : [["1m","1M"],["6m","6M"],["1y","1Å"],["5y","5Å"],["max","Maks"]];
  const vals=(points||[]).map(p=>p.p).filter(v=>typeof v==="number");
  const n=vals.length;
  let path="", mn=0, mx=0, up=true;
  if(n>1){ mn=Math.min(...vals); mx=Math.max(...vals); up=vals[n-1]>=vals[0];
    const W=100,H=36,rng=(mx-mn)||1;
    path=vals.map((v,i)=>`${i?"L":"M"}${(i/(n-1)*W).toFixed(2)},${(H-((v-mn)/rng)*H).toFixed(2)}`).join(" ");
  }
  const col=up?"var(--up)":"var(--down)";
  return (
    <div className="chartbox">
      <div className="chartwrap">
        {loading ? <div className="chartmsg"><span className="spin2"/>Henter graf…</div>
         : n>1 ? (<>
            <svg className="chartsvg" viewBox="0 0 100 36" preserveAspectRatio="none"><path d={path} fill="none" stroke={col} strokeWidth="0.7" strokeLinejoin="round" strokeLinecap="round"/></svg>
            <span className="chi hi mono">{fmtP(mx)}</span>
            <span className="chi lo mono">{fmtP(mn)}</span>
          </>)
         : <div className="chartmsg">Graf ikke tilgængelig</div>}
      </div>
      <div className="ranges">
        {ranges.map(([k,l])=>(<button key={k} className={range===k?"act":""} onClick={()=>onRange(k)}>{l}</button>))}
      </div>
    </div>
  );
}

function CardGrid({list,onSelect}){
  return (
    <div className="cards">
      {list.map((s,i)=>{ const u=s.c>=0; return (
        <Reveal key={s.t} delay={(i%4)*50} y={26}>
          <div className="card" onClick={()=>onSelect(s)}>
            <div className="card-top">
              <Logo t={s.t} d={s.d}/>
              <div className="ci"><div className="sy">{s.t}</div><div className="co">{s.n}</div></div>
              <div className={`chg ${u?"u":"dn"}`}>{u?"▲":"▼"} {Math.abs(s.c).toFixed(2)}%</div>
            </div>
            <div className="card-mid">
              <div className="price mono">{s.p!=null?fmtP(s.p):"—"}<small>{s.coin?"USD":"USD"}</small></div>
              <svg className="spark" width="120" height="40" viewBox="0 0 120 40"><path className="line" d={spark(s.t,s.c)} stroke={u?"var(--up)":"var(--down)"}/></svg>
            </div>
            <div className="meta"><span className="tag">{s.s}</span></div>
          </div>
        </Reveal>
      );})}
    </div>
  );
}

export default function Page(){
  const [sectorFilter,setSectorFilter]=useState(null);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("alle");
  const [sel,setSel]=useState(null);
  const [modalNews,setModalNews]=useState(null);
  const [hist,setHist]=useState(null);
  const [histRange,setHistRange]=useState("6m");
  const [histLoading,setHistLoading]=useState(false);
  const [liveData,setLiveData]=useState({});
  const [live,setLive]=useState(false);
  const [loading,setLoading]=useState(false);
  const [progress,setProgress]=useState(0);
  const [clock,setClock]=useState(null);

  useEffect(()=>{ setClock(new Date()); const id=setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(id); },[]);
  useEffect(()=>{
    const onScroll=()=>{ const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; setProgress(max>0?(h.scrollTop/max)*100:0); };
    window.addEventListener("scroll",onScroll,{passive:true}); return ()=>window.removeEventListener("scroll",onScroll);
  },[]);
  useEffect(()=>{ const onKey=(e)=>{ if(e.key==="Escape") setSel(null); }; window.addEventListener("keydown",onKey); return ()=>window.removeEventListener("keydown",onKey); },[]);

  const sectors=useMemo(()=>{ const m={};
    ALL.forEach(s=>{ (m[s.s]=m[s.s]||[]).push(s); });
    return Object.entries(m).map(([k,v])=>({s:k,n:v.length})).sort((a,b)=>b.n-a.n);
  },[]);

  async function loadQuotes(items){
    setLoading(true);
    const coins=items.filter(s=>s.coin), stocks=items.filter(s=>!s.coin);
    const next={};
    try{
      if(stocks.length){
        const syms=stocks.map(s=>s.t).slice(0,40).join(",");
        const r=await fetch(`/api/quote?symbols=${encodeURIComponent(syms)}`,{cache:"no-store"});
        const j=await r.json(); if(j&&j.quotes) Object.assign(next,j.quotes);
      }
      if(coins.length){
        const r=await fetch(`/api/crypto`,{cache:"no-store"});
        const j=await r.json(); if(j&&j.quotes) Object.assign(next,j.quotes);
      }
      if(Object.keys(next).length){ setLiveData(prev=>({...prev,...next})); setLive(true); }
    }catch(e){}
    setLoading(false);
  }

  useEffect(()=>{ if(sectorFilter){ loadQuotes(ALL.filter(s=>s.s===sectorFilter)); } /* eslint-disable-next-line */ },[sectorFilter]);
  useEffect(()=>{
    if(!search || sectorFilter) return;
    const id=setTimeout(()=>{ const q=search.toLowerCase();
      const m=ALL.filter(s=>s.t.toLowerCase().includes(q)||s.n.toLowerCase().includes(q));
      if(m.length) loadQuotes(m.slice(0,40));
    },450);
    return ()=>clearTimeout(id);
  /* eslint-disable-next-line */ },[search,sectorFilter]);

  useEffect(()=>{
    if(!sel){ setModalNews(null); return; }
    if(sel.coin){ setModalNews([]); return; }
    let alive=true;
    fetch(`/api/news?symbol=${sel.t}`,{cache:"no-store"})
      .then(r=>r.json()).then(j=>{ if(alive && j && j.news) setModalNews(j.news); }).catch(()=>{});
    return ()=>{ alive=false; };
  },[sel]);

  useEffect(()=>{ if(sel){ setHist(null); setHistRange(sel.coin?"30":"6m"); } },[sel]);
  useEffect(()=>{
    if(!sel){ return; }
    let alive=true; setHistLoading(true); setHist(null);
    const url = sel.coin ? `/api/history?kind=coin&id=${encodeURIComponent(sel.id||"")}&range=${histRange}`
                         : `/api/history?kind=stock&symbol=${encodeURIComponent(sel.t)}&range=${histRange}`;
    fetch(url,{cache:"no-store"}).then(r=>r.json()).then(j=>{ if(alive){ setHist(j.points||[]); setHistLoading(false); } })
      .catch(()=>{ if(alive){ setHist([]); setHistLoading(false); } });
    return ()=>{ alive=false; };
  },[sel,histRange]);

  const eff=(s)=>({...s, p: liveData[s.t]?.p ?? null, c: liveData[s.t]?.c ?? s.c});
  const q=search.toLowerCase();
  let baseList = sectorFilter ? ALL.filter(s=>s.s===sectorFilter)
    : (search ? ALL.filter(s=>s.t.toLowerCase().includes(q)||s.n.toLowerCase().includes(q)) : []);
  let shown = baseList.map(eff).filter(s=>{
    if(filter==="up") return s.c>0;
    if(filter==="down") return s.c<0;
    return true;
  });
  const secAvg = shown.length? shown.reduce((a,s)=>a+s.c,0)/shown.length : 0;
  const selEff = sel ? eff(sel) : null;

  function openSector(name){ setSectorFilter(name); setFilter("alle"); setSearch(""); window.scrollTo({top:0,behavior:"smooth"}); }
  function goHome(){ setSectorFilter(null); setFilter("alle"); setSearch(""); window.scrollTo({top:0}); }
  function refresh(){ if(sectorFilter) loadQuotes(ALL.filter(s=>s.s===sectorFilter)); }

  const showingList = sectorFilter || search;

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
        .reveal{opacity:0;transform:translateY(var(--ry,24px));transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);}
        .reveal.in{opacity:1;transform:none;}
        @media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none;}}
        .prog{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));z-index:60;box-shadow:0 0 10px rgba(245,166,35,.6);}
        .nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:14px 22px;background:rgba(8,10,15,.72);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);}
        .brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
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
        .hero{position:relative;padding:64px 22px 38px;max-width:1180px;margin:0 auto;}
        .hero-bg{position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;}
        .hero-bg::before{content:"";position:absolute;width:680px;height:680px;left:-160px;top:-260px;border-radius:50%;background:radial-gradient(circle,rgba(245,166,35,.16),transparent 62%);filter:blur(18px);}
        .hero-bg::after{content:"";position:absolute;width:520px;height:520px;right:-140px;top:-80px;border-radius:50%;background:radial-gradient(circle,rgba(38,208,124,.10),transparent 62%);}
        .grid-lines{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:46px 46px;opacity:.18;mask-image:radial-gradient(circle at 30% 20%,#000,transparent 72%);}
        .hero-in{position:relative;z-index:1;}
        .eyebrow{font-size:12px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:600;}
        .h1{font-family:'Sora';font-weight:800;font-size:clamp(30px,6vw,54px);line-height:1.05;letter-spacing:-1px;margin:14px 0 0;max-width:15ch;}
        .h1 .gl{background:linear-gradient(120deg,var(--gold),var(--gold2));-webkit-background-clip:text;background-clip:text;color:transparent;}
        .sub{margin-top:16px;color:var(--mut);font-size:16px;max-width:52ch;line-height:1.6;}
        .bigsearch{margin-top:26px;display:flex;gap:10px;max-width:560px;}
        .bigsearch input{flex:1;background:var(--panel);border:1px solid var(--line);color:var(--txt);padding:14px 16px;border-radius:13px;font-size:15px;font-family:inherit;outline:none;}
        .bigsearch input:focus{border-color:var(--gold);}
        .sec{max-width:1180px;margin:0 auto;padding:24px 22px 40px;}
        .sec-h{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap;}
        .sec-t{font-family:'Sora';font-weight:700;font-size:22px;letter-spacing:-.4px;}
        .sec-d{color:var(--mut);font-size:13px;margin-top:4px;}
        .seg{display:flex;border:1px solid var(--line);border-radius:11px;overflow:hidden;}
        .seg button{background:var(--panel);border:none;color:var(--mut);padding:9px 15px;font-size:13px;cursor:pointer;font-family:inherit;transition:.18s;}
        .seg button.act{background:var(--gold);color:#1a1305;font-weight:600;}
        .secgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;}
        .secbar{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;cursor:pointer;transition:border-color .2s,transform .2s,background .2s;}
        .secbar:hover{border-color:rgba(245,166,35,.5);transform:translateY(-3px);}
        .secbar .nm{font-weight:600;font-size:15px;display:flex;justify-content:space-between;align-items:center;}
        .secbar .arr{color:var(--gold);}
        .secbar .cnt{font-size:12px;color:var(--mut);margin-top:6px;}
        .backbtn{display:inline-flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);color:var(--mut);padding:9px 15px;border-radius:11px;cursor:pointer;font-size:13px;font-family:inherit;margin-bottom:18px;}
        .backbtn:hover{color:var(--gold);border-color:var(--gold);}
        .sectorhead{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:6px;flex-wrap:wrap;}
        .sectorhead .big{font-family:'Sora';font-weight:800;font-size:clamp(26px,5vw,42px);letter-spacing:-1px;}
        .sectorhead .savg{font-family:'JetBrains Mono';font-weight:700;font-size:20px;}
        .secpage{max-width:1180px;margin:0 auto;padding:24px 22px 50px;min-height:70vh;}
        .toolbar{display:flex;gap:10px;margin:16px 0 18px;align-items:center;flex-wrap:wrap;}
        .searchbox{flex:1;min-width:200px;background:var(--panel);border:1px solid var(--line);color:var(--txt);padding:11px 14px;border-radius:11px;font-size:14px;font-family:inherit;outline:none;}
        .searchbox:focus{border-color:var(--gold);}
        .loadrow{color:var(--mut);font-size:13px;display:flex;align-items:center;gap:9px;margin-bottom:14px;}
        .spin2{width:13px;height:13px;border:2px solid var(--line);border-top-color:var(--gold);border-radius:50%;animation:rot .8s linear infinite;}
        @keyframes rot{to{transform:rotate(360deg)}}
        .empty{text-align:center;color:var(--mut);padding:36px 20px;font-size:14px;}
        .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:15px;}
        .card{background:linear-gradient(180deg,var(--panel),var(--panel2));border:1px solid var(--line);border-radius:18px;padding:18px;cursor:pointer;transition:transform .28s cubic-bezier(.2,.7,.2,1),border-color .28s,box-shadow .28s;}
        .card:hover{transform:translateY(-5px);border-color:rgba(245,166,35,.45);box-shadow:0 18px 40px -22px rgba(0,0,0,.9);}
        .card-top{display:flex;align-items:center;gap:13px;}
        .logo{border-radius:12px;overflow:hidden;flex-shrink:0;display:grid;place-items:center;background:#fff;}
        .logo img{width:100%;height:100%;object-fit:contain;padding:6px;background:#fff;}
        .logo.fb{color:#0b0b0b;font-family:'JetBrains Mono';font-weight:700;font-size:15px;}
        .ci{flex:1;min-width:0;}
        .ci .sy{font-family:'JetBrains Mono';font-weight:700;font-size:16px;}
        .ci .co{font-size:12.5px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .chg{display:inline-flex;align-items:center;gap:5px;font-family:'JetBrains Mono';font-weight:700;font-size:14px;padding:5px 9px;border-radius:9px;}
        .chg.u{color:var(--up);background:rgba(38,208,124,.12);}
        .chg.dn{color:var(--down);background:rgba(255,84,112,.12);}
        .card-mid{display:flex;align-items:flex-end;justify-content:space-between;margin-top:15px;gap:10px;}
        .price{font-family:'Sora';font-weight:700;font-size:24px;letter-spacing:-.5px;}
        .price small{font-size:12px;color:var(--mut);font-weight:500;margin-left:3px;}
        .spark path.line{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1.4s .2s forwards;}
        @keyframes draw{to{stroke-dashoffset:0}}
        .meta{display:flex;gap:8px;margin-top:13px;flex-wrap:wrap;}
        .tag{font-size:11px;color:var(--mut);background:var(--panel2);border:1px solid var(--line);padding:4px 10px;border-radius:20px;}
        .ov{position:fixed;inset:0;background:rgba(4,6,10,.74);backdrop-filter:blur(6px);z-index:80;display:grid;place-items:center;padding:18px;animation:fade .25s;}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        .modal{background:linear-gradient(180deg,var(--panel),var(--panel2));border:1px solid var(--line);border-radius:22px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;position:relative;animation:pop .3s cubic-bezier(.2,.8,.2,1);}
        @keyframes pop{from{opacity:0;transform:translateY(20px) scale(.98)}to{opacity:1;transform:none}}
        .mhead{padding:22px 22px 18px;border-bottom:1px solid var(--line);display:flex;gap:15px;align-items:center;}
        .mclose{position:absolute;top:14px;right:14px;background:var(--panel2);border:1px solid var(--line);color:var(--mut);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;}
        .mbody{padding:20px 22px 24px;}
        .mprice{display:flex;align-items:baseline;gap:12px;}
        .mprice .pp{font-family:'Sora';font-weight:800;font-size:36px;}
        .mnews-t{font-family:'Sora';font-weight:600;font-size:14px;margin:22px 0 12px;display:flex;align-items:center;gap:9px;}
        .chartbox{margin-top:16px;}
        .chartwrap{position:relative;height:130px;border-radius:14px;background:var(--panel2);border:1px solid var(--line);padding:12px;overflow:hidden;}
        .chartsvg{width:100%;height:100%;display:block;}
        .chartmsg{height:100%;display:flex;align-items:center;justify-content:center;gap:9px;color:var(--mut);font-size:13px;}
        .chi{position:absolute;right:12px;font-size:10px;color:var(--mut);background:rgba(13,17,24,.65);padding:1px 6px;border-radius:5px;}
        .chi.hi{top:10px;} .chi.lo{bottom:10px;}
        .ranges{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;}
        .ranges button{background:var(--panel);border:1px solid var(--line);color:var(--mut);padding:7px 13px;border-radius:9px;font-size:12px;cursor:pointer;font-family:inherit;}
        .ranges button.act{background:var(--gold);color:#1a1305;font-weight:600;border-color:var(--gold);}
        .liveb{font-size:9px;letter-spacing:1.2px;color:var(--up);border:1px solid rgba(38,208,124,.4);padding:2px 7px;border-radius:20px;}
        .nrow{display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--line);}
        .nrow .bar{width:3px;border-radius:3px;background:var(--gold);flex-shrink:0;}
        .nrow .nt{font-size:13.5px;line-height:1.45;font-weight:500;}
        .nrow .nm2{font-size:11px;color:var(--mut);margin-top:5px;}
        footer{max-width:1180px;margin:20px auto 0;padding:26px 22px 50px;border-top:1px solid var(--line);color:var(--mut);font-size:12px;line-height:1.7;}
        @media (max-width:640px){.clock{display:none;}.secgrid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));}}
      `}</style>

      <div className="prog" style={{width:progress+"%"}} />

      <div className="nav">
        <div className="brand" onClick={goHome}><div className="gdot"/><div className="bname">GLØD<small>·</small>MARKETS</div></div>
        <div className="navr">
          {live && <span className="livepill"><span className="b"/>Live</span>}
          {clock && <span className="clock mono">{clock.toLocaleTimeString("da-DK")}</span>}
          {sectorFilter && <button className={`ref ${loading?"spin":""}`} onClick={refresh} disabled={loading}><span className="ic">↻</span>{loading?"Henter":"Opdater"}</button>}
        </div>
      </div>

      {!showingList ? (
        <>
          <section className="hero">
            <div className="hero-bg"><div className="grid-lines"/></div>
            <div className="hero-in">
              <div className="eyebrow">Markedsintelligens · Realtid</div>
              <h1 className="h1">Hele markedet i én <span className="gl">app</span>.</h1>
              <p className="sub">{ALL.length} aktier og coins fordelt på sektorer. Tryk på en sektor eller søg efter et hvilket som helst symbol — live priser hentes med det samme.</p>
              <div className="bigsearch">
                <input placeholder="Søg aktie eller coin (fx NVDA, BTC, Tesla)…" value={search} onChange={(e)=>setSearch(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="sec">
            <Reveal><div className="sec-h"><div><div className="sec-t">Sektorer</div><div className="sec-d">Tryk for at åbne en sektor med live priser</div></div></div></Reveal>
            <div className="secgrid">
              {sectors.map((x,i)=>(
                <Reveal key={x.s} delay={i*35}>
                  <div className="secbar" onClick={()=>openSector(x.s)}>
                    <div className="nm">{x.s} <span className="arr">→</span></div>
                    <div className="cnt">{x.n} {x.s==="Krypto"?"coins":"aktier"}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="secpage">
          <button className="backbtn" onClick={goHome}>← {sectorFilter?"Alle sektorer":"Forside"}</button>
          <div className="sectorhead">
            <div className="big">{sectorFilter || `Søgning: ${search}`}</div>
            {shown.length>0 && <div className={`savg mono ${secAvg>=0?"up":"down"}`}>{secAvg>=0?"+":""}{secAvg.toFixed(2)}%</div>}
          </div>
          <div className="sec-d">{shown.length} resultater{loading?" · henter live priser…":""}</div>
          <div className="toolbar">
            {sectorFilter && <input className="searchbox" placeholder="Søg overalt…" value={search} onChange={(e)=>{ setSearch(e.target.value); setSectorFilter(null); }} />}
            <div className="seg">
              {[["alle","Alle"],["up","Stigere"],["down","Faldere"]].map(([k,l])=>(
                <button key={k} className={filter===k?"act":""} onClick={()=>setFilter(k)}>{l}</button>
              ))}
            </div>
          </div>
          {loading && <div className="loadrow"><span className="spin2"/>Henter live priser fra markedet…</div>}
          <CardGrid list={shown} onSelect={setSel}/>
          {!loading && shown.length===0 && <div className="empty">Ingen resultater.</div>}
        </section>
      )}

      <footer>
        <strong style={{color:"var(--txt)"}}>GLØD MARKETS</strong> · Aktiekurser via Finnhub, coins via CoinGecko. Priser kan være forsinkede.
        Intet på denne side udgør investeringsrådgivning.
      </footer>

      {selEff && (
        <div className="ov" onClick={()=>setSel(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="mclose" onClick={()=>setSel(null)}>✕</button>
            <div className="mhead">
              <Logo t={selEff.t} d={selEff.d} size={54}/>
              <div><div className="mono" style={{fontWeight:700,fontSize:18}}>{selEff.t}</div><div style={{color:"var(--mut)",fontSize:13}}>{selEff.n} · {selEff.s}</div></div>
            </div>
            <div className="mbody">
              <div className="mprice">
                <span className="pp mono">{selEff.p!=null?fmtP(selEff.p):"—"}</span>
                <span className={`chg ${selEff.c>=0?"u":"dn"}`}>{selEff.c>=0?"▲":"▼"} {Math.abs(selEff.c).toFixed(2)}%</span>
              </div>
              <ChartBox points={hist} loading={histLoading} kind={selEff.coin?"coin":"stock"} range={histRange} onRange={setHistRange}/>
              <div className="mnews-t">{selEff.coin?"Om":"Seneste nyheder"} {modalNews && modalNews.length>0 && <span className="liveb">LIVE</span>}</div>
              {selEff.coin && <div className="nm2" style={{color:"var(--mut)",fontSize:13}}>Live pris i USD med 24-timers ændring via CoinGecko.</div>}
              {!selEff.coin && !modalNews && <div className="nm2" style={{color:"var(--mut)",fontSize:13}}>Henter nyheder…</div>}
              {!selEff.coin && modalNews && modalNews.length===0 && <div className="nm2" style={{color:"var(--mut)",fontSize:13}}>Ingen nyheder lige nu.</div>}
              {!selEff.coin && (modalNews||[]).map((nw,i)=>{
                const time = nw.dt ? ago(nw.dt)+" siden" : "";
                const inner=(<div className="nrow" key={i}><div className="bar"/><div><div className="nt">{nw.h}</div><div className="nm2">{nw.src}{time?` · ${time}`:""}</div></div></div>);
                return nw.url ? <a key={i} href={nw.url} target="_blank" rel="noreferrer">{inner}</a> : inner;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
