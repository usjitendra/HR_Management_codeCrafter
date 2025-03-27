import { log } from "node:console";
import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";
import AttandanceModel from "../models/attandance.model.js";

const attandanceLogin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validEmployee = await employeModel.findById(id);
    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }
    const now = new Date();
    const allEmployeeAttandance = await AttandanceModel.find({
      employeeId: validEmployee._id,
    });
    allEmployeeAttandance.map((e) => {
      if (e.status == "absent") {
        return next(new AppError("Employee have absent", 400));
      }
    });
    const filterEmployee = allEmployeeAttandance.find((val) => {
      const loginDate = new Date(val.loginTime).toLocaleDateString(); // India Format: DD/MM/YYYY
      const today = now.toLocaleDateString();
      return loginDate === today;
    });

    if (filterEmployee && filterEmployee.status == "absent") {
      return next(new AppError("Employee have absent", 400));
    }

    if (filterEmployee && filterEmployee.loginTime) {
      return next(new AppError("Already Check in", 400));
    }
    if (allEmployeeAttandance && allEmployeeAttandance.loginTime) {
      return next(new AppError("Already Login"));
    }
    const addEmployee = await AttandanceModel.create({
      employeeId: validEmployee._id,
      loginTime: now,
      date: now,
      status: "present",
      //  date:date.toLocaleDateString()
    });

    res.status(200).json({
      success: true,
      message: "Attandance Mark Succesfully",
      data: addEmployee,
    });
  } catch (error) {
    console.log(error);

    return next(new AppError(error.message, 500));
  }
};

const attandanceLogout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validEmployee = await employeModel.findById(id);

    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }
    const now = new Date();

    const allEmployeeAttandance = await AttandanceModel.find({
      employeeId: validEmployee._id,
    });
    allEmployeeAttandance.map((e) => {
      if (e.status == "absent") {
        return next(new AppError("Employee have absent", 400));
      }
    });
    const filterEmployee = allEmployeeAttandance.find((val) => {
      const loginDate = new Date(val.loginTime).toLocaleDateString(); // India Format: DD/MM/YYYY
      const today = now.toLocaleDateString();
      return loginDate === today;
    });

    if (filterEmployee && filterEmployee.status === "absent") {
      return next(new AppError("Employee is Absent", 400));
    }

    if (filterEmployee && !filterEmployee.loginTime) {
      return next(new AppError("Employee is Not Login", 400));
    }

    if (filterEmployee && filterEmployee.logoutTime) {
      return next(new AppError("Employee is Not Logout", 400));
    }
    filterEmployee.logoutTime = now;

    const data = await filterEmployee.save();

    res.status(200).json({
      success: true,
      message: "Logout Succesfully",
      data,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const absent = async (req, res, next) => {
  const { status } = req.body;
  const id = req.params.id;
  try {
    const validEmployee = await employeModel.findById(id);
    if (!validEmployee) {
      return next(new AppError("Employee is Not valid"));
    }
    const isLogin = await AttandanceModel.findOne({
      employeeId: id,
    });
    if (isLogin) {
      return next(new AppError("Employe have all ready login"));
    }

    const result = await AttandanceModel.create({
      employeeId: id,
      status: status,
    });
    if (result) {
      return res
        .status(200)
        .json({ status: true, message: "Absent Successfull" });
    }
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

export { attandanceLogin, attandanceLogout, absent };
