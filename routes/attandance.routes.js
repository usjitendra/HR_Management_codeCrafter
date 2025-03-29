import { Router } from "express";
import { attandanceLogin,attandanceLogout,absent,attendence_detail } from "../controllers/attandance.controller.js";


const attandanceRoute=Router()


attandanceRoute.post("/:id",attandanceLogin)
attandanceRoute.post("/logout/:id",attandanceLogout)
attandanceRoute.put("/absent/:id",absent)
attandanceRoute.get("/all/detail/:id",attendence_detail)

export default attandanceRoute