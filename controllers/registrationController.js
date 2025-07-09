import { registrationModel } from "../models/registrationModel.js";
import AppError from "../util/appError.js";
import fs from "fs"
import bcrypt from "bcryptjs";
const key = process.env.JWT_SECRET;
import jwt from 'jsonwebtoken';
import otpModel from "../models/otp/otp.js"; // adjust the path as needed
import { sendOtp } from "../util/sendMail.js"; // path to the sendOtp function
import { generate_Token, token_validate } from '../middlewares/auth.js'
import employeModel from "../models/employeeModel.js";
import crypto from "crypto"
// import { path } from "pdfkit";

// const pass=async(pass)=>{
//      const has=crypto.pbkdf2Sync(pass,'5',1000,64,'sha512').toString('hex')
//      console.log("has",has);

// }

// pass("Nn@12345");


const registration = async (req, res, next) => {
    try {
        const { name, email, password, mobile, role } = req.body;
        const existingUser = await registrationModel.findOne({ email })
        if (existingUser) {
            return next(new AppError("Record already exists"));
        }
        let image = { public_Id: "", secure_url: "" };
        if (req.file) {
            const uploadPath = `image/registrationImage${Date.now()}-${req.file.originalname}`
            fs.writeFileSync(uploadPath, req.file.buffer)
            image = { public_Id: "", secure_url: uploadPath }
        }
        const user = await registrationModel.create({
            name,
            email,
            password,
            mobile,
            role,
        })
        return res.status(200).json({ success: true, message: "User Registration Successfully", data: user });

    } catch (err) {
        return next(new AppError(err.message, 500))
    }
}

const registrationAdmin = async () => {
    try {
        const degaultEmail = "codecrafter@gmail.com"
        const existingUser = await registrationModel.findOne({ email: degaultEmail })
        if (existingUser) {

            return;
        }
        //    let image={public_Id:"",secure_url:""};
        //    if(req.file){
        //         const uploadPath=`image/registrationImage${Date.now()}-${req.file.originalname}`
        //         fs.writeFileSync(uploadPath,req.file.buffer)
        //         image={public_Id:"",secure_url:uploadPath}
        //     }
        const user = await registrationModel.create({
            name: "codeCrafter",
            email: "codecrafter@gmail.com",
            password: "12345",
            mobile: "123456",
            role: "Admin",
        })
        console.log("Admin create Successfully")

    } catch (err) {
        console.log(err.message)
    }
}
registrationAdmin();

console.log("aaaa");


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const loginData = await registrationModel.findOne({ email });
        if (!loginData) {
            return next(new AppError("Invalid email or password.", 402));
        }
        const isPasswordValid = await bcrypt.compare(password, loginData.password);
        if (!isPasswordValid) {
            return next(new AppError("Invalid email or password.", 402));
        }
        const token = await generate_Token(loginData);
        await registrationModel.findByIdAndUpdate(loginData._id, { token });
        const employeeeData = await employeModel.findOne({ registrationId: loginData.id })
        //  console.log(employeeeData);
        // res.cookie("authToken", token, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: "lax",
        //     maxAge: 24 * 60 * 60 * 1000
        // });


        res.cookie("authToken", token, {
            httpOnly: true,       // ✅ Prevents JavaScript access to the cookie
            secure: true,         // ✅ Ensures cookie is only sent over HTTPS
            sameSite: "none",     // ✅ Required when using cross-site requests (e.g., frontend on different domain)
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });


        const data = {
            id: loginData._id,
            email: loginData.email,
            role: loginData.role,
            token: token
        }

        res.status(200).json({
            success: true,
            message: "login",
            data,
            employeeeData: employeeeData
        })

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};

const isLogin = async (req, res, next) => {
    try {

        const token = req.cookies?.authToken;

        console.log("token is 123", token);

        if (!token) {
            console.log("kya hoga");

            return next(new AppError("kya hoha", 401));
        } else {


            const decoded = jwt.verify(token, key);
            if (!decoded) {

                console.log("mai chal kya");

                return next(new AppError("Token expired", 401));
            }

            console.log("decoded is", decoded);
            console.log("mai hu don");


            const data = await registrationModel.findById(decoded.id)
            const newData = {
                name: data.name,
                email: data.email,
                role: data.role,
                id: data._id
            }
            return res.status(200).json({
                success: true,
                message: "success",
                data: newData
            })
        }
    } catch (err) {
        return next(new AppError("Invalid or expired token", 401));
        // return res.status(200).json({ success: false, data: null });
    }
};

const logout = async (req, res, next) => {
    try {

        res.clearCookie("authToken", {
            path: "/",       // ✅ Prevents JavaScript access to the cookie
            httpOnly: true,
            secure: true,          // ✅ Ensures cookie is only sent over HTTPS
            sameSite: "none",     // ✅ Required when using cross-site requests (e.g., frontend on different domain)
        
        });

        // res.clearCookie("authToken", {
        //     path: "/",
        //     httpOnly: true,       // must match how it was set
        //     secure: false,        // because localhost is usually HTTP
        //     sameSite: "lax"       // safer default than "none" for local dev
        // });
        req.session?.destroy();
        res.status(200).json({ success: true, message: "Logout Successfully", });
    } catch (err) {
        return next(new AppError("Internal server error", 500))
    }
}



const otp_send = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log("email", email);
        // return;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const result = await registrationModel.findOne({ email: email });
        if (!result) {
            return next(new AppError("User not found", 400));
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        // Save OTP to DB
        await otpModel.create({ email, otp });

        // Send OTP to email
        await sendOtp(email, otp);

        return res.status(200).json({ success: true, message: "OTP sent successfully to your email" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};


const otp_verify = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        // console.log("otp",otp);
        // Find OTP from DB
        const otpRecord = await otpModel.findOne({ email }).sort({ createdAt: -1 });
        console.log("otpRecord", otp);
        console.log("otpRecord", otpRecord);

        if (!otpRecord || otpRecord.otp.toString() !== otp.toString()) {
            console.log("aaaa");

            return next(new AppError("In validate otp", 400));
        }

        const user = await registrationModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.password = newPassword;
        await user.save();

        // Delete OTP record after successful use
        await otpModel.deleteMany({ email });

        return res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        return next(new AppError(err.message));
    }
};






export { registration, login, isLogin, logout, otp_send, otp_verify }