import {registrationModel} from "../models/registrationModel.js";
import AppError from "../util/appError.js";
import fs from "fs"
import bcrypt from "bcrypt";
import {generate_Token} from '../middlewares/auth.js'

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
         res.cookie("jwt", token, {
            httpOnly: true,  
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict", 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.status(200).json({
            message: "Login successful",
                user: {
                id: loginData._id,
                email: loginData.email,
                role: loginData.role, 
            },
            token:token
        });

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};



export  {registration,login}