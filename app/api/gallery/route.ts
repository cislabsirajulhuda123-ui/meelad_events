import { portalRole, validOrigin } from "@/lib/admin";
import { db } from "@/lib/festival";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { results } = await db()
      .prepare(
        "SELECT id,title,kind FROM gallery_media WHERE kind IN ('photo','video') ORDER BY created_at DESC",
      )
      .all();
    return Response.json(
      { items: results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Gallery unavailable" }, { status: 503 });
  }
}
export async function POST(req: Request) {
  try {
    const role = await portalRole();
    if (!["admin", "media"].includes(role || "") || !validOrigin(req))
      return Response.json(
        { error: "Media team access required" },
        { status: 403 },
      );
    const raw = await req.text();
    if (raw.length > 4200000)
      return Response.json(
        { error: "Use a file under 3 MB, or add an HTTPS media link." },
        { status: 413 },
      );
    const b = JSON.parse(raw);
    if (
      Object.keys(b).some((k) => !["title", "kind", "src"].includes(k)) ||
      typeof b.title !== "string" ||
      !b.title.trim() ||
      b.title.length > 200 ||
      !["photo", "video"].includes(b.kind) ||
      typeof b.src !== "string"
    )
      return Response.json(
        { error: "Check title and media type" },
        { status: 400 },
      );
    const pattern =
      b.kind === "photo"
        ? /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/
        : /^data:video\/(mp4|webm);base64,[A-Za-z0-9+/=]+$/;
    if (!pattern.test(b.src) && !/^https:\/\/[^\s]+$/.test(b.src))
      return Response.json(
        { error: "Use a supported file or HTTPS media URL" },
        { status: 400 },
      );
    const id = crypto.randomUUID();
    await db()
      .prepare(
        "INSERT INTO gallery_media(id,title,kind,src,created_at) VALUES (?,?,?,?,?)",
      )
      .bind(id, b.title.trim(), b.kind, b.src, new Date().toISOString())
      .run();
    return Response.json({ ok: true, id });
  } catch {
    return Response.json(
      { error: "Could not add media. Please retry." },
      { status: 400 },
    );
  }
}
