import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'MEELAD KUNDUTHODE',description:'Festival events, results and championship standings.',icons:{icon:'/meelad-logo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><link rel="stylesheet" href="/fonts.css"/></head><body>{children}</body></html>}
