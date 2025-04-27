
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()


const adminAuth = async (req, res, next) => {
    const password = process.env.JWT_PASSWORD;
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }
  
    const token = authHeader.split(" ")[1];
    
  
    jwt.verify(token, password, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: "Invalid or expired token",
          err,
        });
      }
  
      if (decoded.email) {
        req.email = decoded.email;
        next();
      } else {
        return res.status(401).json({ error: "Invalid token payload" });
      }
    });
  };
  

export default adminAuth