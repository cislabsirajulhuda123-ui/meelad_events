import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { db, loadFestival } from "@/lib/festival";
import RosterPrint from "./roster-print";
export const dynamic = "force-dynamic";
export default async function RosterPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [{ data }, rows] = await Promise.all([
    loadFestival(),
    db().prepare("SELECT payload FROM registrations ORDER BY chest").all<{ payload: string }>(),
  ]);
  const registrations = rows.results.map((r) => JSON.parse(r.payload) as {
    id: string; name: string; className?: string; chest: string; teamId: string; zone: string; eventIds: string[];
  });
  return <RosterPrint registrations={registrations} teams={data.teams} labels={data.categoryLabels} />;
}
