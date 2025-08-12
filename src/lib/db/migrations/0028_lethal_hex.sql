CREATE TABLE "vsla_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vsla_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_date" timestamp NOT NULL,
	"total_savings" integer DEFAULT 0 NOT NULL,
	"total_loans" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vslas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"organization_id" uuid NOT NULL,
	"cluster_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"country" text NOT NULL,
	"district" text NOT NULL,
	"sub_county" text NOT NULL,
	"parish" text NOT NULL,
	"village" text NOT NULL,
	"address" text,
	"total_members" integer DEFAULT 0 NOT NULL,
	"total_savings" integer DEFAULT 0 NOT NULL,
	"total_loans" integer DEFAULT 0 NOT NULL,
	"meeting_frequency" text NOT NULL,
	"meeting_day" text,
	"meeting_time" text,
	"status" text DEFAULT 'active' NOT NULL,
	"formed_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vslas_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "vsla_members" ADD CONSTRAINT "vsla_members_vsla_id_vslas_id_fk" FOREIGN KEY ("vsla_id") REFERENCES "public"."vslas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vslas" ADD CONSTRAINT "vslas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vslas" ADD CONSTRAINT "vslas_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vslas" ADD CONSTRAINT "vslas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;