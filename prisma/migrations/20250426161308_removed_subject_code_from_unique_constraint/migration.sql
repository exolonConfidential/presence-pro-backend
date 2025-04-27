/*
  Warnings:

  - A unique constraint covering the columns `[day,startTime,endTime,year]` on the table `Timetable` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Timetable_day_startTime_endTime_subjectCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_day_startTime_endTime_year_key" ON "Timetable"("day", "startTime", "endTime", "year");
