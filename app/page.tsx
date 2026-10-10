import {loadFestival,publicData} from '@/lib/festival';
import FestivalSite from './site';
export const dynamic='force-dynamic';
export default async function Page(){try{const s=await loadFestival();return <FestivalSite initial={publicData(s.data)} view="home"/>}catch{return <main className="container section"><h1>Festival temporarily unavailable</h1><p>Please reload in a moment.</p></main>}}
