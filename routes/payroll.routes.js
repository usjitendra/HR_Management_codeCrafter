import { Router } from "express";

const payrollRouter=Router();
import{viewSallery_slipe,viewSallery_employee,add_salary_slip,download_salary_slip} from "../controllers/payroll.controller.js"

payrollRouter.get("/view/list",viewSallery_slipe)
payrollRouter.get("/employee/view/list/:id",viewSallery_employee)
payrollRouter.post("/add/salary/slip",add_salary_slip)
payrollRouter.post("/download/salary/slip/:id",download_salary_slip)

export default payrollRouter;