import express from "express";
import AppError from "../util/appError.js";
import employeModel from "../models/employeeModel.js";
import employeeWorkModel from "../models/employee.work.information.model.js";
import { log } from "node:console";

// const work_Add = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const {
//       department,
//       shiftInformation,
//       reportingManger,
//       workLocation,
//       jobPosition,
//       workType,
//       salary,
//       company,
//       joiningDate,
//       tags,
//     } = req.body;

//     const checkworkData = await employeeWorkModel.find({ employeeId: id });
//     if (checkworkData.length > 0) {
//       return next(new AppError("Record already exists", 409));
//     }

//     const validateEmployee = await employeModel.findById(id);
//     if (!validateEmployee) {
//       return next(new AppError("Invalid Employee ID", 400));
//     }
//     const result = await employeeWorkModel.create({
//       employeeId: id,
//       department,
//       shiftInformation,
//       reportingManger,
//       workLocation,
//       jobPosition,
//       workType,
//       salary,
//       company,
//       joiningDate,
//       tags,
//     });

//     if (result) {
//       return res.status(200).json({ success: true, message: "Success", data: result });
//     }
//     return next(new AppError("Some Error Occurred", 400));
//   } catch (err) {
//     return next(new AppError(err.message, 500));
//   }
// };

const work_Add = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      department,
      shiftInformation ,
      employeeType,
      company,
      jobPosition,
      workType,
      reportingManager,
      workLocation,
      salary,
      joiningDate,
    } = req.body;

    const employee = await employeModel.findById(id);
    if (!employee) return next(new AppError("Invalid Employee ID", 400));

    const workData = await employeeWorkModel.findOneAndUpdate(
      { employeeId: id },
      {
        department,
        shiftInformation ,
        employeeType,
        company,
        jobPosition,
        workType,
        reportingManager,
        workLocation,
        salary,
        joiningDate,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await employeModel.findByIdAndUpdate(id, { workId: workData._id });

    return res.status(200).json({
      success: true,
      message: "success",
      data: workData,
    });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const worka_update = async (req, res, next) => {
  try {
    console.log(req.body)
    const { id } = req.params;
    const {
      department,
      shiftInformation,
      employeeType,
      company,
      jobPosition,
      workType,
      reportingManager,
      workLocation,
      salary,
      joiningDate,
    } = req.body;

    const result = await employeeWorkModel.findOneAndUpdate(
      { employeeId: id },
      {
        department,
        shiftInformation,
        employeeType,
        company,
        jobPosition,
        workType,
        reportingManager,
        workLocation,
        salary,
        joiningDate,
      },
      { new: true }
    );
    
    console.log("result",result);
    

    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "Update success", result });
    }

    return next(new AppError("Some Error Occurred", 400));
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const work_delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await employeeWorkModel.findByIdAndDelete(id);
    if (result) {
      return res.status(200).json({ success: true, message: "Work delete " });
    }
    return next(new AppError("Some Error occured", 400));
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const getWork = async (req, res, next) => {
  try {
    const { id } = req.params;
     console.log("abcd");
     
    const result = await employeeWorkModel.findOne({ employeeId: id });

    if (result) {
      return res.status(200).json({ success: true, data: result ,message:"success"});
    }
      return next(new AppError("Recod not found",404))
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const allData = async (req, res, next) => {
  try {
    const data = await employeeWorkModel
      .find({}, "workType department")
      .populate("employeeId", "name");
    if (data) {
      return res.status(200).json({ success: true, data ,message:"success"});
    } else {
      return next(new AppError("Data Not found", 400));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const Department  = async (req, res, next) => {
  try {
    const allEmployees = await employeeWorkModel.find();
    const departmentCounts = {};
    allEmployees.forEach((employee) => {
      const dept = employee.department || "Unknown"; 
      if (departmentCounts[dept]) {
        departmentCounts[dept]++;
      } else {
        departmentCounts[dept] = 1;
      }
    });

    // Optional: Convert object to array
    const result = Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count
    }));

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export { work_Add, worka_update, work_delete, getWork, allData,Department};
