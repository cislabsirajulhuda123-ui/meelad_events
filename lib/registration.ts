import {z} from 'zod';
export const registrationSchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(200),chest:z.string().trim().min(1).max(40).transform(s=>s.toUpperCase()),teamId:z.string().min(1).max(200),zone:z.string().min(1).max(100),eventIds:z.array(z.string().min(1).max(200)).min(1).max(100)}).strict();
export type Registration=z.infer<typeof registrationSchema> & {revision:number};
