import AppError from "../util/appError.js";
import jwt from 'jsonwebtoken';
const key="abcdef";
import { registrationModel } from "../models/registrationModel.js";

const generate_Token = (data) => {
    console.log("sjd",key)
    try {
        const id = data.id;
        const token = jwt.sign({ id }, key, { expiresIn: '1D' });
        console.log(token);
        return token;
    } catch (err) {
        throw new AppError(err.message, 500);
    }
};

const token_validate = async (req, res, next) => {
    try {
        let token = req.cookies?.token || req.headers.authorization?.split(" ")[1]; 
        if (!token) {
            return next(new AppError("Unauthorized: No token provided", 401));
        }
        const email = req.body.email;
        // console.log("Email:", email);

        // Find user in the database
        const employeeData = await registrationModel.findOne({ email });
        if (!employeeData) {
            return next(new AppError("User not found", 404));
        }


        if (employeeData.token !== token) {
            return next(new AppError("Invalid token", 401));
        }

        const decoded =await jwt.verify(token, key);
        console.log("t++++",decoded);

        const currentTime = Math.floor(Date.now() / 1000);

        // if (decoded.exp && decoded.exp < currentTime) {
        //     return next(new AppError("Token expired", 401));
        // }
        // console
          if(!decoded){
            return next(new AppError("Token expired ",401));
          }
        // req.user = decoded;
        next(); 

    } catch (err) {
        return next(new AppError("Invalid or expired token", 401));
    }
};




export { generate_Token,token_validate };



 // const currentTime = Math.floor(Date.now() / 1000); 
    //  console.log("currentTime++",currentTime);
    // if (decoded.exp && decoded.exp < currentTime) {
    //     return next(new AppError("Token expired", 401));
    // }else{
    //     next();
    // }