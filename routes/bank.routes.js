
import { Router } from "express";

const bnakRoutes=Router();
import { add_bank,update_bank_detail,delet_bank_detail,get_bank_detail,getOneData} from "../controllers/bank.controller.js";



bnakRoutes.post('/add/:id',add_bank)
bnakRoutes.put('/update/:id',update_bank_detail)
bnakRoutes.delete('/delete/:id',delet_bank_detail)
bnakRoutes.get('/detail/:id',get_bank_detail)
bnakRoutes.get('/one/:id',getOneData)


export default bnakRoutes;
