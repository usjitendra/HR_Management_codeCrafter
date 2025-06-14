import{Router} from 'express';
const adminroutes=Router();
import multer from 'multer';


import {registration,login,isLogin,logout,} from "../controllers/registrationController.js";
import { registrationMiddleware } from "../middlewares/registrationMiddleware.js";
const storage = multer.memoryStorage();
const upload = multer();
console.log("update");


adminroutes.post("/registration",upload.single("image"),registration);
adminroutes.post("/login",login);
adminroutes.get("/isLogin", isLogin);
adminroutes.post("/logout", logout);



export default adminroutes