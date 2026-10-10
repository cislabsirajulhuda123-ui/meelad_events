import seed from '@/data/seed.json';
import {database} from './database';
import {stateSchema,type Festival} from './model';
export function db(){return database;}
export async function loadFestival(){const r=await db().prepare('SELECT payload,revision,updated_at FROM festival WHERE id = ?').bind('main').first<{payload:string,revision:number,updated_at:string}>();return r?{data:stateSchema.parse(JSON.parse(r.payload)),revision:r.revision,updatedAt:r.updated_at}:{data:stateSchema.parse(seed),revision:0,updatedAt:'2026-09-27T09:40:00Z'};}
export function publicData(d:Festival):Festival{return {...d,events:d.events.map(e=>({...e,results:e.published?e.publishedResults:[],publishedResults:e.published?e.publishedResults:[]}))};}
export async function storeFestival(data:Festival,revision:number){const r=await db().prepare('INSERT INTO festival (id,payload,revision,updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, revision=festival.revision+1, updated_at=excluded.updated_at WHERE festival.revision = ? RETURNING revision').bind('main',JSON.stringify(data),new Date().toISOString(),revision).first<{revision:number}>();if(!r)throw Error('CONFLICT');return r.revision;}
