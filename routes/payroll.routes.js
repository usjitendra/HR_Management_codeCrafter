import { Router } from "express";

const payrollRouter=Router();
import{viewSallery_slipe,viewSallery_employee,add_salary_slip,download_salary_slip,
    viewSalary_ByMonth,SalaryPay} from "../controllers/payroll.controller.js"

payrollRouter.get("/view/list",viewSallery_slipe)
payrollRouter.get("/employee/view/list/:id",viewSallery_employee)
payrollRouter.get("/employee/view/list/by-month/:id",viewSalary_ByMonth)
payrollRouter.post("/add/salary/slip",add_salary_slip)
payrollRouter.post("/download/salary/slip/:id",download_salary_slip)
payrollRouter.post("/pay/salary",SalaryPay)
export default payrollRouter;