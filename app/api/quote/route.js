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
    SYMBOLS.map(async (sym)
