CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`chest` text NOT NULL,
	`payload` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_chest_unique` ON `registrations` (`chest`);