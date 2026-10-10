'use client';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
export function Choice({label,value,onChange,items}:{label:string,value:string,onChange:(v:string)=>void,items:Record<string,string>}){return <Select value={value||'__empty'} onValueChange={v=>onChange(v==='__empty'?'':v)}><SelectTrigger aria-label={label} className="choice"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(items).map(([key,name])=><SelectItem key={key} value={key||'__empty'}>{name}</SelectItem>)}</SelectContent></Select>}
