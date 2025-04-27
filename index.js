import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import studentRoute from "./routes/student.js";
import adminRoute from "./routes/admin.js";

const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use("/student",studentRoute);
app.use("/admin",adminRoute);

const PORT = 3000;

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})