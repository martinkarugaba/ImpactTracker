CREATE TABLE "activity_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"session_date" date NOT NULL,
	"session_number" integer NOT NULL,
	"start_time" time,
	"end_time" time,
	"venue" text,
	"notes" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_activity_session_date" UNIQUE("activity_id","session_date"),
	CONSTRAINT "unique_activity_session_number" UNIQUE("activity_id","session_number")
);
--> statement-breakpoint
CREATE TABLE "daily_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"attendance_status" text DEFAULT 'invited' NOT NULL,
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"notes" text,
	"recorded_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_session_participant" UNIQUE("session_id","participant_id")
);
--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "country_id" uuid;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "district_id" uuid;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "subcounty_id" uuid;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "parish_id" uuid;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "village_id" uuid;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "disability_type" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "wage_employment_status" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "wage_employment_sector" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "wage_employment_scale" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "self_employment_status" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "self_employment_sector" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "business_scale" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "secondary_employment_status" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "secondary_employment_sector" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "secondary_business_scale" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "accessed_loans" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "individual_saving" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "group_saving" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "location_setting" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "marital_status" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "education_level" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "source_of_income" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "nationality" text DEFAULT 'Ugandan' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "population_segment" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "refugee_location" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "is_active_student" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "is_subscribed_to_vsla" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "vsla_name" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "is_teen_mother" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "owns_enterprise" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "enterprise_name" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "enterprise_sector" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "enterprise_size" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "enterprise_youth_male" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "enterprise_youth_female" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "enterprise_adults" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "has_vocational_skills" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "vocational_skills_participations" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "vocational_skills_completions" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "vocational_skills_certifications" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "has_soft_skills" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "soft_skills_participations" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "soft_skills_completions" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "soft_skills_certifications" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "has_business_skills" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "employment_type" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "employment_sector" text;--> statement-breakpoint
ALTER TABLE "activity_sessions" ADD CONSTRAINT "activity_sessions_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_session_id_activity_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."activity_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_subcounty_id_subcounties_id_fk" FOREIGN KEY ("subcounty_id") REFERENCES "public"."subcounties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_parish_id_parishes_id_fk" FOREIGN KEY ("parish_id") REFERENCES "public"."parishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE no action ON UPDATE no action;