-- CreateTable
CREATE TABLE "ZipCache" (
    "zipCode" TEXT NOT NULL,
    "locationJson" TEXT NOT NULL,
    "soilJson" TEXT NOT NULL,
    "climateJson" TEXT NOT NULL,
    "hardinessJson" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZipCache_pkey" PRIMARY KEY ("zipCode")
);

-- CreateTable
CREATE TABLE "PlantProfileCache" (
    "plantId" TEXT NOT NULL,
    "profileJson" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantProfileCache_pkey" PRIMARY KEY ("plantId")
);

-- CreateTable
CREATE TABLE "GardenPlan" (
    "id" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "planJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "GardenPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedOrder" (
    "id" TEXT NOT NULL,
    "gardenPlanId" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "orderJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ZipCache_expiresAt_idx" ON "ZipCache"("expiresAt");

-- CreateIndex
CREATE INDEX "PlantProfileCache_expiresAt_idx" ON "PlantProfileCache"("expiresAt");

-- CreateIndex
CREATE INDEX "GardenPlan_zipCode_idx" ON "GardenPlan"("zipCode");

-- CreateIndex
CREATE INDEX "SeedOrder_gardenPlanId_idx" ON "SeedOrder"("gardenPlanId");

-- AddForeignKey
ALTER TABLE "SeedOrder" ADD CONSTRAINT "SeedOrder_gardenPlanId_fkey" FOREIGN KEY ("gardenPlanId") REFERENCES "GardenPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
