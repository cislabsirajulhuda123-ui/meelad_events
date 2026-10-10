import {portalRole} from '@/lib/admin';
import {redirect} from 'next/navigation';
import AuthForm from '@/app/admin/auth-form';
export const dynamic='force-dynamic';
export default async function Page(){if(['admin','media'].includes(await portalRole()||''))redirect('/media-team');return <main className="auth-page"><section className="card"><h1>Media Team sign in</h1><p>Gallery photos and videos only. Use the password set by Main Admin.</p><AuthForm role="media"/></section><a href="/">Public site</a></main>}
