import {isAdmin} from '@/lib/admin';
import {redirect} from 'next/navigation';
import AuthForm from '../auth-form';
export const dynamic='force-dynamic';
export default async function Page(){if(await isAdmin())redirect('/admin');return <main className="auth-page"><a href="/"><img src="/meelad-logo.webp" width="110" height="110" alt="Meelad Kunduthode"/></a><div className="card"><div className="eyebrow">FESTIVAL MANAGEMENT</div><h1>Admin sign in</h1><p>Enter the shared Main Admin password. No email is needed.</p><AuthForm/><a className="text-link" href="/admin/setup">Owner: first-time setup</a></div><a className="back" href="/">← Public website</a></main>}
