import { Router } from "express";
import { policy_add,delet_policy,allPolicy,policy_edit} from "../controllers/policy.js";
const Policy=Router()


Policy.post("/add",policy_add)
Policy.put('/update/:id',policy_edit)
Policy.delete('/delete/:id',delet_policy)
Policy.get("/all",allPolicy)

export default Policy