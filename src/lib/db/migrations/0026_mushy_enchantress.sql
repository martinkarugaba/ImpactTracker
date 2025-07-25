CREATE TABLE "concept_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"content" text NOT NULL,
	"title" text NOT NULL,
	"charge_code" text,
	"activity_lead" text,
	"submission_date" timestamp,
	"project_summary" text,
	"methodology" text,
	"requirements" text,
	"participant_details" text,
	"budget_items" text[] DEFAULT '{}',
	"budget_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "concept_notes" ADD CONSTRAINT "concept_notes_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;