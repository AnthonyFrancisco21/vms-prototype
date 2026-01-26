CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"id_scan_image" text,
	"photo_image" text,
	"rfid" text,
	"entry_time" timestamp,
	"exit_time" timestamp,
	"status" text DEFAULT 'registered' NOT NULL
);
