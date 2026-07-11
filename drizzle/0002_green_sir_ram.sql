ALTER TABLE "posts" ADD COLUMN "content_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "likes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "url";