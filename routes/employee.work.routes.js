import { Router } from "express";
const employeeWorkRout=Router();

import { work_Add,worka_update,work_delete,getWork,allData } from "../controllers/employee.work.controller.js";


employeeWorkRout.post('/add/:id',work_Add)
employeeWorkRout.put('/update/:id',worka_update)
employeeWorkRout.delete('/delete/:id',work_delete)
employeeWorkRout.get("/get/:id",getWork)
employeeWorkRout.get("/alldata",allData)

export default employeeWorkRout;