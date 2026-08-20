CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`uuid` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`is_verified` boolean NOT NULL DEFAULT false,
	`roles` json NOT NULL DEFAULT ('["user"]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_uuid_unique` UNIQUE(`uuid`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
