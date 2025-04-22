import { Router } from "express";
const leaveRoutes=Router();
import multer from "multer";
const upload=multer()

import { applyLeave,getMyLeaves,approveLeave,deleteLeave,rejectLeave,alldetail,leaveEdit} from "../controllers/leave.controller.js";


leaveRoutes.post("/add/:id",upload.none(),applyLeave)
leaveRoutes.get("/get/myleave/:id",getMyLeaves)
leaveRoutes.put("/aproved/:id",approveLeave)
leaveRoutes.delete("/delete/:id",deleteLeave)
leaveRoutes.put("/reject/:id",rejectLeave)
leaveRoutes.get("/all/detal",alldetail)
leaveRoutes.put("/edit/:id",upload.none(),leaveEdit)


export default leaveRoutes;