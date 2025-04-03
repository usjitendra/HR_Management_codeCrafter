import { Router } from "express";
import { attandanceLogin,attandanceLogout,absent,employee_attendence, all_employee_aatendance,testApi } from "../controllers/attandance.controller.js";
// import test from "node:test";


const attandanceRoute=Router()


attandanceRoute.post("/:id",attandanceLogin)
attandanceRoute.post("/logout/:id",attandanceLogout)
attandanceRoute.put("/absent/:id",absent)
attandanceRoute.get("/detail/:id",employee_attendence)
attandanceRoute.get("/all/detail",all_employee_aatendance)
attandanceRoute.get("/test",testApi)

export default attandanceRoute