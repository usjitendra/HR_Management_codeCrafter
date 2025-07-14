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
import leaveModel from "../models/leave.model.js";
import { validate } from "node-cron";
import { sendMail } from "../util/sendMail.js";
import moment from "moment";
import employeeWorkModel from "../models/employee.work.information.model.js";
import employeeBankModel from "../models/employee.bank.model.js";
import { getNextEmployeeId } from "../middlewares/generate.employee.id.js";
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

const   add_employee = async (req, res, next) => {

  console.log("empId");

  // return
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
    } = req.body;
    console.log(req.body);
    // return

    const mobileResult = await employeModel.find({ mobile: mobile });

    if (mobileResult.length > 0) {
      return next(new AppError("Mobile number already exists", 400));
    }

    const empId = await getNextEmployeeId();
    console.log("Generated Employee ID:", empId);
     console.log("Ma'am CRM project ka back end project set up karu ?");
     
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
      empId,
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
    const password = 'cws' + mobile.toString().slice(-4);
    const addEmp = await employeModel.create(newEmpData);
    const result = await registrationModel.create({
      name,
      email,
      password,
      role: "employee",
    });
    //  console.log();

    addEmp.registrationId = result._id;
    addEmp.save();

    const emailBody = `
  <div style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width:600px; margin:auto;">
    <h2>Welcome to Code Crafter HRMS, ${name} 👋</h2>
    <p>Your employee account has been successfully created. Below are your login credentials:</p>

    <table style="border-collapse: collapse; margin-top: 10px;">
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Email</td>
        <td style="border: 1px solid #ccc; padding: 8px;">${email}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Password</td>
        <td style="border: 1px solid #ccc; padding: 8px;">${password}</td>
      </tr>
    </table>

    <p style="margin-top: 20px;">
      You can now <strong>log in</strong> to the HRMS system and get started.
    </p>

    <p style="margin-top: 30px;">Best regards,<br />HRMS Team</p>
    <a href="https://updatedhrms.netlify.app/login" style="display:inline-block;padding:10px 20px;background-color:#06425F;color:#fff;border-radius:4px;text-decoration:none;margin-top:15px;">
  Login to HRMS
</a>

    </div>
  </div>
`;
    await sendMail(email, "Your HRMS Login Credentials", emailBody);


    res.status(200).json({
      success: true,
      message: "Employee registered successfully",
      data: addEmp,
    });
  } catch (err) {
    console.error(err.message);
    return next(new AppError(err.message, 500));
  }
};


const employee_update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingEmployee = await employeModel.findById(id);
    if (!existingEmployee) {
      return next(new AppError("", 404));
    }

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

    const updatedData = {
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
      password: ""
    };

    const files = req.files;

    if (files?.photo) {
      const result = await cloudinary.v2.uploader.upload(files.photo[0].path, {
        folder: "EmployeePhoto",
      });
      updatedData.employeeImage = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    if (files?.idCard) {
      const result = await cloudinary.v2.uploader.upload(files.idCard[0].path, {
        folder: "EmployeeIDCard",
      });
      updatedData.employeeIdCard = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    if (files?.document) {
      const result = await cloudinary.v2.uploader.upload(files.document[0].path, {
        folder: "EmployeeDocument",
      });
      updatedData.employeeDocument = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    if (existingEmployee.registrationId) {
      const regUpdate = { name, email, };
      if (password && password.trim() !== "") {
        regUpdate.password = password
      }
      await registrationModel.findByIdAndUpdate(existingEmployee.registrationId, regUpdate, {
        new: true,
        runValidators: true,
      });
    }

    const updatedEmployee = await employeModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedEmployee,
    });
  } catch (err) {
    console.error(err.message);
    return next(new AppError(err.message, 500));
  }
};


const all_employee = async (req, res, next) => {
  try {
    const all_data = await employeModel.find();
    const allWorks = await employeeWorkModel.find()
    let totalSalary = 0
    allWorks.forEach(work => {
      totalSalary += Number(work.salary) || 0;
    })
    const today = moment().startOf("day").toDate();
    const todayPresent = await leaveModel.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: "present"
    });

    const totalEmployees = all_data.length;
    const present = todayPresent.length;
    const onLeave = totalEmployees - present;

    const data = {
      summary: {
        totalEmployees,
        onLeave,
        present,
        totalSalary,
      },
      all_data: all_data
    }
    return res.status(200).json({
      success: true,
      message: "Success",
      data
    });

  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

const employee_Delete = async (req, res, next) => {
  try {
    const id = req.params.id;
    const employee = await employeModel.findByIdAndDelete(id);

    if (!employee) {
      return next(new AppError("", 404));
    }

    console.log("employee.registrationId", employee.registrationId);
    // return

    const registration = await registrationModel.findByIdAndDelete(employee.registrationId);
    const levave = await leaveModel.deleteMany({ employeeId: id })
    const attendance = await AttandanceModel.deleteMany({ employeeId: id })
    await employeeWorkModel.findOneAndDelete({ employeeId: id })
    await employeeBankModel.findOneAndDelete({ employeeId: id })
    res.status(200)
      .json({ success: true, message: "Employee deleted successfully", registration: registration, levave: levave, attendance: attendance });

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
      return next(new AppError("success", 400));
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

    const employeData = data.toObject()
    delete employeData.password;
    res.status(200).json({
      success: true,
      message: "Employee detail fetched successfully",
      data: employeData,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const employee_profile = async (req, res, next) => {
  try {

    const token = req.cookies?.authToken; // Token from coo\
    if (!token) {
      return next(new AppError("success", 401));
    }
    const decoded = jwt.verify(token, key);

    if (!decoded) {
      return next(new AppError("Token expired", 401));
    }
    const data = await employeModel.find({ registrationId: decoded.id })

    const emplodata = await AttandanceModel.find({ employeeId: data[0]._id })
    const alldata = {
      data,
      emplodata
    }
    return res.status(200).json({
      success: true,
      message: "success",
      data: alldata
    })
  } catch (err) {
    return next(new AppError("success", 401));
  }
}



const single_employee_allDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await employeModel.findById(id)
      .populate("workId")
      .populate("bankId")
      .populate("attandanceId")
      .populate("leaveID")
      .populate("registrationId")
      .populate("performanceId");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee detail fetched successfully",
      data: employee,
    });
  } catch (err) {
    return next(new AppError(err.message || "Something went wrong", 500));
  }
};


const saveFcmToken = async (req, res, next) => {
  try {
    const { id, token } = req.body;

    // Fetch employee document
    const validatEmployee = await employeModel.findById(id); // ✅ Add await

    // If employee not found
    if (!validatEmployee) {
      return next(new AppError("Employee not found", 404));
    }

    // Save FCM token
    validatEmployee.fcmToken = token;
    await validatEmployee.save();

    console.log("FCM token saved:", validatEmployee.fcmToken);

    return res.status(200).json({
      success: true,
      message: "Token added successfully",
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const getTodayBirthdayEmployees = async (req, res) => {
  try {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");      // e.g., "10"
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // e.g., "07"

     // dob assumed format: "YYYY-MM-DD"
    const dobRegex = new RegExp(`-${month}-${day}$`); // Matches MM-DD at end
    const birthdayEmployees = await employeModel.find({
      dob: { $regex: dobRegex }
    });
    
    const  io=req.app.get("io");

      if(birthdayEmployees.length>0){
           birthdayEmployees.forEach(emp=>{
            const message=`🎉 Today is ${emp.name}'s birthday! 🎂`
             io.emit("birthday-notification",message);
           })
      }

    res.status(200).json({
      success: true,
      message:"Employees Birthday",
      data:birthdayEmployees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch birthday employees",
      error: error.message
    });
  }
};




export {
  add_employee,
  employee_update,
  all_employee,
  employee_Delete,
  registration_employee,
  employee_login,
  oneEmployee,
  employeeAlldetail,
  employee_profile,
  single_employee_allDetail,
  saveFcmToken,
  getTodayBirthdayEmployees
};
