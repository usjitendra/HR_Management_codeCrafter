import { Router } from "express";
const leaveRoutes=Router();
import multer from "multer";
const upload=multer()

import { applyLeave,singleLeave,getMyLeaves,approveLeave,deleteLeave,rejectLeave,
 alldetail,leaveEdit,allEmployeeLeaveDetail,allLeave,todayLeave} from "../controllers/leave.controller.js";


leaveRoutes.post("/add/:id",upload.none(),applyLeave)
leaveRoutes.get("/get/myleave/:id",getMyLeaves)
leaveRoutes.put("/aproved/:id",approveLeave)
leaveRoutes.delete("/delete/:id",deleteLeave)
leaveRoutes.put("/reject/:id",rejectLeave)
leaveRoutes.get("/all/detal",alldetail)
leaveRoutes.get("/all/employee",allEmployeeLeaveDetail)
leaveRoutes.put("/edit/:id",upload.none(),leaveEdit)
leaveRoutes.get("/all",allLeave)
leaveRoutes.get("/single/leave/:id",singleLeave)
leaveRoutes.get("/today",todayLeave)


export default leaveRoutes;