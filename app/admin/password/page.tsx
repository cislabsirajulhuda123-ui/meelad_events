import {isAdmin} from '@/lib/admin';
import {redirect} from 'next/navigation';
import AuthForm from '../auth-form';
export const dynamic='force-dynamic';
export default async function Page(){if(!await isAdmin())redirect('/admin/login');
return <main className="container page"><h1>Portal passwords</h1><p>Anyone with the portal link and its password can use that portal. Set different passwords of at least 12 characters.</p><div className="grid2"><section className="card"><h2>Main Admin</h2><p>Full website management. Changing this password signs out other shared admin sessions.</p><a href="/admin/login">/admin/login</a><AuthForm setup role="admin"/></section><section className="card"><h2>Sub-admin</h2><p>Participant registration only.</p><a href="/sub-admin/login">/sub-admin/login</a><AuthForm setup role="registrar"/></section><section className="card"><h2>Media Team</h2><p>Add gallery photos and videos only.</p><a href="/media-team">/media-team</a><AuthForm setup role="media"/></section></div><a href="/admin">Back to admin</a></main>}
