import { Router } from "express";
const leaveRoutes=Router();

import { applyLeave,getMyLeaves,approveLeave,deleteLeave,rejectLeave} from "../controllers/leave.controller.js";


leaveRoutes.post("/add/:id",applyLeave)
leaveRoutes.get("/get/myleave/:id",getMyLeaves)
leaveRoutes.put("/aproved/:id",approveLeave)
leaveRoutes.delete("/delete/:id",deleteLeave)
leaveRoutes.put("/reject/:id",rejectLeave)


export default leaveRoutes;