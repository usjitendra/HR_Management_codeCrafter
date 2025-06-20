import { Router } from "express";
import { attandanceLogin,attandanceLogout,absent,employee_attendence, all_employee_aatendance,testApi,
    getChartAttendance,getMonthalyDetail,attendanceFilter,monthelydetail,individual_attandance_detai,
    todayCheckData
 } from "../controllers/attandance.controller.js";
// import test from "node:test";


const attandanceRoute=Router()


attandanceRoute.post("/checkIn/:id",attandanceLogin)
attandanceRoute.put("/checkout/:id",attandanceLogout)
attandanceRoute.put("/absent/:id",absent)
attandanceRoute.get("/detail/:id",employee_attendence)
attandanceRoute.get("/all/detail",all_employee_aatendance)
attandanceRoute.get("/test",testApi)
attandanceRoute.get("/get/chart",getChartAttendance)
attandanceRoute.get("/get/monthly/detail",getMonthalyDetail)
attandanceRoute.get("/filter",attendanceFilter)
attandanceRoute.post("/monthly/detail",monthelydetail)
attandanceRoute.get("/individual/:id",individual_attandance_detai)
attandanceRoute.get('/today/CheckinData/:id',todayCheckData)
// attandanceRoute.get("all/detal",employee_alldetai)

export default attandanceRoute