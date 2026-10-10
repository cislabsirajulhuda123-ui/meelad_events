import { portalRole, validOrigin } from "@/lib/admin";
import { db } from "@/lib/festival";
import { posterCategories } from "@/lib/poster";

export async function POST(req: Request) {
  try {
    if ((await portalRole()) !== "admin" || !validOrigin(req))
      return Response.json(
        { error: "Main Admin access required" },
        { status: 403 },
      );
    const raw = await req.text();
    if (raw.length > 4200000)
      return Response.json(
        { error: "Choose an image under 3 MB." },
        { status: 413 },
      );
    const body = JSON.parse(raw) as { category?: string; src?: string };
    const validCategory =
      posterCategories.some((c) => c.key === body.category) ||
      (typeof body.category === "string" &&
        /^event:[a-zA-Z0-9_-]{1,200}$/.test(body.category));
    if (
      !validCategory ||
      typeof body.src !== "string" ||
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(body.src)
    )
      return Response.json(
        { error: "Choose a PNG, JPG or WEBP image." },
        { status: 400 },
      );
    const id = crypto.randomUUID();
    await db()
      .prepare(
        "INSERT INTO gallery_media(id,title,kind,src,created_at) VALUES (?,?,?,?,?)",
      )
      .bind(
        id,
        `Poster template: ${body.category}`,
        "poster",
        body.src,
        new Date().toISOString(),
      )
      .run();
    return Response.json({ url: `/api/gallery/${id}` });
  } catch {
    return Response.json(
      { error: "Could not upload poster draft." },
      { status: 400 },
    );
  }
}
