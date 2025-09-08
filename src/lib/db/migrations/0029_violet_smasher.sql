ALTER TABLE "participants" ALTER COLUMN "age" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "date_of_birth" timestamp;