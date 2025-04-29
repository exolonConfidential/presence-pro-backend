import { Router } from "express"
import { PrismaClient } from "@prisma/client";
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
  

export default router