import { Router } from "express";
import { attandanceLogin,attandanceLogout,absent } from "../controllers/attandance.controller.js";


const employeRoute=Router()


employeRoute.post("/:id",attandanceLogin)
employeRoute.post("/logout/:id",attandanceLogout)
employeRoute.put("/absent/:id",absent)

export default employeRoute