import {isAdmin} from '@/lib/admin';
import {redirect} from 'next/navigation';
import {loadFestival} from '@/lib/festival';
import Admin from './ui';
export const dynamic='force-dynamic';
export default async function Page(){if(!await isAdmin())redirect('/admin/login');try{const s=await loadFestival();return <Admin initial={s.data} initialRevision={s.revision}/>}catch{return <main className="container section"><h1>Admin temporarily unavailable</h1><p>Please reload to reconnect.</p></main>}}
