-- Add user ownership fields to all domain tables.
ALTER TABLE "Book" ADD COLUMN "userId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Topic" ADD COLUMN "userId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Problem" ADD COLUMN "userId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "JournalEntry" ADD COLUMN "userId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "Question" ADD COLUMN "userId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Add indexes for user-scoped query patterns.
CREATE INDEX "Book_userId_idx" ON "Book"("userId");
CREATE INDEX "Topic_userId_idx" ON "Topic"("userId");
CREATE INDEX "Problem_userId_idx" ON "Problem"("userId");
CREATE INDEX "JournalEntry_userId_idx" ON "JournalEntry"("userId");
CREATE INDEX "Question_userId_idx" ON "Question"("userId");

-- Remove defaults after backfill; all new writes must provide a userId.
ALTER TABLE "Book" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Topic" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Problem" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "JournalEntry" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "userId" DROP DEFAULT;
