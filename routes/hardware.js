import { Router } from "express"
import { PrismaClient } from "@prisma/client";
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js';
import timezone from "dayjs/plugin/timezone.js"

dayjs.extend(utc);
dayjs.extend(timezone);
const prisma = new PrismaClient();
const router = Router();


router.get('/pendingEnrollment', async (req, res) => {
  try {
    const pendingStudent = await prisma.students.findFirst({
      where: {
        isEnrolling: true,
        enrolled: false
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        rollNo: true,
        fingerprintId: true,
      },
    });

    if (!pendingStudent) {
      return res.status(200).json({ pending: false });
    }

    return res.status(200).json({
      pending: true,
      rollNo: pendingStudent.rollNo,
      fingerprintId: pendingStudent.fingerprintId
    });
  } catch (err) {

    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/enrollmentResult', async (req, res) => {
  try {
    const { rollNo, success } = req.body;

    if (success) {
      await prisma.students.update({
        where: { rollNo },
        data: {
          enrolled: true,
          isEnrolling: false,
        },
      });
    } else {
      await prisma.students.update({
        where: { id },
        data: {
          isEnrolling: false,
        },
      });
    }

    return res.status(200).json({ msg: 'Updated successfully' });
  } catch (err) {

    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post("/markAttendance", async (req, res) => {
  try {
    const { fingerprintId } = req.body;


    if (!fingerprintId) {
      return res.status(400).json({ error: "Fingerprint ID is required" });
    }

    // 1. Find the student
    const student = await prisma.students.findUnique({
      where: { fingerprintId },
    });

    if (!student || !student.enrolled) {
      return res.status(404).json({ error: "Student not found or not enrolled" });
    }

    // 2. Get current time and day
    const now = dayjs().tz("Asia/Kolkata");
    const currentDay = now.format("dddd");     
    const currentTime = now.format("HH:mm"); // 24hr format string

    // 3. Find matching timetable entry
    console.log(currentDay)
    console.log(currentTime)
    const timetable = await prisma.timetable.findFirst({
      where: {
        year: student.year,
        day: currentDay,
        startTime: { lte: currentTime },
        endTime: { gt: currentTime },
      },
    });

    if (!timetable) {
      return res.status(401).json({ error: "No class scheduled at this time" });
    }

    // 4. Prevent duplicate attendance for same subject on same class
    const startTime = timetable.startTime
    const endTime = timetable.endTime
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startDateTime = dayjs()
      .hour(startHour)
      .minute(startMinute)
      .second(0)
      .millisecond(0)
      .utc();

    const endDateTime = dayjs()
      .hour(endHour)
      .minute(endMinute)
      .second(59)
      .millisecond(999)
      .utc();
    console.log(startDateTime.toDate());
    console.log(endDateTime.toDate());
    const existing = await prisma.attendances.findFirst({
      where: {
        studentRoll: student.rollNo,
        subjectCode: timetable.subjectCode,
        timestamp: { // attendance only once per subject per class
          gte: startDateTime.toDate(),
          lte: endDateTime.toDate(),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: "Attendance already marked for this subject today" });
    }

    // 5. Save attendance
    const attendance = await prisma.attendances.create({
      data: {
        studentRoll: student.rollNo,
        subjectCode: timetable.subjectCode,

      },
    });

    return res.status(200).json({
      msg: "Attendance marked successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router