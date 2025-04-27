/*
  Warnings:

  - A unique constraint covering the columns `[day,startTime,endTime,subjectCode]` on the table `Timetable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Timetable_day_startTime_endTime_subjectCode_key" ON "Timetable"("day", "startTime", "endTime", "subjectCode");
