import { portalRole, validOrigin } from "@/lib/admin";
import { db, loadFestival } from "@/lib/festival";
import { registrationSchema } from "@/lib/registration";
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  try {
    const role = await portalRole();
    if (role !== "admin" && role !== "registrar")
      return reply({ error: "Portal sign-in required" }, 403);
    const { results } = await db()
      .prepare("SELECT payload,revision FROM registrations ORDER BY chest")
      .all<{ payload: string; revision: number }>();
    const { data } = await loadFestival();
    return reply({
      registrationOpen: data.registrationOpen,
      stageRegistrationOpen: data.stageRegistrationOpen,
      offStageRegistrationOpen: data.offStageRegistrationOpen,
      canEdit: role === "admin" || data.registrationOpen,
      registrations: results.map((r) => ({
        ...JSON.parse(r.payload),
        revision: r.revision,
      })),
      teams: data.teams,
      events: data.events.map(({ id, name, zone, type, category }) => ({
        id,
        name,
        zone,
        type,
        category,
      })),
      categoryLabels: data.categoryLabels,
    });
  } catch {
    return reply({ error: "Registrations unavailable. Please retry." }, 503);
  }
}
export async function POST(req: Request) {
  try {
    const role = await portalRole();
    if ((role !== "admin" && role !== "registrar") || !validOrigin(req))
      return reply({ error: "Portal sign-in required" }, 403);
    const raw = await req.text();
    if (raw.length > 50000) return reply({ error: "Request too large" }, 413);
    const body = JSON.parse(raw);
    if (!Number.isInteger(body.revision) || body.revision < 0)
      return reply({ error: "Invalid revision" }, 400);
    const p = registrationSchema.parse(body.registration),
      { data } = await loadFestival();
    // Assign a stable chest number when a participant is first created.
    if (!p.chest) {
      const team = data.teams.find((t) => t.id === p.teamId);
      if (!team) return reply({ error: "Choose a valid team." }, 400);
      const prefix = (team.name.trim()[0] || "X").toUpperCase().replace(/[^A-Z]/g, "X");
      const existing = await db().prepare("SELECT chest FROM registrations").all<{ chest: string }>();
      const used = new Set(existing.results.map((x) => x.chest.toUpperCase()));
      let serial = 1;
      while (serial <= 9999 && used.has(`${prefix}${String(serial).padStart(4, "0")}`)) serial++;
      if (serial > 9999) return reply({ error: `Chest numbers for team ${team.name} are full.` }, 409);
      p.chest = `${prefix}${String(serial).padStart(4, "0")}`;
    }
    if (role !== "admin" && !data.registrationOpen)
      return reply(
        { error: "Registration is closed. Contact the main admin." },
        403,
      );
    if (
      !data.teams.some((t) => t.id === p.teamId) ||
      !p.eventIds.every((id) => {
        const event = data.events.find((e) => e.id === id && e.zone === p.zone);
        return !!event && (role === "admin" || (event.category === "Stage" ? data.stageRegistrationOpen : data.offStageRegistrationOpen));
      })
    )
      return reply(
        { error: "Choose a valid team and events in an open registration category." },
        400,
      );
    p.eventIds = [...new Set(p.eventIds)];
    const r = await db()
      .prepare(
        "INSERT INTO registrations (id,chest,payload,revision,updated_at) SELECT ?, ?, ?, 1, ? WHERE ? = 0 OR EXISTS(SELECT 1 FROM registrations WHERE id = ?) ON CONFLICT(id) DO UPDATE SET chest=excluded.chest,payload=excluded.payload,revision=registrations.revision+1,updated_at=excluded.updated_at WHERE registrations.revision = ? RETURNING revision",
      )
      .bind(
        p.id,
        p.chest,
        JSON.stringify(p),
        new Date().toISOString(),
        body.revision,
        p.id,
        body.revision,
      )
      .first<{ revision: number }>();
    if (!r)
      return reply(
        { error: "This registration changed. Reload before editing." },
        409,
      );
    return reply({ registration: { ...p, revision: r.revision } });
  } catch (e) {
    if ((e as Error).message?.includes("UNIQUE"))
      return reply({ error: "This chest number is already registered." }, 409);
    if ((e as Error).name === "ZodError" || e instanceof SyntaxError)
      return reply(
        { error: "Check participant details and select at least one event." },
        400,
      );
    return reply({ error: "Could not save registration. Please retry." }, 503);
  }
}
export async function DELETE(req: Request) {
  try {
    const role = await portalRole();
    if ((role !== "admin" && role !== "registrar") || !validOrigin(req))
      return reply({ error: "Portal sign-in required" }, 403);
    const { data } = await loadFestival();
    if (role !== "admin" && !data.registrationOpen)
      return reply(
        { error: "Registration is closed. Contact the main admin." },
        403,
      );
    const body = await req.json();
    if (typeof body.id !== "string")
      return reply({ error: "Invalid participant" }, 400);
    await db()
      .prepare("DELETE FROM registrations WHERE id=?")
      .bind(body.id)
      .run();
    return reply({ ok: true });
  } catch {
    return reply(
      { error: "Could not delete registration. Please retry." },
      503,
    );
  }
}
