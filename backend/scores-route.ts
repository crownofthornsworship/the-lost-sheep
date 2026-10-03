import { env } from "cloudflare:workers";
export const runtime = "edge";
export async function GET() {
  try {
    const rows = await env.DB.prepare("SELECT name, score, levels FROM scores ORDER BY score DESC, levels DESC, created_at ASC LIMIT 25").all();
    return Response.json({ scores: rows.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("scores read", error);
    return Response.json({ error: "Scores are temporarily unavailable." }, { status: 503 });
  }
}
export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const name = typeof payload.name === "string" ? payload.name.trim().replace(/\s+/g, " ") : "";
    const score = Number(payload.score), levels = Number(payload.levels);
    const first = ["Bright", "Brave", "Happy", "Kind", "Little", "Sunny", "Gentle", "Joyful", "Clever", "Golden"];
    const second = ["Sheep", "Lamb", "Shepherd", "Star", "Dove", "Meadow", "Sunbeam", "Oak", "River", "Robin"];
    const parts = name.split(" ");
    if (parts.length !== 2 || !first.includes(parts[0]) || !second.includes(parts[1]) || !Number.isInteger(score) || score < 0 || score > levels * 400 || !Number.isInteger(levels) || levels < 1 || levels > 14) {
      return Response.json({ error: "Use a 2–18 character screen name and a valid score." }, { status: 400 });
    }
    await env.DB.prepare("INSERT INTO scores (name, score, levels, created_at) VALUES (?, ?, ?, ?)").bind(name, score, levels, Date.now()).run();
    await env.DB.prepare("DELETE FROM scores WHERE id NOT IN (SELECT id FROM scores ORDER BY score DESC, levels DESC, created_at ASC LIMIT 500)").run();
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("scores write", error);
    return Response.json({ error: "Could not save your score. Please try again." }, { status: 503 });
  }
}
