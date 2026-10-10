import {portalRole} from '@/lib/admin';
import {redirect} from 'next/navigation';
import RegistrationPortal from './ui';
export const dynamic='force-dynamic';
export default async function Page(){if(!['admin','registrar'].includes(await portalRole()||''))redirect('/sub-admin/login');return <RegistrationPortal/>}
