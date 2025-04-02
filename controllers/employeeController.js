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
import cloudinary from "cloudinary"

const add_employee = async (req, res, next) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate, role, password } = req.body;
    const addEmp = await employeModel.create({
      name, email, phone, department, designation, salary, joiningDate, role, password,
      employImage:{
        public_id:"",
        secure_url:"",
      }
    });
      if(req.file){
          const result =await cloudinary.v2.uploader.upload(req.file.path,{
            folder:"Employee Photo"
          });
          if(result){
            (addEmp.employImage.public_id=result.public_id),
            (addEmp.employImage.secure_url=result.secure_url)
          }    
      }
    res.status(200).json({ success: true, message: "Employee registered successfully", data: addEmp });
  } catch (err) {
    console.error(err);
    next(new AppError(err.message, 500));
  }
};


const employee_update = async (req, res, next) => {
  try {
      const {id}=req.params;
      console.log(id);
      // console.log(req.body);
      // return;
    const { name, email, phone, department, designation, salary, joiningDate, role, password } = req.body;
    const addEmp = await employeModel.findByIdAndUpdate(id,{
      name, email, phone, department, designation, salary, joiningDate, role, password,
      employImage:{
        public_id:"",
        secure_url:"",
      }
    });
      // if(addEmp){
      //   return next(new AppError("Employee not found",400));
      // }
      if(req.file){
          const result =await cloudinary.v2.uploader.upload(req.file.path,{
            folder:"Employee Photo"
          });
          if(result){
            (addEmp.employImage.public_id=result.public_id),
            (addEmp.employImage.secure_url=result.secure_url)
          }    
      }
    res.status(200).json({ success: true, message: "Employee update successfully", data: addEmp });
  } catch (err) {
    console.error(err);
    next(new AppError(err.message, 500));
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
       const{email,password,role}=req.body;
       console.log(email,password,role);
      //  return
      if(!role=="employee"){
          return next(new AppError("Please enter a correct Role"));
      }
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
            secure: false, 
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
