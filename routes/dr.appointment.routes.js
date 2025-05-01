import { Router } from "express";
import { createAppointment,getAllAppointments } from "../controllers/dr.appoinment.controller.js";

const drappointment = Router();

drappointment.post("/booking", createAppointment);
drappointment.get("/all",getAllAppointments)

export default drappointment;
