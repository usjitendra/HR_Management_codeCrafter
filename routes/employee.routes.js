import {Router} from "express";
import { add_employee,employee_update,all_employee,employee_Delete,
    registration_employee,employee_login}from "../controllers/employeeController.js";
import multer from "multer";
import express from "express";
const app=express()
const employee =Router();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { registrationMiddleware } from "../middlewares/registrationMiddleware.js";
import { token_validate } from "../middlewares/auth.js";
const storage = multer.memoryStorage();
const upload = multer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

// *****************_____Employee start____*********//
// employee.post("/registration",upload.none(),registrationMiddleware,registration_employee)
employee.post("/login",employee_login)
employee.post("/add",upload.single("files"),add_employee);
employee.get("/all", all_employee);
employee.put("/update/:id",employee_update,);
employee.delete("/delete/:id", employee_Delete);

// ***************_____End_______****************//



export default employee;


