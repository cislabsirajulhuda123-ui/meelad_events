import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const festival = sqliteTable('festival', {id:text('id').primaryKey(),payload:text('payload').notNull(),revision:integer('revision').notNull().default(1),updatedAt:text('updated_at').notNull()});
export const adminAccounts=sqliteTable('admin_accounts',{email:text('email').primaryKey(),salt:text('salt').notNull(),hash:text('hash').notNull(),updatedAt:text('updated_at').notNull()});
export const adminSessions=sqliteTable('admin_sessions',{tokenHash:text('token_hash').primaryKey(),email:text('email').notNull(),expiresAt:integer('expires_at').notNull()});
export const loginAttempts=sqliteTable('login_attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),resetAt:integer('reset_at').notNull()});
export const registrations=sqliteTable('registrations',{id:text('id').primaryKey(),chest:text('chest').notNull().unique(),payload:text('payload').notNull(),revision:integer('revision').notNull().default(1),updatedAt:text('updated_at').notNull()});
