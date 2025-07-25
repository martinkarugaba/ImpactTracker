CREATE TABLE "activity_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"title" text NOT NULL,
	"execution_date" timestamp NOT NULL,
	"cluster_name" text NOT NULL,
	"venue" text NOT NULL,
	"team_leader" text NOT NULL,
	"background_purpose" text NOT NULL,
	"progress_achievements" text NOT NULL,
	"challenges_recommendations" text NOT NULL,
	"lessons_learned" text NOT NULL,
	"follow_up_actions" text[] DEFAULT '{}',
	"actual_cost" integer,
	"number_of_participants" integer,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activity_reports" ADD CONSTRAINT "activity_reports_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;