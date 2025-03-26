import {Router} from "express";
import { employee_registration,employee_update,all_employee,employee_Delete,}from "../controllers/employeeController.js";
import multer from "multer";
const employee =Router();


import { registrationMiddleware } from "../middlewares/registrationMiddleware.js";
import { token_validate } from "../middlewares/auth.js";
const storage = multer.memoryStorage();
const upload = multer();


// *****************_____Employee start____*********//

employee.get("/all", all_employee);
employee.post("/registration",upload.single("files"),employee_registration);
employee.put("/update/:id",employee_update,);
employee.delete("/delete/:id", employee_Delete);

// ***************_____End_______****************//



export default employee;


