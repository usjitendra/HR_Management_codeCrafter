import { Router } from "express";

const payrollRouter=Router();
import{viewSallery_slipe,viewSallery_employee,add_salary_slip,download_salary_slip,
viewSalary_ByMonth,SalaryPay,total_paid_unpaid} from "../controllers/payroll.controller.js"

payrollRouter.get("/view/list",viewSallery_slipe)
payrollRouter.get("/employee/view/list/:id",viewSallery_employee)
payrollRouter.get("/employee/view/list/by-month/:id",viewSalary_ByMonth)
payrollRouter.post("/add/salary/slip",add_salary_slip)
payrollRouter.post("/pay/salary",SalaryPay)
payrollRouter.get("/download/salary/slip/:id",download_salary_slip)
payrollRouter.get("/total/salary/paid-unpaid",total_paid_unpaid)
export default payrollRouter;