ALTER TABLE "visitors" ALTER COLUMN "entry_time" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "visitors" ALTER COLUMN "entry_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "visitors" ALTER COLUMN "status" SET DEFAULT 'registered';