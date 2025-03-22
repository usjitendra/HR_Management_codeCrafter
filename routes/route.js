import express from 'express';
import {employee_registration,employee_update,all_employee,employee_Delete} from '../controllers/employeeController.js'
import multer from 'multer';
const route=express.Router();
import employee from '../middlewares/employeeMiddleware.js'
import {registrationMiddleware} from '../middlewares/registrationMiddleware.js'
import {registration,login} from '../controllers/registrationController.js';
import  {token_validate} from '../middlewares/auth.js';
// import { log } from 'console';
const storage=multer.memoryStorage();
const upload=multer();



// ****************_____Registration Start_____*****************
  
route.post('/registration',upload.single('image'),registrationMiddleware,registration)
route.post('/login',login)


// *****************_____Employee start___________//
route.get('/all/employee',all_employee)
route.post('/employee/registration', upload.single('files'),employee.employeMiddleware,employee_registration)
route.put('/employee/update/:id',upload.single('files'),employee.employeMiddleware,employee_update)
route.get('/employee/delete/:id',employee_Delete)
// ********************_____End_________//


// route.post('/employee/registration',employee.employeMiddleware,employee_registration)


export default route;


// setup backend_project download HR Management thema