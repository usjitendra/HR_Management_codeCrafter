import { log } from "node:console";
import fs from "fs";
import path from "path";
import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";

const employee_registration = async (req, res, next) => {
  try {
    // console.log(req.body);
    const { name, email, phone, department, designation, salary, joiningDate } =
      req.body;
    console.log("name++", name, email, phone);
    if (req.file) {
      console.log(req.file);
      const uploadPath = `image/employeeImage/${Date.now()}-${
        req.file.originalname
      }`;
      fs.writeFileSync(uploadPath, req.file.buffer);
      console.log("path++", uploadPath);
      const addEmp = await employeModel.create({
        name,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
        employImage: {
          public_id: uploadPath?.public_id || "",
          secure_url: uploadPath,
        },
      });
      return res.status(200).json({
        success: true,
        message: "Employee registration Successfully",
        data:addEmp,
      });
    } else {
      const addEmp = await employeModel.create({
        name,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
      });
      res.status(200).json({
        success: true,
        message: "Employee registration Successfully",
        data: addEmp,
      });
    }
  } catch (err) {
    console.log(err);
    return next(new AppError(err.message, 500));
  }
};

const employee_update = async (req, res, next) => {
  try {

   console.log(req.originalUrl,req.method);

   console.log("ip++++",req.ip);
   
    
      const id=req.params.id;
    const { name, email, phone, department, designation, salary, joiningDate } =
      req.body;
    // console.log("name++", name, email, phone);
    if (req.file) {
      console.log(req.file);
      const uploadPath = `image/employeeImage/${Date.now()}-${
        req.file.originalname
      }`;
      fs.writeFileSync(uploadPath, req.file.buffer);
      console.log("path++", uploadPath);
      const addEmp = await employeModel.findByIdAndUpdate(id,{
        name,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
        employImage: {
          public_id: uploadPath?.public_id || "",
          secure_url: uploadPath,
        },
      });
      return res.status(200).json({
        success: true,
        message: "Employee update successfully",
      });
    } else {
      const addEmp = await employeModel.create({
        name,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
      });
      res.status(200).json({
        success: true,
        message: "Employee update Successfully",
        data: addEmp,
      });
    }
  } catch (err) {
    console.log(err);
    return next(new AppError(err.message, 500));
  }
};


const all_employee=async(req,res,next)=>{
  try{
         const all_data= await employeModel.find();
          if(all_data){
            return res.status(200).json({message:"Success",data:all_data});
          }else{
            return res.status(500).json({message:"Data not foun"});
          }
         
  }catch(err){
    return next(new AppError(err.message,500))
  }
}

export { employee_registration, employee_update,all_employee };
