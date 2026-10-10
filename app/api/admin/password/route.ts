import {isAdmin,newToken,passwordHash,validOrigin,portalAccount,digest,sessionCookie,equalHash} from '@/lib/admin';
import {db} from '@/lib/festival';
export async function POST(req:Request){try{
 if(!validOrigin(req)||!await isAdmin())return Response.json({error:'Main admin access required.'},{status:403});
 const raw=await req.text();if(raw.length>10000)return Response.json({error:'Request too large'},{status:413});
 const {password,role}=JSON.parse(raw);
 if(!['admin','registrar','media'].includes(role)||typeof password!=='string'||password.length<12||password.length>128)return Response.json({error:'Choose a portal and use 12–128 characters.'},{status:400});
 const others=await db().prepare('SELECT salt,hash FROM admin_accounts WHERE email != ?').bind(portalAccount(role)).all<{salt:string,hash:string}>();for(const other of others.results)if(equalHash(await passwordHash(password,other.salt),other.hash))return Response.json({error:'Use a different password for each portal.'},{status:400});
 const email=portalAccount(role),salt=newToken(),hash=await passwordHash(password,salt);
 await db().batch([db().prepare('INSERT INTO admin_accounts (email,salt,hash,updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET salt=excluded.salt,hash=excluded.hash,updated_at=excluded.updated_at').bind(email,salt,hash,new Date().toISOString()),db().prepare('DELETE FROM admin_sessions WHERE email = ?').bind(email)]);
 const responseHeaders:Record<string,string>={'Cache-Control':'no-store'};if(role==='admin'){const token=newToken();await db().prepare('INSERT INTO admin_sessions (token_hash,email,expires_at) VALUES (?, ?, ?)').bind(await digest(token),email,Date.now()+28800000).run();responseHeaders['Set-Cookie']=sessionCookie(token)}return Response.json({ok:true},{headers:responseHeaders});
}catch{return Response.json({error:'Could not set password. Please retry.'},{status:503});}}
