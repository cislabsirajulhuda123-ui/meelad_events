import {createClient,type Client,type InValue} from '@libsql/client';
let connection:Client|undefined;
export function client(){if(!connection){const url=process.env.TURSO_DATABASE_URL;if(!url)throw Error('Database not configured');connection=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN})}return connection}
class Statement{
 constructor(readonly sql:string,readonly args:InValue[]=[]){ }
 bind(...args:InValue[]){return new Statement(this.sql,args)}
 async first<T>(){const r=await client().execute({sql:this.sql,args:this.args});return (r.rows[0] as unknown as T)||null}
 async all<T>(){const r=await client().execute({sql:this.sql,args:this.args});return {results:r.rows as unknown as T[]}}
 async run(){return client().execute({sql:this.sql,args:this.args})}
}
export const database={prepare:(sql:string)=>new Statement(sql),batch:(statements:Statement[])=>client().batch(statements.map(s=>({sql:s.sql,args:s.args})),'write')};
