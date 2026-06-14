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
    news:[{h:"Azure-vækst accelererer på AI-arbejdsbelastninger",src:"Blo
