'use client';
import {createContext,useContext,type ImgHTMLAttributes,type ReactNode} from 'react';
const Context=createContext<Record<string,string>>({});
export function ContentProvider({value,children}:{value:Record<string,string>,children:ReactNode}){return <Context.Provider value={value}>{children}</Context.Provider>}
export function SiteText({value}:{value:string}){const content=useContext(Context);return <>{content[value]??value}</>}
export function SiteImage(props:ImgHTMLAttributes<HTMLImageElement>){const content=useContext(Context);const key='image:'+props.src;return <img {...props} src={content[key]||props.src}/>}
