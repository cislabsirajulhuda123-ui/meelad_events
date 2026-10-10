import {headers} from 'next/headers';
import {db} from './festival';
export const SESSION_COOKIE='cognizium_admin';
export async function digest(value:string){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join('');}
export function cookieToken(value:string|null){return value?.split(';').map(x=>x.trim()).find(x=>x.startsWith(SESSION_COOKIE+'='))?.slice(SESSION_COOKIE.length+1)||'';}
export type PortalRole='admin'|'registrar'|'media';
export const portalAccount=(role:PortalRole)=>'portal:'+role;
export async function portalRole():Promise<PortalRole|null>{
 const h=await headers(),token=cookieToken(h.get('cookie'));
 if(/^[a-f0-9]{64}$/.test(token)){
  const s=await db().prepare('SELECT email,expires_at FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).first<{email:string,expires_at:number}>();
  if(s&&s.expires_at>Date.now()){
   if(s.email===portalAccount('media'))return 'media';
   if(s.email===portalAccount('registrar'))return 'registrar';
   if(s.email===portalAccount('admin'))return 'admin';
  }
 }
 return null;
}
export async function isAdmin(){return await portalRole()==='admin';}
export async function adminEmail(){return await isAdmin()?'portal:admin':null;}
export function newToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');}
export function sessionCookie(token:string,age=28800){return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);return Array.from(new Uint8Array(bits),x=>x.toString(16).padStart(2,'0')).join('');}
export function equalHash(a:string,b:string){if(a.length!==b.length)return false;let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0;}
export function validOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
