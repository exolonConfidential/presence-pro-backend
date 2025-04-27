
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()


const studentAuth = async(req,res,next)=>{
    const password = process.env.JWT_PASSWORD
    const token1 = req.headers.authorization;
    if(!token1 || !token1.startsWith("Bearer")){
        res.status(401).json({error: "Missing or Wrong authorization header"})
    }
    const token = token1.split(" ")[1];
    const payload = jwt.verify(token,password,function(err,decode){
        if(err){
            res.status(401).json({
               error : "wrong admin"
            })
        }
        return decode;
    });
    if(payload.rollNo){
        req.rollNo = payload.rollNo;
        next()
    } else{
        res.status(401).json({error:"wrond admin"})
    }
    
}

export default studentAuth