'use client';
import {useState} from 'react';
export default function AuthForm({setup=false,role='admin'}:{setup?:boolean,role?:'admin'|'registrar'|'media'}){
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setError('');setMessage('');if(setup&&password!==confirm){setError('Passwords do not match.');return}setBusy(true);try{
 const r=await fetch('/api/admin/'+(setup?'password':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role,password})});const j=await r.json() as {error?:string};if(!r.ok)throw Error(j.error);
 setPassword('');setConfirm('');if(setup){setMessage('Password saved. Share the portal link and password with authorised users. Existing sessions for this portal have been signed out.');}else window.location.assign(role==='admin'?'/admin':role==='media'?'/media-team':'/sub-admin');
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <form onSubmit={submit} className="auth-form"><label>{setup?'New portal password':'Password'}<input type="password" autoComplete={setup?'new-password':'current-password'} required minLength={setup?12:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>{setup&&<label>Confirm password<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}{error&&<p className="error" role="alert">{error}</p>}{message&&<p className="success" role="status">{message}</p>}<button className="btn" disabled={busy}>{busy?'Please wait…':setup?'Save portal password':'Sign in'}</button></form>
}
