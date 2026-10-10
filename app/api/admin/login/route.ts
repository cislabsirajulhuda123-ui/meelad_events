import {passwordHash,equalHash,newToken,digest,sessionCookie,validOrigin,portalAccount} from '@/lib/admin';
import {db} from '@/lib/festival';
export async function POST(req:Request){try{
 if(!validOrigin(req))return Response.json({error:'Invalid request'},{status:403});
 const raw=await req.text();if(raw.length>10000)return Response.json({error:'Request too large'},{status:413});
 const body=JSON.parse(raw);if(!['admin','registrar','media'].includes(body.role)||typeof body.password!=='string'||body.password.length>128)return Response.json({error:'Invalid password.'},{status:400});
 const email=portalAccount(body.role),key=await digest(email),now=Date.now();
 const previous=await db().prepare('SELECT count,reset_at FROM login_attempts WHERE key = ?').bind(key).first<{count:number,reset_at:number}>();
 const count=!previous||previous.reset_at<now?1:previous.count+1;
 const resetAt=!previous||previous.reset_at<now?now+900000:previous.reset_at;
 await db().prepare('INSERT INTO login_attempts (key,count,reset_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET count=excluded.count, reset_at=excluded.reset_at').bind(key,count,resetAt).run();
 if(count>10)return Response.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429,headers:{'Retry-After':'900'}});
 const account=await db().prepare('SELECT salt,hash FROM admin_accounts WHERE email = ?').bind(email).first<{salt:string,hash:string}>();
 const hash=await passwordHash(body.password,account?.salt||'00000000000000000000000000000000');
 if(!account||!equalHash(hash,account.hash))return Response.json({error:'Incorrect password, or this portal password has not been set by the main admin.'},{status:401});
 const token=newToken();await db().batch([db().prepare('INSERT INTO admin_sessions (token_hash,email,expires_at) VALUES (?, ?, ?)').bind(await digest(token),email,now+28800000),db().prepare('DELETE FROM login_attempts WHERE key = ?').bind(key),db().prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(now)]);
 return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie(token),'Cache-Control':'no-store'}});
}catch(error){console.error('Admin login failed',error);return Response.json({error:'Sign-in temporarily unavailable. Please retry.'},{status:503});}}
