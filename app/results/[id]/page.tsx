import {loadFestival,publicData} from '@/lib/festival';
import {notFound} from 'next/navigation';
import FestivalSite from '../../site';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const s=await loadFestival();if(!s.data.events.some(e=>e.id===id))notFound();return <FestivalSite initial={publicData(s.data)} view="scorecard" eventId={id}/>}
