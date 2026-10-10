import {createClient} from '@libsql/client';
import {readFile,readdir} from 'node:fs/promises';
const url=process.env.TURSO_DATABASE_URL;if(!url)throw Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first');
const db=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN});
await db.execute('CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY)');
for(const file of (await readdir('drizzle')).filter(x=>x.endsWith('.sql')).sort()){
 const existing=await db.execute({sql:'SELECT name FROM app_migrations WHERE name = ?',args:[file]});if(existing.rows.length)continue;
 const sql=await readFile('drizzle/'+file,'utf8');
 await db.batch([...sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean),{sql:'INSERT INTO app_migrations(name) VALUES (?)',args:[file]}],'write');
 console.log('Applied '+file);
}
db.close();
