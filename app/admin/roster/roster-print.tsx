"use client";
import { useMemo, useState } from "react";
import { zones } from "@/lib/model";
type Candidate = { id:string; name:string; className?:string; chest:string; teamId:string; zone:string; eventIds:string[] };
export default function RosterPrint({registrations,teams,labels}:{registrations:Candidate[];teams:{id:string;name:string}[];labels:Record<string,string>}) {
  const [zone,setZone]=useState("ALL");
  const [team,setTeam]=useState("ALL");
  const names={...zones,...labels};
  const rows=useMemo(()=>registrations.filter(p=>(zone==="ALL"||p.zone===zone)&&(team==="ALL"||p.teamId===team)),[registrations,zone,team]);
  const qr=(p:Candidate)=>`https://api.qrserver.com/v1/create-qr-code/?size=128x128&margin=2&data=${encodeURIComponent(`NOORUN|${p.id}|${p.chest}`)}`;
  return <main className="roster-page">
    <div className="roster-controls no-print">
      <h1>Candidate Roster Poster</h1><p>Names, chest numbers, class and QR codes only. No marks or results are included.</p>
      <div className="roster-filters"><label>Category<select value={zone} onChange={e=>setZone(e.target.value)}><option value="ALL">All categories</option>{Object.entries(names).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Team<select value={team} onChange={e=>setTeam(e.target.value)}><option value="ALL">All teams</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><button className="btn" onClick={()=>window.print()}>Print / Save as PDF</button><a className="btn outline" href="/admin">Back to Admin</a></div>
      <p>{rows.length} candidates selected.</p>
    </div>
    <section className="roster-sheet"><header><h1>NOORUN ALA NOOR</h1><h2>CANDIDATE ROSTER</h2><p>{zone==="ALL"?"All Categories":names[zone]||zone} {team!=="ALL"?` · ${teams.find(t=>t.id===team)?.name||""}`:""}</p></header>
      <div className="roster-grid">{rows.map(p=><article className="roster-card" key={p.id}><img src={qr(p)} alt={`QR code for ${p.name}`} loading="eager"/><div><strong>{p.name}</strong><b>{p.chest}</b><span>{p.className||"Class not specified"}</span><small>{teams.find(t=>t.id===p.teamId)?.name||"Team not found"}</small><a className="no-print" href={`/candidate/${p.id}`} target="_blank" rel="noreferrer">Open candidate portal ↗</a></div></article>)}</div>
      {!rows.length&&<p className="empty-roster">No candidates in this selection.</p>}
      <footer>NOORUN ALA NOOR · OFFICIAL CANDIDATE LIST</footer>
    </section>
    <style jsx>{` .roster-page{max-width:1200px;margin:30px auto;padding:20px;color:#14202b}.roster-controls{margin-bottom:24px}.roster-filters{display:flex;gap:12px;align-items:end;flex-wrap:wrap}.roster-filters label{display:grid;gap:5px}.roster-filters select{min-width:180px;padding:10px;border:1px solid #bbb;border-radius:8px}.roster-sheet{background:white;color:#14202b;padding:28px;border:1px solid #ddd}.roster-sheet header{text-align:center;border-bottom:3px solid #14202b;padding-bottom:14px;margin-bottom:20px}.roster-sheet header h1{font-size:28px;letter-spacing:3px;margin:0}.roster-sheet header h2{font-size:18px;letter-spacing:2px;margin:8px 0 4px}.roster-sheet header p{margin:0}.roster-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.roster-card{display:flex;align-items:center;gap:10px;border:1px solid #ccd3d9;border-radius:10px;padding:10px;min-height:112px;break-inside:avoid}.roster-card img{width:86px;height:86px;object-fit:contain}.roster-card div{display:grid;gap:4px;min-width:0}.roster-card strong{font-size:14px;overflow-wrap:anywhere}.roster-card b{font-size:19px;letter-spacing:1px}.roster-card span,.roster-card small{font-size:11px;color:#53616d}.roster-card a{font-size:10px;color:#126b78;text-decoration:underline}.roster-sheet footer{text-align:center;border-top:1px solid #ccd3d9;margin-top:20px;padding-top:10px;font-size:10px;letter-spacing:2px}.empty-roster{text-align:center;padding:40px}@media(max-width:700px){.roster-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media print{@page{size:A4;margin:10mm}.no-print{display:none!important}.roster-page{margin:0;padding:0;max-width:none}.roster-sheet{border:0;padding:0}.roster-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.roster-card{padding:6px;min-height:94px}.roster-card img{width:68px;height:68px}.roster-card strong{font-size:11px}.roster-card b{font-size:16px}.roster-card span,.roster-card small{font-size:9px}}`}</style>
  </main>;
}
