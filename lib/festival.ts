import seed from "@/data/seed.json";
import { database } from "./database";
import { stateSchema, type Festival } from "./model";
export function db() {
  return database;
}
function withoutInterCampus(data: Festival): Festival {
  return {
    ...data,
    events: data.events.map((e) =>
      e.zone === "HI_ZONE_INTER" ? { ...e, zone: "HI_ZONE_CAMPUS" } : e,
    ),
    categoryLabels: Object.fromEntries(
      Object.entries(data.categoryLabels).filter(
        ([key]) => key !== "HI_ZONE_INTER",
      ),
    ),
  };
}
export async function loadFestival() {
  const r = await db()
    .prepare("SELECT payload,revision,updated_at FROM festival WHERE id = ?")
    .bind("main")
    .first<{ payload: string; revision: number; updated_at: string }>();
  const data = r
    ? stateSchema.parse(JSON.parse(r.payload))
    : stateSchema.parse(seed);
  return {
    data: withoutInterCampus(data),
    revision: r?.revision || 0,
    updatedAt: r?.updated_at || "2026-09-27T09:40:00Z",
  };
}
export function publicData(d: Festival): Festival {
  return {
    ...d,
    events: d.events.map((e) => ({
      ...e,
      results: e.published ? e.publishedResults : [],
      publishedResults: e.published ? e.publishedResults : [],
    })),
  };
}
export async function storeFestival(data: Festival, revision: number) {
  const r = await db()
    .prepare(
      "INSERT INTO festival (id,payload,revision,updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, revision=festival.revision+1, updated_at=excluded.updated_at WHERE festival.revision = ? RETURNING revision",
    )
    .bind("main", JSON.stringify(data), new Date().toISOString(), revision)
    .first<{ revision: number }>();
  if (!r) throw Error("CONFLICT");
  return r.revision;
}
