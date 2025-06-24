import { Router } from "express";

 const employee_document_route=Router()
  import multer from "multer";
  const upload=multer({});

 import { add_document,document_get} from "../controllers/employee.document.controller.js";
// import upload from "../middlewares/multer.middleware.js";

employee_document_route.post("/add/:id",upload.fields([
  { name: "pan", maxCount: 1 },
  { name: "aadhaar", maxCount: 1 },  // ✅ corrected name
  { name: "passbook", maxCount: 1 },
  { name: "highSchool", maxCount: 1 },
  { name: "graduation", maxCount: 1 }
]),add_document)


employee_document_route.get('/get/:id',document_get)


export default employee_document_route;