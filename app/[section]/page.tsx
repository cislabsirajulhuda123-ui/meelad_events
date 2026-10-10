import {loadFestival,publicData} from '@/lib/festival';
import {notFound} from 'next/navigation';
import FestivalSite from '../site';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!['results','standings','concept','brochure','student','gallery'].includes(section))notFound();try{const s=await loadFestival();return <FestivalSite initial={publicData(s.data)} view={section}/>}catch{return <main className="container section"><h1>Page temporarily unavailable</h1><p>Please reload in a moment.</p><a href="/">Home</a></main>}}
