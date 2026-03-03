CREATE TABLE "clinicians" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "patients" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "dateOfBirth" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "visits" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "clinicianId" INTEGER NOT NULL,
  "patientId" INTEGER NOT NULL,
  "visitedAt" DATETIME NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "visits_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "clinicians" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "visits_visitedAt_idx" ON "visits"("visitedAt");
CREATE INDEX "visits_clinicianId_idx" ON "visits"("clinicianId");
CREATE INDEX "visits_patientId_idx" ON "visits"("patientId");
CREATE UNIQUE INDEX "visits_clinicianId_visitedAt_key" ON "visits"("clinicianId", "visitedAt");
