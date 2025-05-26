import {registrationModel} from "../models/registrationModel.js";
import AppError from "../util/appError.js";
import fs from "fs"
import bcrypt from "bcryptjs";
const key = process.env.JWT_SECRET;
import jwt from 'jsonwebtoken';

import {generate_Token,token_validate} from '../middlewares/auth.js'
import path from "path";
import employeModel from "../models/employeeModel.js";

const registration=async(req,res,next)=>{
    try{
           const{name,email,password,mobile,role}=req.body;
           const existingUser=await registrationModel.findOne({email})
           if(existingUser){
             return next(new AppError("Record already exists"));
           }
           let image={public_Id:"",secure_url:""};
           if(req.file){
                const uploadPath=`image/registrationImage${Date.now()}-${req.file.originalname}`
                fs.writeFileSync(uploadPath,req.file.buffer)
                image={public_Id:"",secure_url:uploadPath}
            }
            const user=await registrationModel.create({
                name,
                email,
                password,
                mobile,
                role,
            })
            return res.status(200).json({success:true, message:"User Registration Successfully",data:user});
            
    }catch(err){
        return next(new AppError(err.message,500))
    }
}
 
const registrationAdmin=async()=>{
    try{
           const degaultEmail="codecrafter@gmail.com"
           const existingUser=await registrationModel.findOne({email:degaultEmail})
           if(existingUser){
              
               return;
           }
        //    let image={public_Id:"",secure_url:""};
        //    if(req.file){
        //         const uploadPath=`image/registrationImage${Date.now()}-${req.file.originalname}`
        //         fs.writeFileSync(uploadPath,req.file.buffer)
        //         image={public_Id:"",secure_url:uploadPath}
        //     }
            const user=await registrationModel.create({
                name:"codeCrafter",
                email:"codecrafter@gmail.com",
                password:"Cc@12345c",
                mobile:"123456",
                role:"Admin",
            })
           console.log("Admin create Successfully")
            
    }catch(err){
         console.log(err.message)
    }
}
registrationAdmin();
  

const login = async (req, res, next) => {
    try {
        const { email, password,fcmToken } = req.body;
        
        const loginData = await registrationModel.findOne({ email });
        if (!loginData) {
            return next(new AppError("Invalid email or password.", 402));
        }
        const isPasswordValid = await bcrypt.compare(password, loginData.password);
        if (!isPasswordValid) {
            return next(new AppError("Invalid email or password.", 402));
        }
         const token=await generate_Token(loginData);
         await registrationModel.findByIdAndUpdate(loginData._id, { token });
        //  await employeModel.findOneAndUpdate({registrationId:loginData.id,fcmToken:fcmToken});
         const employeeeData=await employeModel.findOne({registrationId:loginData.id})
        //  console.log(employeeeData);
         res.cookie("authToken", token, {
            httpOnly: true,  
            secure: true, 
            sameSite: "none", 
            maxAge: 24 * 60 * 60 * 1000 
        });
      
        const data={
            id: loginData._id,
                email: loginData.email,
                role:loginData.role,  
                token:token
        }

        res.status(200).json({
            success:true,
            message:"login",
            data,
             employeeeData:employeeeData
            })

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};

const isLogin = async (req, res, next) => {
    try {
          
        const token = req.cookies?.authToken; 
        // if (!token) {
        //     // return next(new AppError("", 401));
        // }
        const decoded = jwt.verify(token,key); 
        if (!decoded) {
            return next(new AppError("Token expired", 401));
        }
        
        const data=await registrationModel.findById(decoded.id)
            const newData={
                name:data.name,
                email:data.email,
                role:data.role,
                id:data._id
            }
        return res.status(200).json({
            success:true,
            message:"success",
            data:newData
        })
    } catch (err) {
        return next(new AppError("Invalid or expired token", 401));
        // return res.status(200).json({ success: false, data: null });
    }
};

const logout=async(req,res,next)=>{
    try{
          res.clearCookie("authToken",{
            path:"/",
            httpOnly:true,
            secure:true,
            sameSite:"none"
          });
          req.session?.destroy();
          res.status(200).json({success:true, message:"Logout Successfully",});
    }catch(err){
        return next(new AppError("Internal server error",500))
    }
}




export  {registration,login,isLogin,logout}