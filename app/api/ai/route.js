// GLØD AI — server-side assistant via Google Gemini (key stays server-side).
import { STOCKS, COINS } from "../../stocks";
export const dynamic = "force-dynamic";

const SYS = `Du er "GLØD AI", en venlig og professionel markedsassistent på den danske finansside GLØD MARKETS.
Du hjælper brugere med at forstå aktier og kryptovalutaer: hvad et selskab/en coin er, hvad de laver, deres forretningsmodel, vækstplaner og generelle udsigter.
Svar altid på dansk, klart og kortfattet (maks ca. 180 ord), i en hjælpsom tone.
Du giver ALDRIG personlige købs- eller salgsanbefalinger. Afslut altid med en kort linje: "⚠️ Dette er ikke investeringsrådgivning."
Hvis du ikke kender et helt aktuelt tal (fx dagens kurs), så sig at brugeren kan se live-prisen på siden.`;

export async function POST(req){
  const key = process.env.GEMINI_API_KEY;
  if(!key) return Response.json({ reply: "AI er ikke konfigureret endnu." });
  try{
    const { messages } = await req.json();
    const hist = (Array.isArray(messages)?messages:[]).slice(-12).map(m=>({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content||"").slice(0,2000) }],
    }));
    const body = {
      systemInstruction: { parts: [{ text: SYS }] },
      contents: hist,
      generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
    };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body), cache:"no-store" });
    const j = await r.json();
    const reply = j?.candidates?.[0]?.content?.parts?.map(p=>p.text).join("") || "Beklager, jeg kunne ikke svare lige nu. Prøv igen.";
    return Response.json({ reply });
  }catch(e){
    return Response.json({ reply: "Der opstod en fejl. Prøv igen om lidt." });
  }
}
