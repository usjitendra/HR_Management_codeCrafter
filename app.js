import dotenv from "dotenv";
import express from'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import multer from 'multer';
import dbConnection from "./config/dbConnection.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import cookieParser from 'cookie-parser'
import employee from "./routes/employee.routes.js";
import attandance from "./routes/attandance.routes.js";
import admin from "./routes/admin.routes.js";

const app=express();
dotenv.config();

app.use(cors({
  origin: ["http://localhost:5173","https://hrmsdashboard4.netlify.app"], 
  credentials: true,
}));

app.get('/',()=>{
  res.send({satatu:200,message:"server start"})
})

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());


app.use('/api/v1/admin',admin)
app.use('/api/v1/employee',employee)
app.use("/api/v1/employee/attendance",attandance)





app.use("*", (req, res) => {
    return res.status(404).json({ Message: "Route not found", path: req.originalUrl, method: req.method });
});

app.use(errorMiddleware)


const PORT=process.env.PORT||6000;
console.log(PORT);

app.listen(PORT,async()=>{
    await dbConnection()
    console.log(`server start on port ${PORT}`);
})




