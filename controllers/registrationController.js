import {registrationModel} from "../models/registrationModel.js";
import AppError from "../util/appError.js";
import fs from "fs"
import bcrypt from "bcryptjs";
const key="abcdef";
import jwt from 'jsonwebtoken';

import {generate_Token,token_validate} from '../middlewares/auth.js'
import path from "path";

const registration=async(req,res,next)=>{
    try{
           const{name,email,password,mobile,role}=req.body;
           console.log("a+++",email);
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
            return res.status(200).json({message:"User Registration Successfully",data:user});
            
    }catch(err){
        return next(new AppError(err.message,500))
    }
}


const login = async (req, res, next) => {
    try {
        console.log("b+++");
        const { email, password, role } = req.body;
        console.log(email, password, role);
        // return;
        const loginData = await registrationModel.findOne({ email });
        if (!loginData) {
            return next(new AppError("Invalid email or password.", 401));
        }
        const isPasswordValid = await bcrypt.compare(password, loginData.password);
        console.log(isPasswordValid);
        if (!isPasswordValid) {
            return next(new AppError("Invalid email or password.", 401));
        }
         const token=await generate_Token(loginData);
         await registrationModel.findByIdAndUpdate(loginData._id, { token });
         res.cookie("authToken", token, {
            httpOnly: false,  
            secure: true, 
            sameSite: "none", 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        // res.status(200).json({
        //     message: "Login successful",
        //         data: {
        //         id: loginData._id,
        //         email: loginData.email,
        //         role: loginData.role, 
        //     },
           
        // });

        const data={
            id: loginData._id,
                email: loginData.email,
                role: loginData.role,  
                token:token
        }

        res.status(200).json({
            success:true,
            message:"login",
            data
            })

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};

const isLogin = async (req, res, next) => {
    try {
      
    
        const token = req.cookies?.authToken; // Token from coo
       
        console.log("new token",token);

        const loginData = await registrationModel.find();

        // console.log("Token received:", token);

        if (!token) {
            return next(new AppError("Unauthorized: No token provided", 401));
        }

        const decoded = jwt.verify(token,key); 

        console.log("Decoded Token:", decoded);

        // return
        if (!decoded) {
            return next(new AppError("Token expired", 401));
        }
      
        return res.status(200).json({
            success:true,
            message:"get are:-",
            data:"success"
        })
     
    } catch (err) {
        console.error("JWT Error:", err.message);
        return next(new AppError("Invalid or expired token", 401));
    }
};

const logout=async(req,res,next)=>{
    try{
          res.clearCookie("authToken",{
            path:"/",
            httpOnly:"true",
            secure:false,
            sameSite:"lax"
          });
          req.session?.destroy();
          res.status(200).json({message:"Logout Successfully",});
    }catch(err){
        return next(new AppError("Internal server error",500))
    }
}








export  {registration,login,isLogin,logout}