CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` text,
	`market` varchar(50),
	`industry` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`sma1` int DEFAULT 5,
	`sma2` int DEFAULT 25,
	`sma3` int DEFAULT 75,
	`playbackSpeed` int DEFAULT 1000,
	`showVolume` boolean DEFAULT true,
	`logScale` boolean DEFAULT false,
	`theme` varchar(20) DEFAULT 'dark',
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `userSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `code_idx` ON `favorites` (`code`);