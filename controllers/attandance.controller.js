import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";
import AttandanceModel from "../models/attandance.model.js";
import employee from "../routes/employee.routes.js";
import { start } from "repl";
import { allData } from "./employee.work.controller.js";
import { log } from "console";

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
      //date:date.toLocaleDateString()
    });

    res.status(200).json({
      success: true,
      message: "Attandance Mark Succesfully",
      addEmployee,
    });
  } catch (error) {

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

    // if (filterEmployee && filterEmployee.status === "absent") {
    //   return next(new AppError("Employee is Absent", 400));
    // }

    // if (filterEmployee && !filterEmployee.loginTime) {
    //   return next(new AppError("Employee is Not Login", 400));
    // }

    // if (filterEmployee && filterEmployee.logoutTime) {
    //   return next(new AppError("Employee is Already logged out", 400));
    // }
    filterEmployee.logoutTime = now;  
    const login = filterEmployee.loginTime;
    const logout = filterEmployee.logoutTime;
    const diffMs = logout - login;
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);              
    const workingTime=`${diffHrs}h ${diffMins}m ${diffSecs}s`;
    filterEmployee.workingHours=workingTime
       await filterEmployee.save()
    res.status(200).json({
      success: true,
      message: "Logout Succesfully",
      filterEmployee,
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

const employee_attendence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AttandanceModel.findOne({ employeeId: id }).populate({
      path: "employeeId",
      select: "name email mobile department position",
    });
      if(result){
         const data={
            result
         }
          return res.status(200).json({success:true,message:"Employee show Detail",data})
      }else{
        return next(new AppError("Employee not found",400));

      }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const all_employee_aatendance=async(req,res,next)=>{
    try{
           const result=await AttandanceModel.find().populate({
            path:"employeeId",
            select:"name email mobile department position"
           })
           if(!result){
            return next(new AppError("Employee not found",400));
           }else{
             return res.status(200).json({success:true,result});
           }
           
    }catch(err){
        return next(new AppError(err.message,500));
    }
}


const testApi=async(req,res,next)=>{
      try{  
           console.log("jitendra");

           return next(new AppError("data not fond",500));
                
      }catch(err){

      }
}

const getChartAttendance = async (req, res, next) => {
  try {
    const { id, month } = req.query;
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const allDays = [];
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      allDays.push(new Date(d)); // clone to prevent mutation
    }

    const AttendanceData = await AttandanceModel.find({
      employeeId: id,
      date: { $gte: startDate, $lt: endDate }, // ✅ month-wise filter
    });

      // console.log(AttendanceData);
      // return;
      
    const chart = allDays.map(day => {
      const found = AttendanceData.find(entry =>
        new Date(entry.date).toDateString() === day.toDateString()
      );
         console.log("form",found);
         
      return {
        date: day.toISOString().split("T")[0],
        status: found ? found : "Not Available",
      };
    });

    res.status(200).json({ success: true, chart });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};



export { attandanceLogin, attandanceLogout, absent, employee_attendence,all_employee_aatendance,testApi,getChartAttendance};
