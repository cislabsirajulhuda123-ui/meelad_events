import { loadFestival, publicData, storeFestival } from "@/lib/festival";
import { stateSchema } from "@/lib/model";
import { isAdmin } from "@/lib/admin";
export const dynamic = "force-dynamic";
const reply = (d: unknown, status = 200) =>
  Response.json(d, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(req: Request) {
  try {
    const admin = new URL(req.url).searchParams.get("admin") === "1";
    if (admin && !(await isAdmin()))
      return reply({ error: "Admin access required" }, 403);
    const s = await loadFestival();
    return reply({ ...s, data: admin ? s.data : publicData(s.data) });
  } catch (e) {
    console.error("Read failed", e);
    return reply(
      { error: "Results temporarily unavailable. Please retry." },
      503,
    );
  }
}
export async function POST(req: Request) {
  try {
    if (!(await isAdmin()))
      return reply({ error: "Admin access required" }, 403);
    if (req.headers.get("origin") !== new URL(req.url).origin)
      return reply({ error: "Invalid request origin" }, 403);
    if (Number(req.headers.get("content-length") || 0) > 1500000)
      return reply({ error: "Payload too large" }, 413);
    const body = await req.text();
    if (body.length > 1500000)
      return reply({ error: "Payload too large" }, 413);
    const input = JSON.parse(body);
    if (!Number.isInteger(input.revision) || input.revision < 0)
      return reply({ error: "Invalid revision" }, 400);
    const current = await loadFestival();
    if (current.revision !== input.revision)
      return reply(
        { error: "Another change was saved. Reload before saving again." },
        409,
      );
    const data = stateSchema.parse(input.data);
    const action = input.action;
    if (!["save", "publish", "unpublish"].includes(action))
      return reply({ error: "Invalid action" }, 400);
    for (const event of data.events) {
      const prev = current.data.events.find((e) => e.id === event.id);
      event.published = prev?.published ?? false;
      event.publishedResults = (prev?.publishedResults ?? []).map((r) => {
        const oldTeam = current.data.teams.find((t) => t.name === r.team);
        const renamed = data.teams.find((t) => t.id === oldTeam?.id);
        return { ...r, team: renamed?.name ?? r.team };
      });
      if (event.id === input.eventId && action === "publish") {
        if (!event.results.length)
          return reply(
            { error: "Add at least one result before publishing." },
            400,
          );
        if (!event.resultNumber) {
          const highest = data.events.reduce((max, e) => {
            const n = Number.parseInt(e.resultNumber, 10);
            return Number.isFinite(n) ? Math.max(max, n) : max;
          }, 0);
          event.resultNumber = String(highest + 1).padStart(2, "0");
        }
        event.published = true;
        event.publishedResults = structuredClone(event.results);
      }
      if (event.id === input.eventId && action === "unpublish")
        event.published = false;
    }
    if (action !== "save" && !data.events.some((e) => e.id === input.eventId))
      return reply({ error: "Event not found" }, 404);
    stateSchema.parse(data);
    const revision = await storeFestival(data, input.revision);
    return reply({ data, revision, updatedAt: new Date().toISOString() });
  } catch (e) {
    if (e instanceof Error && e.message === "CONFLICT")
      return reply(
        { error: "Another change was saved. Reload before saving again." },
        409,
      );
    if (
      e instanceof SyntaxError ||
      (e as { name?: string }).name === "ZodError"
    )
      return reply(
        { error: "Check names, teams, grades and points before saving." },
        400,
      );
    console.error("Save failed", e);
    return reply(
      { error: "Could not save. Changes remain on screen; please retry." },
      503,
    );
  }
}
