import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";
import AttandanceModel from "../models/attandance.model.js";
import employee from "../routes/employee.routes.js";
import { start } from "repl";
import { allData } from "./employee.work.controller.js";
import mongoose from "mongoose";

//***if employee id commimh then  */

// const attandanceLogin = async (req, res, next) => {
//   try {
//     const { id } = req.params;
    
//     const validEmployee = await employeModel.findById(id);
//     if (!validEmployee) {
//       return next(new AppError("Employee is Not Valid", 400));
//     }
//     const now = new Date();
//     const today = new Date();
//     const nineAM = new Date(today.setHours(9, 0, 0, 0));
//     const tenAM = new Date(today.setHours(10, 0, 0, 0));
//     const twelveAM = new Date(today.setHours(12, 0, 0, 0));

//     if (now < nineAM) {
//       return next(
//         new AppError("Too early to Check In. Try after 9:00 AM", 400)
//       );
//     }
//     if (now > twelveAM) {
//       return next(new AppError("Maushi ka ghar bana liye ho ka", 500));
//     }
//     const allEmployeeAttandance = await AttandanceModel.find({
//       employeeId: validEmployee._id,
//     });
//     allEmployeeAttandance.map((e) => {
//       if (e.status == "absent") {
//         return next(new AppError("Employee have absent", 400));
//       }
//     });
//     const filterEmployee = allEmployeeAttandance.find((val) => {
//       const loginDate = new Date(val.loginTime).toLocaleDateString(); // India Format: DD/MM/YYYY
//       const today = now.toLocaleDateString();
//       return loginDate === today;
//     });

//     if (filterEmployee && filterEmployee.status == "absent") {
//       return next(new AppError("Employee have absent", 400));
//     }

//     if (filterEmployee && filterEmployee.loginTime) {
//       return next(new AppError("Already Check in", 400));
//     }
//     if (allEmployeeAttandance && allEmployeeAttandance.loginTime) {
//       return next(new AppError("Already Login"));
//     }

//     let isFullDay = false;
//     let isHalfDay = false;
//     if (now >= nineAM && now <= tenAM) {
//       isFullDay = true;
//     } else if (now > tenAM) {
//       isHalfDay = true;
//     }

//     const addEmployee = await AttandanceModel.findOneAndUpdate(
//       { employeeId: id },
//       {
//         employeeId: validEmployee._id,
//         loginTime: now,
//         date: now,
//         status: "present",
//         isFullDay,
//         isHalfDay,
//       },
//       { new: true, upsert: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Attandance Mark Succesfully",
//       addEmployee,
//     });
//   } catch (error) {
//     return next(new AppError(error.message, 500));
//   }
// };



//****if employee Registration  id comming then.... */

const attandanceLogin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get employee by registrationId (return single object, not array)
    const validEmployee = await employeModel.findOne({ registrationId: id });

    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }

    const now = new Date();
    const today = new Date();
    const nineAM = new Date(today.setHours(9, 0, 0, 0));
    const tenAM = new Date(today.setHours(10, 0, 0, 0));
    const twelveAM = new Date(today.setHours(12, 0, 0, 0));

    // Time Check
    // if (now < nineAM) {
    //   return next(new AppError("Too early to Check In. Try after 9:00 AM", 400));
    // }
    // if (now > twelveAM) {
    //   return next(new AppError("Too late to Check In", 400));
    // }

    // Check attendance for today
    const todayAttendance = await AttandanceModel.findOne({
      employeeId: validEmployee._id,
      date: {
        $gte: new Date(now.setHours(0, 0, 0, 0)),
        $lt: new Date(now.setHours(23, 59, 59, 999))
      }
    });

    if (todayAttendance) {
      // return next(new AppError("Already Checked In Today", 400));
      return res.status(400).json({message:"Already Checked In Today",todayAttendance})
    }

    let isFullDay = false;
    let isHalfDay = false;

    if (now >= nineAM && now <= tenAM) {
      isFullDay = true;
    } else if (now > tenAM && now <= twelveAM) {
      isHalfDay = true;
    }

    const addEmployee = await AttandanceModel.findOneAndUpdate(
      { employeeId: validEmployee._id, date: now },
      {
        employeeId: validEmployee._id,
        loginTime: now,
        date: now,
        status: "present",
        isFullDay,
        isHalfDay,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Attendance Marked Successfully",
      addEmployee,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



// const attandanceLogout = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const validEmployee = await employeModel.findById(id);
//     if (!validEmployee) {
//       return next(new AppError("Employee is Not Valid", 400));
//     }
//     const now = new Date();

//     const allEmployeeAttandance = await AttandanceModel.find({
//       employeeId: validEmployee._id,
//     });
//     allEmployeeAttandance.map((e) => {
//       if (e.status == "absent") {
//         return next(new AppError("Employee have absent", 400));
//       }
//     });
//     const filterEmployee = allEmployeeAttandance.find((val) => {
//       const loginDate = new Date(val.loginTime).toLocaleDateString(); // India Format: DD/MM/YYYY
//       const today = now.toLocaleDateString();
//       return loginDate === today;
//     });

//     if (filterEmployee && filterEmployee.status === "absent") {
//       return next(new AppError("Employee is Absent", 400));
//     }

//     if (filterEmployee && !filterEmployee.loginTime) {
//       return next(new AppError("Employee is Not Login", 400));
//     }

//     if (filterEmployee && filterEmployee.logoutTime) {
//       return next(new AppError("Employee is Already logged out", 400));
//     }
//     filterEmployee.logoutTime = now;
//     const login = filterEmployee.loginTime;
//     const logout = filterEmployee.logoutTime;
//     const diffMs = logout - login;

//     const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//     const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
//     const workingTime = `${diffHrs}h ${diffMins}m ${diffSecs}s`;
//     filterEmployee.workingHours = workingTime;
//     await filterEmployee.save();
//     res.status(200).json({
//       success: true,
//       message: "Logout Succesfully",
//       filterEmployee,
//     });
//   } catch (error) {
//     return next(new AppError(error.message, 500));
//   }
// };




//***employee Registration id aa rahi h tb___ */


const attandanceLogout = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use findOne for single object
    const validEmployee = await employeModel.findOne({ registrationId: id });

    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }

    const now = new Date();

    // Find today's attendance entry
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const todayAttendance = await AttandanceModel.findOne({
      employeeId: validEmployee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!todayAttendance) {
      return next(new AppError("No attendance record found for today", 400));
    }

    if (todayAttendance.status === "absent") {
      return next(new AppError("Employee is Absent", 400));
    }

    if (!todayAttendance.loginTime) {
      return next(new AppError("Employee is Not Logged In", 400));
    }

    if (todayAttendance.logoutTime) {
      return next(new AppError("Employee is Already Logged Out", 400));
    }

    // Set logout time and calculate working hours
    todayAttendance.logoutTime = new Date();
    const login = new Date(todayAttendance.loginTime);
    const logout = todayAttendance.logoutTime;

    const diffMs = logout - login;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    const workingTime = `${diffHrs}h ${diffMins}m ${diffSecs}s`;

    todayAttendance.workingHours = workingTime;
    await todayAttendance.save();

    res.status(200).json({
      success: true,
      message: "Logout Successfully",
      data: todayAttendance,
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
    if (result) {
      const data = {
        result,
      };
      return res
        .status(200)
        .json({ success: true, message: "Employee show Detail", data });
    } else {
      return next(new AppError("Employee not found", 400));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const all_employee_aatendance = async (req, res, next) => {
  try {
    const result = await AttandanceModel.find().populate({
      path: "employeeId",
      select: "name email mobile department position",
    });
    if (!result) {
      return next(new AppError("Employee not found", 400));
    } else {
      return res.status(200).json({ success: true, result });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const testApi = async (req, res, next) => {
  try {
    console.log("jitendra");

    return next(new AppError("data not fond", 500));
  } catch (err) {}
};

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

    const chart = allDays.map((day) => {
      const found = AttendanceData.find(
        (entry) => new Date(entry.date).toDateString() === day.toDateString()
      );
      console.log("form", found);

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

const getMonthalyDetail=async(req,res,next)=>{
     try{

     }catch(err){
      return next(new AppError())
     }
}

export {
  attandanceLogin,
  attandanceLogout,
  absent,
  employee_attendence,
  all_employee_aatendance,
  testApi,
  getChartAttendance,
  getMonthalyDetail
};
