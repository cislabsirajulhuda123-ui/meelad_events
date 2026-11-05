import {z} from 'zod';
export const registrationSchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(200),className:z.string().trim().max(100).default(''),chest:z.string().trim().max(40).transform(s=>s.toUpperCase()).default(''),teamId:z.string().min(1).max(200),zone:z.string().min(1).max(100),eventIds:z.array(z.string().min(1).max(200)).min(1).max(100)}).strict();
export type Registration=z.infer<typeof registrationSchema> & {revision:number};
