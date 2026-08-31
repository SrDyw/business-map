/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Business` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "scheduleDays" TEXT,
    "scheduleHours" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "isDelivery" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "paymentMethods" TEXT NOT NULL DEFAULT 'cash',
    "paymentPlatform" TEXT,
    "paymentNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Business" ("address", "createdAt", "id", "isActive", "isDelivery", "latitude", "longitude", "name", "paymentNote", "paymentPlatform", "phone", "photoUrl", "scheduleDays", "scheduleHours", "type", "updatedAt") SELECT "address", "createdAt", "id", "isActive", "isDelivery", "latitude", "longitude", "name", "paymentNote", "paymentPlatform", "phone", "photoUrl", "scheduleDays", "scheduleHours", "type", "updatedAt" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_phone_key" ON "Business"("phone");
CREATE INDEX "Business_name_idx" ON "Business"("name");
CREATE INDEX "Business_type_idx" ON "Business"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
