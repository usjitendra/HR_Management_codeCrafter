import { Router } from "express";

const payrollRouter=Router();
import{viewSallery_slipe,viewSallery_employee} from "../controllers/payroll.controller.js"

payrollRouter.get("/view/list",viewSallery_slipe)
payrollRouter.get("/employee/view/list/:id",viewSallery_employee)

export default payrollRouter;