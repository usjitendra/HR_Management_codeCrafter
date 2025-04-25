import { log } from "node:console";
import fs from "fs";
import path from "path";
import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";
import { body } from "express-validator";
import { emitKeypressEvents } from "node:readline";
import { registrationModel } from "../models/registrationModel.js";
import { create } from "node:domain";
import bcrypt from "bcryptjs";
import { json } from "node:stream/consumers";
import { generate_Token } from "../middlewares/auth.js";
import cloudinary from "cloudinary";
// const key="abcdef";
const key = process.env.JWT_SECRET;
import jwt from 'jsonwebtoken';
import AttandanceModel from "../models/attandance.model.js";
// const add_emploddyee = async (req, res, next) => {
//   try {

//     const { name, email,  mobile, department, designation, salary, joiningDate, role, password } = req.body;
//     const addEmp = await employeModel.create({
//       name, email,  mobile, department, designation, salary, joiningDate, role, password,
//       employImage:{
//         public_id:"",
//         secure_url:"",
//       }
//     });
//       if(req.file){
//           const result =await cloudinary.v2.uploader.upload(req.file.path,{
//             folder:"Employee Photo"
//           });
//           if(result){
//             (addEmp.employImage.public_id=result.public_id),
//             (addEmp.employImage.secure_url=result.secure_url)
//           }
//       }
//     res.status(200).json({ success: true, message: "Employee registered successfully", data: addEmp });
//   } catch (err) {
//     console.error(err);
//     next(new AppError(err.message, 500));
//   }
// };

const add_employee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      workEmail,
      alternateMobile,
      mobile,
      dob,
      gender,
      address,
      state,
      city,
      qualification,
      experience,
      maritalStatus,
      children,
      emergencyContact,
      role,
      password,
    } = req.body;

    const newEmpData = {
      name,
      email,
      workEmail,
      alternateMobile,
      mobile,
      dob,
      gender,
      address,
      state,
      city,
      qualification,
      experience,
      maritalStatus,
      children,
      emergencyContact,
      role,
      employeeImage: {},
      employeeIdCard: {},
      employeeDocument: {},
      new: true,
    };

    const files = req.files;

    if (files?.photo) {
      const result = await cloudinary.v2.uploader.upload(files.photo[0].path, {
        folder: "EmployeePhoto",
      });
      newEmpData.employeeImage = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }
    // Upload ID Card
    if (files?.idCard) {
      const result = await cloudinary.v2.uploader.upload(files.idCard[0].path, {
        folder: "EmployeeIDCard",
      });
      newEmpData.employeeIdCard = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    // Upload Document
    if (files?.document) {
      const result = await cloudinary.v2.uploader.upload(
        files.document[0].path,
        {
          folder: "EmployeeDocument",
        }
      );
      newEmpData.employeeDocument = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    const addEmp = await employeModel.create(newEmpData);
   const result= await registrationModel.create({
      name,
      email,
      password,
      role:"employee",
    });
      addEmp.registrationId=result._id;
       addEmp.save();
    res.status(200).json({
      success: true,
      message: "Employee registered successfully",
      data: addEmp,
    });
  } catch (err) {
    console.error(err);
    next(new AppError(err.message, 500));
  }
};

const employee_update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      workEmail,
      alternateMobile,
      mobile,
      dob,
      gender,
      address,
      state,
      city,
      qualification,
      experience,
      maritalStatus,
      children,
      emergencyContact,
      role,
      password,
    } = req.body;

    const newEmpData = {
      name,
      email,
      workEmail,
      alternateMobile,
      mobile,
      dob,
      gender,
      address,
      state,
      city,
      qualification,
      experience,
      maritalStatus,
      children,
      emergencyContact,
      role,
      password,
    };

    const files = req.files;

    if (files?.photo) {
      const result = await cloudinary.v2.uploader.upload(files.photo[0].path, {
        folder: "EmployeePhoto",
      });
      newEmpData.employeeImage = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    // Upload ID Card
    if (files?.idCard) {
      const result = await cloudinary.v2.uploader.upload(files.idCard[0].path, {
        folder: "EmployeeIDCard",
      });
      newEmpData.employeeIdCard = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    // Upload Document
    if (files?.document) {
      const result = await cloudinary.v2.uploader.upload(
        files.document[0].path,
        {
          folder: "EmployeeDocument",
        }
      );
      newEmpData.employeeDocument = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }
    const addEmp = await employeModel.findByIdAndUpdate(id, newEmpData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Employee update successfully",
      data: addEmp,
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

const all_employee = async (req, res, next) => {
  try {
    const all_data = await employeModel.find();
    if (all_data) {
      return res.status(200).json({ message: "Success", data: all_data });
    } else {
      return res.status(500).json({ message: "Data not foun" });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const employee_Delete = async (req, res, next) => {
  try {
    const id = req.params.id;
    //  return console.log("ye h id",id);
    const result = await employeModel.findByIdAndDelete(id);
    if (result) {
      return res
        .status(200)
        .json({ message: "Employee delete successfully", success: true });
    } else {
      return next(new AppError("Record not found", 500));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const registration_employee = async (req, res, next) => {
  try {
    const { name, email, password, role, mobile } = req.body;
    const result = await registrationModel.findOne({ email, role });
    if (result) {
      return next(new AppError("user already registered"));
    }
    const newUser = await registrationModel.create({
      name,
      email,
      password,
      mobile,
      role: role,
    });
    if (newUser) {
      return res
        .status(200)
        .json({ status: true, message: "Employee Registration succeddful" });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const employee_login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    console.log(email, password, role);
    //  return
    if (!role == "employee") {
      return next(new AppError("Please enter a correct Role"));
    }
    const result = await employeModel.findOne({ email });
    if (!result) {
      return next(new AppError("Email password have wronge", 500));
    }
    const isMatch = await bcrypt.compare(password, result.password);
    if (isMatch) {
      const token = await generate_Token(result);
      await employeModel.findByIdAndUpdate(result._id, { token });
      res.cookie("employeeToken", token, {
        httpOnly: false,
        secure: false,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      const data = {
        id: result._id,
        email: result.email,
        name: result.email,
        phone: result.phone,
        department: result.department,
        designation: result.designation,
        salary: result.salary,
        role: result.role,
        create: result.createdAt,
        updatedAt: result.updatedAt,
        token: token,
      };
      return res
        .status(200)
        .json({ success: true, message: "Employee Registration", data });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const oneEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await employeModel.findById(id);
    if (data) {
      return res.status(200).json({ success: true, message: "success", data });
    } else {
      return next(new AppError("employee not found", 400));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const employeeAlldetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await employeModel
      .findById(id)
      .populate("leaveID")
      .populate("workId") 
      .populate("bankId") 
      .populate("attandanceId");
    if (!data) {
      return next(new AppError("Employee not found", 404));
    }

    const employeData=data.toObject()
          delete employeData.password;
    res.status(200).json({
      success: true,
      message: "Employee detail fetched successfully",
      data:employeData,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const employee_profile=async(req,res,next)=>{
  try {
     
    const token = req.cookies?.authToken; // Token from coo\
    if (!token) {
      return next(new AppError("Unauthorized: No token provided", 401));
    }
    const decoded = jwt.verify(token,key); 
    
    if (!decoded) {
        return next(new AppError("Token expired", 401));
    }
    const data=await employeModel.find({registrationId:decoded.id}) 
     
    const emplodata=await AttandanceModel.find({employeeId:data[0]._id})
     const alldata={
      data,
      emplodata
     }
    return res.status(200).json({
        success:true,
        message:"success",
        data:alldata
    })
} catch (err) {
    return next(new AppError(err.message, 401));
}
}

export {
  add_employee,
  employee_update,
  all_employee,
  employee_Delete,
  registration_employee,
  employee_login,
  oneEmployee,
  employeeAlldetail,
  employee_profile
};
