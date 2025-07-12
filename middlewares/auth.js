import AppError from "../util/appError.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const key="abcdef";
import { registrationModel } from "../models/registrationModel.js";

const generate_Token = (data) => {
    try {
        const id = data.id;
        const token = jwt.sign({ id }, key, { expiresIn: '1D' });
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

        const employeeData = await registrationModel.findOne({ email });
        if (!employeeData) {
            return next(new AppError("User not found", 404));
        }


        if (employeeData.token !== token) {
            return next(new AppError("Invalid token", 401));
        }

        const decoded =await jwt.verify(token, key);


        const currentTime = Math.floor(Date.now() / 1000);
          if(!decoded){
            return next(new AppError("Token expired ",401));
          }
        // req.user = decoded;
        next(); 

    } catch (err) {
        // return
        return next(new AppError("Invalid or expired token", 401));
    }
};



export const apiKeyAuth = (req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (!clientKey || clientKey !== process.env.MY_SECRET_API_KEY) {
    return res.status(403).json({ message: 'Access Denied: Invalid API Key' });
  }

  next(); // ✅ API key valid hai, aage jao
};
// ayush_super_secret_123


export { generate_Token,token_validate };



 