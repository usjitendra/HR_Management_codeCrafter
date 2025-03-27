import { log } from "node:console";
import fs from "fs";
import path from "path";
import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";
import { body } from "express-validator";
import { emitKeypressEvents } from "node:readline";
import { registrationModel } from "../models/registrationModel.js";
import { create } from "node:domain";
import bcrypt from 'bcryptjs';
import { json } from "node:stream/consumers";
import { generate_Token } from "../middlewares/auth.js";

const  add_employee= async (req, res, next) => {
  try {
    console.log(req.body);
    // return
    const { name, email, phone, department, designation, salary, joiningDate,role,password} =
      req.body;
    // console.log("name++", role);
    // return
    if (req.file) {
      console.log(req.file);
      const uploadPath = `image/employeeImage/${Date.now()}-${
        req.file.originalname
      }`;
      fs.writeFileSync(uploadPath, req.file.buffer);
      console.log("path++", uploadPath);
      const validRole = ["employee", "manager", "admin"].includes(role) ? role : "employee";
      const addEmp = await employeModel.create({
        name,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
        password,
        role:role,
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
        password,
        salary,
          role:role,
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
       
    const {id}=req.params

    const data=req.body

    console.log(id,data)
    // return;
      // console.log("name++",req.body);
      // return res.send({status:200,data:"successfully"})
    const {name, email, phone, department, designation, salary, joiningDate } =
      req.body;
    // return;
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
      const addEmp = await employeModel.findByIdAndUpdate(id,{
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
        // data: addEmp,
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

const employee_Delete=async(req,res,next)=>{
          try{
                const id=req.params.id;
                //  return console.log("ye h id",id);
                const result=await employeModel.findByIdAndDelete(id)
                if(result){
                  return res.status(200).json({message:"Employee delete successfully",success:true});
                }else{
                  return next(new AppError("Record not found",500));
                }
          }catch(err){
            return next(new AppError(err.message,500));
          }
}

const registration_employee=async(req,res,next)=>{
            try{
                    const {name,email,password,role,mobile}=req.body;
                    const result=await registrationModel.findOne({email,role})
                    if(result){
                          return next(new AppError("user already registered",))
                    }
                    const newUser= await registrationModel.create({
                      name,email,password,mobile,role:role
                    })
                    if(newUser){
                      return res.status(200).json({status:true,message:"Employee Registration succeddful"});
                    }
            }catch(err){
              return  next(new AppError(err.message,500));
            }
}

const employee_login= async(req,res,next)=>{
  try{
       const{email,password}=req.body;
       const result=await employeModel.findOne({email})
        if(!result){
          return next(new AppError("Email password have wronge",500))
        } 
        const isMatch=await bcrypt.compare(password,result.password) 
        if(isMatch){
          const token=await generate_Token(result);
         await employeModel.findByIdAndUpdate(result._id, { token });
         res.cookie("employeeToken", token, {
            httpOnly: false,  
            secure: true, 
            sameSite: "none", 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
         const data={
           id:result._id,
           email:result.email,
           name:result.email,
           phone:result.phone,
           department:result.department,
           designation:result.designation,
           salary:result.salary,
           role:result.role,
           create:result.createdAt,
           updatedAt:result.updatedAt,
           token:token,
         }
         return res.status(200).json({success:true,message:"Employee Registration",data})
        }
  }catch(err){
    return next(new AppError(err.message,500)) 
  }
}


export { add_employee, employee_update,all_employee,employee_Delete,registration_employee,employee_login };
