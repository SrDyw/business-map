-- Split the single schedule column into separate days and hours columns.

ALTER TABLE "Business" ADD COLUMN "scheduleDays" TEXT;
ALTER TABLE "Business" ADD COLUMN "scheduleHours" TEXT;

-- Best-effort backfill: the days part is everything before the first "HH:MM" token.
UPDATE "Business"
SET
  "scheduleDays" = CASE
    WHEN "schedule" IS NULL OR instr("schedule", ':') = 0 THEN NULL
    ELSE trim(substr("schedule", 1, instr("schedule", ':') - 3))
  END,
  "scheduleHours" = CASE
    WHEN "schedule" IS NULL OR instr("schedule", ':') = 0 THEN "schedule"
    ELSE trim(substr("schedule", instr("schedule", ':') - 2))
  END;

ALTER TABLE "Business" DROP COLUMN "schedule";
