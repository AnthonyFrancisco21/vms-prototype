CREATE TABLE "destinations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"floor" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_passes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pass_number" text NOT NULL,
	"qr_code" text NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "guest_passes_pass_number_unique" UNIQUE("pass_number")
);
--> statement-breakpoint
CREATE TABLE "scheduled_visits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_name" text NOT NULL,
	"visitor_email" text,
	"visitor_phone" text,
	"destination_id" varchar,
	"destination_name" text,
	"host_name" text NOT NULL,
	"purpose" text NOT NULL,
	"expected_date" timestamp NOT NULL,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "staff_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"department" text,
	"mobile_number" text NOT NULL,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'staff' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_type" text DEFAULT 'visitor' NOT NULL,
	"name" text NOT NULL,
	"destination_id" varchar,
	"destinations" text,
	"destination_name" text,
	"person_to_visit" text,
	"purpose" text NOT NULL,
	"id_scan_image" text,
	"id_ocr_text" text,
	"photo_image" text,
	"rfid" text,
	"guest_pass_id" varchar,
	"pass_number" text,
	"entry_time" timestamp DEFAULT now() NOT NULL,
	"exit_time" timestamp,
	"status" text DEFAULT 'checked_in' NOT NULL,
	"approval_status" text DEFAULT 'pending',
	"approval_token" text
);
--> statement-breakpoint
ALTER TABLE "scheduled_visits" ADD CONSTRAINT "scheduled_visits_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_guest_pass_id_guest_passes_id_fk" FOREIGN KEY ("guest_pass_id") REFERENCES "public"."guest_passes"("id") ON DELETE no action ON UPDATE no action;