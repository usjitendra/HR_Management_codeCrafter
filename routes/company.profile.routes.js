
import { Router } from "express";

const compamyProfileRoute=Router();
import{company_overview,registrationOfficeAddress,corporateOfficeAddress,customAddress,
    announcement,getOverviewData,getAllData,allAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    update_company_overview,
    updateCorporateOfficeAddress,
    updateCustomAddress,
    updateRegistrationOfficeAddress
}from "../controllers/company.profile.controller.js"

import multer from "multer";
const upload=multer();


compamyProfileRoute.post("/add/overview",upload.single("logo"),company_overview)
compamyProfileRoute.put("/update/overview/:id",upload.single("logo"),update_company_overview)

compamyProfileRoute.post("/add/address/registered",registrationOfficeAddress)
compamyProfileRoute.put("/update/address/registered/:id",updateRegistrationOfficeAddress)

compamyProfileRoute.post("/add/address/corporate",corporateOfficeAddress)
compamyProfileRoute.put("/update/address/corporate/:id",updateCorporateOfficeAddress)

compamyProfileRoute.post("/add/address/custom",customAddress)
compamyProfileRoute.put("/update/address/custom",updateCustomAddress)


compamyProfileRoute.post("/add/announcement",announcement)
compamyProfileRoute.get("/get/all/announcements",allAnnouncement)
compamyProfileRoute.put("/update/announcement/:id",updateAnnouncement)
compamyProfileRoute.delete("/delete/announcement/:id",deleteAnnouncement)




compamyProfileRoute.get("/get/overview/data",getOverviewData)
compamyProfileRoute.get("/get/all/data",getAllData)


export default compamyProfileRoute
