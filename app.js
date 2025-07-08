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
import cloudinary from 'cloudinary'
import bank from "./routes/bank.routes.js";
import work from "./routes/employee.work.routes.js"
import policy from "./routes/policy.js"
import leave from "./routes/leave.routes.js";
import drappointment from "./routes/dr.appointment.routes.js";
import notification from "./routes/notification.routes.js"
import Terms from "./routes/term&condition.routes.js";
import http from 'http';
import { Server } from 'socket.io';
import performance from './routes/performance.routes.js'
import employee_document_route from "./routes/employee.document.routes.js";
// import fcmNotification from './routes/firbase.routes.js'
import fcmNotification from './controllers/fcm.notification.js'
import payroll from './routes/payroll.routes.js'

import './middlewares/employee.attendance.cron.job.js'
import "./middlewares/notification.cron.js"
import compamyProfile from "./routes/company.profile.routes.js";
import morgan from "morgan";
import rateLimit from "express-rate-limit"
import compression from "compression";
import { apiKeyAuth } from "./middlewares/auth.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app=express();
dotenv.config();

app.use(cors({
  origin: ["http://localhost:5173","http://localhost:3000","https://hrms112.netlify.app","https://updatehrmsa.netlify.app","https://dr-monika.netlify.app"], 
  origin: ["http://localhost:5173","http://localhost:3000","https://hrms112.netlify.app","https://updatehrmsa.netlify.app","http://localhost:5174","sadbhawanaclinic.com","https://www.sadbhawanaclinic.com/", "https://sadbhawanaclinic.com/"], 
  credentials: true,
}));

const server=http.createServer(app);
const io=new Server(server,{
       cors:{
        origin:["http://localhost:5173","http://localhost:3000","https://hrms112.netlify.app","https://updatehrmsa.netlify.app"],
        credentials: true,
       }
})


io.on('connection', (socket) => {
console.log('User connected:12345', socket.id);  
  socket.on('join', (data) => {
      // console.log("ayush duplicte don",data);
    // socket.join(userId); // Join room with userId
    // console.log(`User ${userId} joined their room`);
  });

  socket.emit("welcome","welcome to user")

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get("/", (req, res) => {
  res.send("API working");
});

//  const limiter=rateLimit({
//   windowMs:15*60*1000,
//   max:100,
//   message:"Too many requests,please try again after 15 minutes"
//  })

const upload=multer({dist:"uploads/"})
app.use(morgan("dev")); 15
app.use(compression());


// app.use(limiter)

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(apiKeyAuth);

app.use('/api/v1/admin',admin)
app.use('/api/v1/compay/profile',compamyProfile)
app.use('/api/v1/employee',employee)
app.use("/api/v1/employee/attendance",attandance)
app.use('/api/v1/employee/bank',bank)
app.use('/api/v1/employee/work',work)
app.use('/api/v1/policy',policy)
app.use('/api/v1/term-conditions',Terms)
app.use('/api/v1/leave',leave)
app.use('/api/v1/notification',notification)
app.use('/api/v1/appointment',drappointment)
app.use('/api/v1/performance',performance)
app.use('/api/v1/fcmNotification',fcmNotification)
app.use('/api/v1/payroll',payroll)
app.use('/api/v1/employee/document',employee_document_route)

console.log("rateLimit");


app.set('io', io); 

app.use("*", (req, res) => {
    return res.status(404).json({ Message: "Route not found", path: req.originalUrl, method: req.method });
});

app.use(errorMiddleware)


const PORT=process.env.PORT||6000;


server.listen(PORT,async()=>{
    await dbConnection()
    console.log(`server start on port ${PORT}`);
})




