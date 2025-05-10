import { PrismaClient } from '@prisma/client'
import axios from "axios"
import { Router } from "express";
import jwt from "jsonwebtoken";
import dontenv from "dotenv";
import adminAuth from '../middleware/admin-auth.js';
dontenv.config()
const router = Router();
const prisma = new PrismaClient()





// Admin
router.post("/addAdmin", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newAdmin = await prisma.admins.create({
      data: { name, email, password },
    });

    res.status(200).json({
      msg: "Admin added successfully",
      email: newAdmin.email,
    });
  } catch (err) {

    res.status(500).json({ error: "Database error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const jwtPassword = process.env.JWT_PASSWORD;
    const { email, password } = req.body;

    const admin = await prisma.admins.findUnique({
      where: { email, password },
    });

    if (!admin) {
      return res.status(401).json({ error: "Wrong credentials" });
    }
    const token = jwt.sign({ email, role: "admin" }, jwtPassword)

    res.status(200).json({
      email: admin.email,
      token: token,
      msg: "Admin found",
    });
  } catch (err) {

    res.status(500).json({ error: "Internal server error", err });
  }
});


// Subjects
router.post("/addSub", adminAuth, async (req, res) => {
  try {
    const { name, code, teacher, year } = req.body;
    const isSub = await prisma.subjects.findFirst({
      where: { code }
    })
    if (isSub) return res.status(501).json({ error: "Subject already exists" })
    else {
      const newSub = await prisma.subjects.create({
        data: { name, code, teacher, year },

      });
      res.status(200).json({
        msg: "Subject created successfully",
        code: newSub.code,
      });
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/removeSubByCode", adminAuth, async (req, res) => {
  try {
    const { code } = req.query;
    const removedSub = await prisma.subjects.delete({
      where: { code },
    });

    res.status(200).json({ msg: "Deleted successfully" });
  } catch (err) {

    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/allSub", adminAuth, async (req, res) => {
  try {
    const allSubs = await prisma.subjects.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
    res.status(200).json({
      msg: "Found Successfully",
      allSubs,
    });
  } catch (err) {

    res.status(500).json({ error: "Internal server error" });
  }
});

// Timetable
router.post("/addTimetable", adminAuth, async (req, res) => {
  try {
    const { year, day, startTime, endTime, subjectCode } = req.body;
    const existingSubject = await prisma.subjects.findUnique({
      where: { code: subjectCode },
    });

    if (!existingSubject) {
      return res.status(400).json({ error: "Subject code does not exist." });
    }
    const timeTable = await prisma.timetable.create({
      data: {
        year,
        day,
        startTime,
        endTime,
        subjectCode,
      },
    });

    res.status(200).json({
      msg: "Timetable added successfully",
      timeTable,
    });
  } catch (err) {
    if (err.code === "P2002") {
      // P2002 = Prisma unique constraint violation
      res.status(400).json({ error: "A class already exists for this day and time slot." });
    } else {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});


router.delete("/TtRemoveById", adminAuth, async (req, res) => {
  const { id } = req.query
  try {
    const deletedTT = await prisma.timetable.delete({
      where: {
        id
      }
    })
    res.status(200).json({
      msg: "Deleted successfully"
    })

  } catch (err) {
    res.status(500).json({
      error: "Internal server error"
    })
  }
});



router.get("/timetable", adminAuth, async (req, res) => {
  try {
    const { year } = req.query
    const filter = {}
    if (year) filter.year = year
    const timetable = await prisma.timetable.findMany({
      where: filter
    }
    )
    if (!timetable) {
      return res.status(401).json({ error: "Not found" })
    }
    res.status(200).json({ msg: "Found Successfully", timetable })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: "Internal server error"
    })
  }
})

// Attendance
router.get("/attenSub", adminAuth, async (req, res) => {
  try {
    const { subjectCode } = req.query;
    const attendance = await prisma.attendances.findMany({
      where: { subjectCode: subjectCode },
    });
    if (!attendance) {
      return res.status(401).json({
        error: "Not found"
      })
    }

    res.status(200).json({
      msg: "Found Successfully",
      attendance,
    });
  } catch (err) {

    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/attenStudent", adminAuth, async (req, res) => {
  try {
    const { studentId } = req.query;
    const attendance = await prisma.attendances.findMany({
      where: { studentId: studentId },
      orderBy: {
        timestamp: 'desc'
      }
    });
    if (!attendance) {
      return res.status(401).json({
        error: "Not found"
      })
    }

    res.status(200).json({
      msg: "Found successfully",
      attendance,
    });
  } catch (err) {

    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/studentHome", adminAuth, async (req, res) => {
  try {
    const { rollNo } = req.query;
    const student = await prisma.students.findUnique({
      where: {
        rollNo
      },
      select: {
        name: true,
        rollNo: true,
        branch: true,
        year: true
      }
    })
    if (!student) return res.status(401).json({ error: "Student not found" });
    const subjects = await prisma.subjects.findMany({
      where: {
        year: student.year
      },
      select: {
        name: true,
        code: true,
        year: true,
        teacher: true
      }
    })
    res.status(200).json({ subjects, student })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


export default router

