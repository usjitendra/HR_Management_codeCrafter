import{Router} from 'express';
const adminroutes=Router();
import multer from 'multer';


import {registration,login,isLogin,logout,otp_send,otp_verify} from "../controllers/registrationController.js";
import { registrationMiddleware } from "../middlewares/registrationMiddleware.js";
// import admin from '../firebase.js';
const storage = multer.memoryStorage();
const upload = multer();
console.log("update");


adminroutes.post("/registration",upload.single("image"),registration);
adminroutes.post("/login",login);
adminroutes.get("/isLogin", isLogin);
adminroutes.post("/logout", logout);

adminroutes.post("/send/otp",otp_send);
adminroutes.post("/verify-otp",otp_verify)



export default adminroutes