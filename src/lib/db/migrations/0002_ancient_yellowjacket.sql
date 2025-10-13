ALTER TABLE "participants" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "district" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "sub_county" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "parish" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "village" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "designation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "enterprise" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "contact" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "skill_category" text;