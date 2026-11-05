import {notFound} from "next/navigation";
import {db,loadFestival} from "@/lib/festival";
import {registrationSchema} from "@/lib/registration";
export const dynamic="force-dynamic";
export default async function CandidatePage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[a-f0-9-]{36}$/i.test(id))notFound();
 const row=await db().prepare("SELECT payload FROM registrations WHERE id=?").bind(id).first<{payload:string}>();
 if(!row)notFound();
 const p=registrationSchema.parse(JSON.parse(row.payload));
 const {data}=await loadFestival();
 const team=data.teams.find(t=>t.id===p.teamId)?.name||"Not available";
 const events=p.eventIds.map(eventId=>data.events.find(e=>e.id===eventId)?.name).filter(Boolean);
 return <main className="container page" style={{maxWidth:680}}><section className="card" style={{textAlign:"center",padding:28}}><p className="eyebrow">NOORUN ALA NOOR · CANDIDATE ID</p><h1>{p.name}</h1><div style={{fontSize:32,fontWeight:800,letterSpacing:3,margin:"14px 0"}}>{p.chest}</div><p>{p.className||"Class not specified"} · {team}</p><div style={{display:"flex",justifyContent:"center",margin:"22px 0"}}><img width="180" height="180" alt="Candidate QR code" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=2&data=${encodeURIComponent(`NOORUN|${p.id}|${p.chest}`)}`}/></div><h2>Registered competitions</h2><ul style={{textAlign:"left",display:"inline-block",margin:"10px auto"}}>{events.map(name=><li key={name}>{name}</li>)}</ul><p className="muted" style={{marginTop:20}}>Show this page or QR code to the invigilator for participation verification.</p></section></main>;
}
