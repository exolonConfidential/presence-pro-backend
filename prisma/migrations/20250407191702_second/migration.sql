/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Attendances` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Timetable` table. All the data in the column will be lost.
  - Added the required column `subjectCode` to the `Attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCode` to the `Timetable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendances" DROP CONSTRAINT "Attendances_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_subjectId_fkey";

-- AlterTable
ALTER TABLE "Attendances" DROP COLUMN "subjectId",
ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Timetable" DROP COLUMN "subjectId",
ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_subjectCode_fkey" FOREIGN KEY ("subjectCode") REFERENCES "Subjects"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_subjectCode_fkey" FOREIGN KEY ("subjectCode") REFERENCES "Subjects"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
