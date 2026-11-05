import { portalRole, validOrigin } from "@/lib/admin";
import { db, loadFestival, storeFestival } from "@/lib/festival";
import { registrationSchema } from "@/lib/registration";
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(req:Request){
 try{
  const role=await portalRole(); if(!["admin","maininvigilator","invigilator"].includes(role||"")) return reply({error:"Invigilator access required"},403);
  const {data}=await loadFestival();
  if(role!=="admin" && (role==="maininvigilator"?!data.settings.mainInvigilatorEnabled:!data.settings.invigilatorEnabled)) return reply({error:"This portal is disabled by Main Admin"},403);
  const {results}=await db().prepare("SELECT event_id,registration_id,chest,participant_name,COUNT(*) OVER(PARTITION BY event_id) AS total FROM event_attendance").all<{event_id:string,registration_id:string,chest:string,participant_name:string,total:number}>();
  return reply({events:data.events.map(e=>({id:e.id,name:e.name,zone:e.zone,participationOpen:e.participationOpen,attendance:results.find(x=>x.event_id===e.id)?.total||0})),attendance:results.map(x=>({eventId:x.event_id,registrationId:x.registration_id,chest:x.chest,name:x.participant_name})),revision:(await loadFestival()).revision});
 }catch{return reply({error:"Attendance service unavailable. Run database migrations."},503)}
}
export async function PATCH(req:Request){
 try{
  if(!validOrigin(req))return reply({error:"Invalid request"},403);
  const role=await portalRole(); if(!["admin","maininvigilator"].includes(role||""))return reply({error:"Main Invigilator access required"},403);
  const {data,revision}=await loadFestival(); if(role==="maininvigilator"&&!data.settings.mainInvigilatorEnabled)return reply({error:"Portal disabled"},403);
  const body=await req.json() as {eventId?:string;open?:boolean;revision?:number};
  if(role!=="admin" && !Number.isInteger(body.revision))return reply({error:"Reload the event list"},400);
  if(role!=="admin" && body.revision!==revision)return reply({error:"Data changed. Reload and retry."},409);
  const event=data.events.find(e=>e.id===body.eventId); if(!event||typeof body.open!=="boolean")return reply({error:"Invalid event or status"},400);
  event.participationOpen=body.open; const next=await storeFestival(data,revision); return reply({ok:true,revision:next,open:event.participationOpen});
 }catch(e){return reply({error:(e as Error).message==="CONFLICT"?"Data changed. Reload and retry.":"Could not update participation."},409)}
}
export async function POST(req:Request){
 try{
  if(!validOrigin(req))return reply({error:"Invalid request"},403);
  if(await portalRole()!=="invigilator")return reply({error:"Invigilator sign-in required"},403);
  const {data}=await loadFestival(); if(!data.settings.invigilatorEnabled)return reply({error:"Invigilator portal disabled"},403);
  const body=await req.json() as {eventId?:string;chest?:string}; const event=data.events.find(e=>e.id===body.eventId);
  if(!event||!event.participationOpen)return reply({error:"Participation is closed for this competition"},403);
  const chest=String(body.chest||"").trim().toUpperCase(); if(!/^[A-Z][A-Z0-9]{3,15}$/.test(chest))return reply({error:"Enter a valid chest number"},400);
  const {results}=await db().prepare("SELECT id,payload FROM registrations WHERE chest=?").bind(chest).all<{id:string,payload:string}>();
  const found=results[0]; if(!found)return reply({error:"Candidate not found"},404);
  const p=registrationSchema.parse(JSON.parse(found.payload)); if(!p.eventIds.includes(event.id))return reply({error:"This candidate is not registered for this competition"},403);
  const existing=await db().prepare("SELECT id FROM event_attendance WHERE event_id=? AND registration_id=?").bind(event.id,p.id).first<{id:string}>();
  if(existing)return reply({ok:true,alreadyMarked:true,message:"Participation already marked."});
  await db().prepare("INSERT INTO event_attendance(id,event_id,registration_id,chest,participant_name,team_id,marked_at,marked_by) VALUES(?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),event.id,p.id,p.chest,p.name,p.teamId,new Date().toISOString(),"invigilator").run();
  return reply({ok:true,participant:{name:p.name,chest:p.chest,className:p.className},message:"Participation marked."});
 }catch{return reply({error:"Could not mark participation. Check that migrations are complete."},503)}
}
