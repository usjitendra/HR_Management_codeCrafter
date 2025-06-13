
import { Router } from "express";

const compamyProfileRoute=Router();
import{company_overview,registrationOfficeAddress,corporateOfficeAddress,customAddress,
    announcement,getOverviewData,getAllData
}from "../controllers/company.profile.controller.js"

import multer from "multer";
const upload=multer();


compamyProfileRoute.post("/add/overview",upload.single("logo"),company_overview)
compamyProfileRoute.post("/add/address/registered",registrationOfficeAddress)
compamyProfileRoute.post("/add/address/corporate",corporateOfficeAddress)
compamyProfileRoute.post("/add/address/custom",customAddress)
compamyProfileRoute.post("/add/announcement",announcement)
compamyProfileRoute.get("/get/overview/data",getOverviewData)
compamyProfileRoute.get("/get/all/data",getAllData)

export default compamyProfileRoute