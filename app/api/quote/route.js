// Server-side proxy. The Finnhub key never reaches the browser.
export const dynamic = "force-dynamic";

const SYMBOLS = [
  "NVDA","AMD","TSM","AVGO","AAPL","MSFT","GOOGL","META","AMZN","TSLA",
  "TMUS","NVO","BNTX","VERU","FRD","ONDS","FLY","ENVX","QS","BITF",
];

export async function GET() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    return Response.json({ error: "missing_key" }, { status: 500 });
  }
  const quotes = {};
  await Promise.all(
    SYMBOLS.map(async (sym) => {
      try {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`,
          { cache: "no-store" }
        );
        const q = await r.json();
        if (q && typeof q.c === "number" && q.c > 0) {
          quotes[sym] = { p: q.c, c: typeof q.dp === "number" ? q.dp : 0 };
        }
      } catch (e) {
        /* skip this symbol */
      }
    })
  );
  return Response.json({ quotes });
}
