import { Router } from "express";
import { attandanceLogin } from "../controllers/attandance.controller.js";


const employeRoute=Router()


employeRoute.post("/:id",attandanceLogin)
employeRoute.post("/logout/:id",attandanceLogin)

export default employeRoute