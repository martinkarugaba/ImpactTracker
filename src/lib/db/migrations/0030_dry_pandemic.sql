ALTER TABLE "vslas" ADD COLUMN "primary_business" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "primary_business_other" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "county" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "meeting_location" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "formation_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "closing_date" timestamp;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "lc1_chairperson_name" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "lc1_chairperson_contact" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "has_constitution" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "has_signed_constitution" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "bank_branch" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "bank_account_number" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "registration_certificate_number" text;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "sacco_member" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "vslas" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "vslas" DROP COLUMN "formed_date";