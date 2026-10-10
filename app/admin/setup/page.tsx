import Setup from './ui';
export const dynamic='force-dynamic';
export default function Page(){return <main className="auth-page"><h1>Owner setup</h1><p>Use the setup key you entered in Vercel Environment Variables to create the first Main Admin password.</p><Setup/></main>}
