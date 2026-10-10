import {db} from '@/lib/festival';
import {validOrigin,passwordHash,newToken,digest,equalHash,sessionCookie} from '@/lib/admin';
export async function POST(req:Request){try{
 if(!validOrigin(req))return Response.json({error:'Invalid request'},{status:403});
 const raw=await req.text();if(raw.length>10000)return Response.json({error:'Request too large'},{status:413});
 const {key,password}=JSON.parse(raw),secret=process.env.ADMIN_SETUP_KEY;
 if(!secret||secret.length<24||typeof key!=='string'||!equalHash(await digest(key),await digest(secret)))return Response.json({error:'Invalid setup key'},{status:403});
 if(typeof password!=='string'||password.length<12||password.length>128)return Response.json({error:'Use 12–128 characters for the password'},{status:400});
 const salt=newToken(),hash=await passwordHash(password,salt);
 const account=await db().prepare('INSERT INTO admin_accounts (email,salt,hash,updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING RETURNING email').bind('portal:admin',salt,hash,new Date().toISOString()).first<{email:string}>();
 if(!account)return Response.json({error:'Already initialised. Sign in with your Main Admin password.'},{status:409});
 const token=newToken();await db().prepare('INSERT INTO admin_sessions (token_hash,email,expires_at) VALUES (?, ?, ?)').bind(await digest(token),'portal:admin',Date.now()+28800000).run();
 return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie(token),'Cache-Control':'no-store'}});
}catch{return Response.json({error:'Setup failed. Check database connection and run migrations.'},{status:503});}}
