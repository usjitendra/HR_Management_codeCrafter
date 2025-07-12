import { Router } from "express";

const employee_document_route = Router()
import multer from "multer";
const upload = multer({});

import { add_document, document_get, delete_document, update_document, deleteUploadedDocuments_one } from "../controllers/employee.document.controller.js";
// import upload from "../middlewares/multer.middleware.js";

employee_document_route.post("/add/:id", upload.fields([
  { name: "pan", maxCount: 1 },
  { name: "aadhaar", maxCount: 1 },  // ✅ corrected name
  { name: "passbook", maxCount: 1 },
  { name: "highSchool", maxCount: 1 },
  { name: "graduation", maxCount: 1 },
  { name: "salarySlip", maxCount: 1 },
  // { name: "additional", maxCount: 1 },
]), add_document)


employee_document_route.get('/get/:id', document_get)
employee_document_route.delete("/delete/:id", delete_document)

employee_document_route.put("/update/:id", upload.fields([
  { name: "pan", maxCount: 1 },
  { name: "aadhaar", maxCount: 1 },
  { name: "passbook", maxCount: 1 },
  { name: "highSchool", maxCount: 1 },
  { name: "graduation", maxCount: 1 },
  { name: "salarySlip", maxCount: 1 }
]), update_document)

employee_document_route.put(
  "/delete-one/:id",
  upload.fields([
    { name: "pan", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "passbook", maxCount: 1 },
    { name: "highSchool", maxCount: 1 },
    { name: "graduation", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 }
  ]),
  deleteUploadedDocuments_one
);

export default employee_document_route;