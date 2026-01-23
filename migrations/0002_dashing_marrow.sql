ALTER TABLE "guest_passes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "guest_passes" CASCADE;--> statement-breakpoint
ALTER TABLE "visitors" DROP CONSTRAINT "visitors_guest_pass_id_guest_passes_id_fk";
--> statement-breakpoint
ALTER TABLE "visitors" DROP COLUMN "guest_pass_id";--> statement-breakpoint
ALTER TABLE "visitors" DROP COLUMN "pass_number";