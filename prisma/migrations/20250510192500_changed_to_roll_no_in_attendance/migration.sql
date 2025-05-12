/*
  Warnings:

  - You are about to drop the column `studentId` on the `Attendances` table. All the data in the column will be lost.
  - Added the required column `studentRoll` to the `Attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendances" DROP CONSTRAINT "Attendances_studentId_fkey";

-- AlterTable
ALTER TABLE "Attendances" DROP COLUMN "studentId",
ADD COLUMN     "studentRoll" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_studentRoll_fkey" FOREIGN KEY ("studentRoll") REFERENCES "Students"("rollNo") ON DELETE RESTRICT ON UPDATE CASCADE;
