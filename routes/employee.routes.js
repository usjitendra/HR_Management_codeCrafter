import {Router} from "express";
import { add_employee,employee_update,all_employee,employee_Delete,
    registration_employee,employee_login,oneEmployee,employeeAlldetail,employee_profile,
    single_employee_allDetail,saveFcmToken,
    getTodayBirthdayEmployees}from "../controllers/employeeController.js";
import express from "express";
const app=express()
const employee =Router();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { registrationMiddleware } from "../middlewares/registrationMiddleware.js";
import { token_validate } from "../middlewares/auth.js";
import upload from '../middlewares/multer.middleware.js'
import employeMiddleware from "../middlewares/employeeMiddleware.js";

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

 const multiUploda= upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "idCard", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

// *****************_____Employee start____*********//
// employee.post("/registration",upload.none(),registrationMiddleware,registration_employee)

employee.post("/add",multiUploda,employeMiddleware,add_employee);
employee.post("/login",employee_login)
employee.put("/update/:id",multiUploda,employee_update,);
employee.get("/all", all_employee);
employee.delete("/delete/:id", employee_Delete);
employee.get("/get/:id",oneEmployee)
employee.get("/all/detail/:id",employeeAlldetail)
employee.get("/profile",employee_profile)
employee.get("/birthday",getTodayBirthdayEmployees)
employee.get("/single/all/detail/:id",single_employee_allDetail)
employee.post("/save/fcmtoken",saveFcmToken)

// ***************_____End_______****************//



export default employee;


