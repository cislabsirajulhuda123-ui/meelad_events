import {portalRole} from '@/lib/admin';
import {redirect} from 'next/navigation';
import MediaPortal from './ui';
export const dynamic='force-dynamic';
export default async function Page(){if(!['admin','media'].includes(await portalRole()||''))redirect('/media-team/login');return <MediaPortal/>}
