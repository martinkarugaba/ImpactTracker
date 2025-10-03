CREATE TABLE "vsla_monthly_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vsla_id" uuid NOT NULL,
	"month" varchar(20) NOT NULL,
	"year" varchar(4) NOT NULL,
	"total_loans" integer DEFAULT 0 NOT NULL,
	"total_savings" integer DEFAULT 0 NOT NULL,
	"total_meetings" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_vsla_month_year" UNIQUE("vsla_id","month","year")
);
--> statement-breakpoint
ALTER TABLE "activity_sessions" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "vsla_monthly_data" ADD CONSTRAINT "vsla_monthly_data_vsla_id_vslas_id_fk" FOREIGN KEY ("vsla_id") REFERENCES "public"."vslas"("id") ON DELETE cascade ON UPDATE no action;