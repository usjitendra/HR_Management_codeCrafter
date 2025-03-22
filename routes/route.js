import express from 'express';
import {employee_registration,employee_update} from '../controllers/employeeController.js'
import multer from 'multer';
const route=express.Router();
import employee from '../middlewares/employeeMiddleware.js'
import {registrationMiddleware} from '../middlewares/registrationMiddleware.js'
import {registration,login} from '../controllers/registrationController.js';
import  {verify_token,token_vailidate,token_validate} from '../middlewares/auth.js';
// import { log } from 'console';
const storage=multer.memoryStorage();
const upload=multer();



// ****************_____Registration Start_____*****************
  
route.post('/registration',upload.single('image'),registrationMiddleware,registration)
route.post('/login',login)



route.post('/employee/registration', upload.single('files'),token_validate,employee.employeMiddleware,employee_registration)
route.put('/employee/update:id',upload.single('files'),employee.employeMiddleware,employee_update)
// route.post('/employee/registration',employee.employeMiddleware,employee_registration)


export default route;


// setup backend_project download HR Management thema