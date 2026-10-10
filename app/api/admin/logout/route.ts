import {cookieToken,digest,sessionCookie,validOrigin} from '@/lib/admin';
import {db} from '@/lib/festival';
export async function POST(req:Request){if(!validOrigin(req))return new Response('Invalid request',{status:403});const token=cookieToken(req.headers.get('cookie'));if(token)await db().prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).run();return new Response(null,{status:303,headers:{Location:'/admin/login','Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}});}
