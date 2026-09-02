CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`company` text NOT NULL,
	`rooms` integer NOT NULL,
	`decider` text NOT NULL,
	`submission_date` text NOT NULL,
	`submission_time` text NOT NULL,
	`submitted_at` text NOT NULL
);
