-- CreateTable
CREATE TABLE "HeartRate" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMPTZ NOT NULL,
    "bpm" INTEGER NOT NULL,

    CONSTRAINT "HeartRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeartRate_time_idx" ON "HeartRate"("time");
