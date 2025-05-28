import { Router } from "express"
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dontenv from "dotenv";
import adminAuth from "../middleware/admin-auth.js";
import studentAuth from "../middleware/student-auth.js";
dontenv.config()
const prisma = new PrismaClient();
const router = Router();

router.post("/addStudents", adminAuth, async (req, res) => {
    const { name, year, branch, rollNo, password, fingerprintId } = req.body
    try {
        const isStudent = await prisma.students.findFirst({
            where: { rollNo}
        }) 
        if(isStudent) res.status(501).json({error: "Student already exists"})
        else{
            const student = await prisma.students.create({
                data: { name, year, branch, rollNo, password, fingerprintId }
            })
            res.status(200).json({ msg: "Created Successfully",student })
        }
        
        

    } catch (error) {
        
        res.status(500).json({ error: "Internal server error" })

    }
});

router.delete("/remove", adminAuth, async(req,res)=>{
    const {rollNo} = req.query
    try {
        const student = await prisma.students.delete({
            where: {rollNo}
        })
        res.status(200).json({msg:"Deleted successfully"})
        
    } catch (error) {
        
        res.status(500).json({ error: "Internal server error" })
    }
})
// nerver use uppercase while destructuring the headers it is always in lowecase
router.post("/signin", async (req, res) => {

    try {
        const { rollNo, password } = req.body; 
        const jwtPassword = process.env.JWT_PASSWORD

        const student = await prisma.students.findUnique({
            where: {
                rollNo: rollNo
            }
        })
        if (!(student && student.password == password))  return res.status(401).json({ error: "Wrong Credentials" })
      
        const token = jwt.sign({ rollNo, role: "student" }, jwtPassword)
        res.status(200).json({ msg: "Found successfully", rollNo: student.rollNo , token })
    } catch (error) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.get('/attendance', studentAuth, async (req,res)=>{
    try {
        const { rollNo, subjectCode } = req.query
        const attendance = await prisma.attendances.findMany({
            where: {
                studentRoll: rollNo,
                subjectCode
            },
            select:{
                subjectCode: true,
                timestamp: true
            }
        })
        if(!attendance) return res.status(401).json({error: "Not found"})
        res.status(200).json({attendance})
    } catch (error) {
        
        res.status(500).json({ error: "Internal server error" })
    }
})



router.get('/students', adminAuth, async (req, res) => {
    try {
        const { year, branch, page = '1', pageSize = '10' } = req.query;

        const pageNumber = parseInt(page, 10);
        const size = parseInt(pageSize, 10);

        const filters = {};
        if (year) filters.year = year;
        if (branch) filters.branch = branch;

        const total = await prisma.students.count({
            where: filters,
        });

        const students = await prisma.students.findMany({
            where: filters,
            orderBy: {
                rollNo: 'asc',
            },
            skip: (pageNumber - 1) * size,
            take: size,
        });

        res.status(200).json({
            students,
            total,
            page: pageNumber,
            pageSize: size,
        });
    } catch (error) {
       
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/enroll',adminAuth, async (req, res) => {
    try {

     const rollNo = req.query.rollNo
    
      const student = await prisma.students.update({
        where: { rollNo},
        data: { isEnrolling: true , enrolled: false },
      });
      res.status(200).json(student);
    } catch (err) {
     
      res.status(500).json({ error: 'Enrollment failed' });
    }
  });
  
router.get("/studentHome",studentAuth,async (req,res)=>{
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
        if(!student) return res.status(401).json({error: "Student not found"});
        const subjects = await prisma.subjects.findMany({
            where: {
                year: student.year
            },
            select:{
                name: true,
                code: true,
                year: true,
                teacher: true
            }
        })
        res.status(200).json({subjects, student})
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


export default router