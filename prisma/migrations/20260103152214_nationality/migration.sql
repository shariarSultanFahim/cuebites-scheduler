-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "avatar" TEXT,
    "full_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'AU',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "gender" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERMANENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Staff" ("address", "avatar", "createdAt", "email", "full_name", "gender", "id", "phone", "status", "type", "updatedAt") SELECT "address", "avatar", "createdAt", "email", "full_name", "gender", "id", "phone", "status", "type", "updatedAt" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");
CREATE UNIQUE INDEX "Staff_phone_key" ON "Staff"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
