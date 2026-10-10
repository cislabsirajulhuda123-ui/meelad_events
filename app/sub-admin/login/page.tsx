import {portalRole} from '@/lib/admin';
import {redirect} from 'next/navigation';
import AuthForm from '@/app/admin/auth-form';
export const dynamic='force-dynamic';
export default async function Page(){if(['admin','registrar'].includes(await portalRole()||''))redirect('/sub-admin');return <main className="auth-page"><div className="card"><h1>Sub-admin sign in</h1><p>Enter the registration portal password. No email is needed.</p><AuthForm role="registrar"/></div><a href="/">Public website</a></main>}
