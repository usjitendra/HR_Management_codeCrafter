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
      shiftInformation,
      reportingManger,
      workLocation,
      jobPosition,
      workType,
      salary,
      company,
      joiningDate,
      tags,
    } = req.body;

    const validateEmployee = await employeModel.findById(id);
    if (!validateEmployee) {
      return next(new AppError("Invalid Employee ID", 400));
    }

    const existingWorkData = await employeeWorkModel.findOne({ employeeId: id });

    if (existingWorkData) {
      // 👇 Update if already exists
      const updated = await employeeWorkModel.findOneAndUpdate(
        { employeeId: id },
        {
          department,
          shiftInformation,
          reportingManger,
          workLocation,
          jobPosition,
          workType,
          salary,
          company,
          joiningDate,
          tags,
        },
        { new: true }
      );
      await employeModel.findByIdAndUpdate(id,{workId:updated._id})
      return res.status(200).json({ success: true, message: "Work Info Updated", data: updated });
    }

    // 👇 Create if not found
    const created = await employeeWorkModel.create({
      employeeId: id,
      department,
      shiftInformation,
      reportingManger,
      workLocation,
      jobPosition,
      workType,
      salary,
      company,
      joiningDate,
      tags,
    });
      await employeModel.findByIdAndUpdate(id,{workId:created._id})
    return res.status(200).json({ success: true, message: "Work Info Added", data: created });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const worka_update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
          department,
          shiftInformation,
          reportingManger,
          workLocation,
          jobPosition,
          workType,
          salary,
          company,
          joiningDate,
          tags,
        } = req.body;
        const checkworkData=await employeeWorkModel.find({employeeId:id})
        if(checkworkData){
            return next(new AppError("Record have all ready exist",4004))
        }
        const result =  employeeWorkModel.findByIdAndUpdate(id,{
          employeeId: id,
          department,
          shiftInformation,
          reportingManger,
          workLocation,
          jobPosition,
          workType,
          salary,
          company,
          joiningDate,
          tags,
          $inc: { __v: 1 },
        },{new:true});
    
        if(result){
            return res.status(200).json({success:true,message:"Update success",result})
        }
        return next(new AppError("Some Error Accured",400));
      } catch (err) {
        return next(new AppError(err.message, 500));
      }
};

const work_delete = async (req, res, next) => {
  try {
    const{id}=req.params;
    const result=await employeeWorkModel.findByIdAndDelete(id);
    if(result){
        return res.status(200).json({success:true,message:"Work delete "});
    }
        return next(new AppError("Some Error occured",400));
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const getWork = async (req, res, next) => {
  try {
        const{id}=req.params;
        const result=await employeeWorkModel.findOne({employeeId:id})
        
        if(result){
            return res.status(200).json({success:true,data:result})
        }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const allData = async (req, res, next) => {
  try {
         const data=await employeeWorkModel.find({},'workType department').populate("employeeId","name")
         if(data){
            return res.status(200).json({success:true,data})
         }else{
          return next(new AppError("Data Not found",400))
         }
        
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export { work_Add,worka_update,work_delete,getWork,allData };
