import { portalRole, validOrigin } from "@/lib/admin";
import { db } from "@/lib/festival";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const r = await db()
    .prepare("SELECT src FROM gallery_media WHERE id=?")
    .bind(id)
    .first<{ src: string }>();
  if (!r) return new Response("Not found", { status: 404 });
  if (r.src.startsWith("https://")) return Response.redirect(r.src);
  const [head, data] = r.src.split(",");
  return new Response(Buffer.from(data, "base64"), {
    headers: {
      "Content-Type": head.slice(5).split(";")[0],
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = await portalRole();
    if (!["admin", "media"].includes(role || "") || !validOrigin(req))
      return Response.json(
        { error: "Media team access required" },
        { status: 403 },
      );
    const { id } = await params,
      b = await req.json();
    if (typeof b.title !== "string" || !b.title.trim() || b.title.length > 200)
      return Response.json({ error: "Enter a valid caption" }, { status: 400 });
    await db()
      .prepare("UPDATE gallery_media SET title=? WHERE id=?")
      .bind(b.title.trim(), id)
      .run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not update media" }, { status: 400 });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = await portalRole();
    if (!["admin", "media"].includes(role || "") || !validOrigin(req))
      return Response.json(
        { error: "Media team access required" },
        { status: 403 },
      );
    const { id } = await params;
    await db().prepare("DELETE FROM gallery_media WHERE id=?").bind(id).run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not delete media" }, { status: 400 });
  }
}
