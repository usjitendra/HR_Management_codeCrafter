import { Router } from "express";

const payrollRouter=Router();
import{viewSallery_slipe} from "../controllers/payroll.controller.js"

payrollRouter.get("/view/list",viewSallery_slipe)

export default payrollRouter;