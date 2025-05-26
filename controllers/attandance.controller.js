import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";
import AttandanceModel from "../models/attandance.model.js";
import employee from "../routes/employee.routes.js";
import { start } from "repl";
import { allData } from "./employee.work.controller.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import leaveModel from "../models/leave.model.js";
import { log } from "console";
import { createNotification } from "./notification.controller.js";
const ObjectId = mongoose.Types.ObjectId;

const key = process.env.JWT_SECRET;
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
    console.log("jo id aa rahih",id);
    
    const validEmployee = await employeModel.findOne({ registrationId: id });
    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }

    const leaveData = await leaveModel.find({ employeeId: validEmployee._id });

    // Get current date and time in IST
    // const now = new Date(requestedTime.getTime() + 5.5 * 60 * 60 * 1000);
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const nineAM = new Date(now);
    nineAM.setHours(9, 0, 0, 0);

    const tenAM = new Date(now);
    tenAM.setHours(10, 0, 0, 0);

    const threePM = new Date(now);
    threePM.setHours(15, 0, 0, 0);
    const twelvePM = new Date(now);
    threePM.setHours(12, 0, 0, 0);

    // if (now < nineAM) {
      // return next(new AppError("You are checking in too early", 400));
    // }
         
    if (now > threePM) {
      return next(new AppError("Check-in time is over for today", 400));
    }

    const todayLeave = leaveData.some((leave) => {
      const leaveStartDate = new Date(leave.startDate);
      const leaveEndDate = new Date(leave.endDate);

      leaveStartDate.setHours(0, 0, 0, 0);
      leaveEndDate.setHours(23, 59, 59, 999);

      return (
        leave.status === "Approved" &&
        now >= leaveStartDate &&
        now <= leaveEndDate
      );
    });

    if (todayLeave) {
      return next(new AppError("You have an approved leave today", 400));
    }

    const todayAttendance = await AttandanceModel.findOne({
      employeeId: validEmployee._id,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (todayAttendance && todayAttendance.loginTime) {
      return next(new AppError("Already Checked In Today", 400));
    }

    let isFullDay = false;
    let isHalfDay = false;

    if (now >= nineAM && now <= tenAM) {
      isFullDay = true;
    } else if (now > tenAM && now <= twelvePM) {
      isHalfDay = true;
    }

    const addEmployee = await AttandanceModel.findOneAndUpdate(
      {
        employeeId: validEmployee._id,
        date: { $gte: startOfDay, $lt: endOfDay },
      },
      {
        $set: {
          employeeId: validEmployee._id,
          loginTime: now,
          date: now,
          status: "present",
          isFullDay,
          isHalfDay,
          checkIn: true,
        },
      },
      { new: true, upsert: true }
    );

    // Notification
    const title = "CheckIn";
    const message = `${validEmployee.name} has checked in`;
    const fromId = validEmployee._id;
    const io = req.app.get("io");
    await createNotification({ fromId, title, message }, io);
    io.emit("new-message", `${validEmployee.name} has checked in`);

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
    console.log("jo id aa rahih",id);
    
      // return;
    const validEmployee = await employeModel.findOne({ registrationId: id});

    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }

    // Get current IST time
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    // Get start and end of today in IST
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

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
    todayAttendance.logoutTime = now;

    const login = new Date(todayAttendance.loginTime);
    const logout = todayAttendance.logoutTime;

    const diffMs = Math.abs(logout - login); // always positive
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    const workingTime = `${diffHrs}h ${diffMins}m ${diffSecs}s`;

    todayAttendance.workingHours = workingTime;
    await todayAttendance.save();

    // Notification
    const title = "Check Out";
    const message = `${validEmployee.name} has checked out`;
    const fromId = validEmployee._id;
    const io = req.app.get("io");

    await createNotification({ fromId, title, message }, io);
    io.emit("new-message", message);

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
        .json({ success: true, message: "Absent Successfull" });
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
      return next(new AppError("", 400));
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
      return res.status(200).json({ success: true, result, message: "success" });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const testApi = async (req, res, next) => {
  try {
    console.log("jitendra");

    return next(new AppError("data not fond", 500));
  } catch (err) { }
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

    const chart = allDays.map((day) => {
      const found = AttendanceData.find(
        (entry) => new Date(entry.date).toDateString() === day.toDateString()
      );

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

const getMonthalyDetail = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    if (!token) {
      // return;
      return next(new AppError("Unauthorized: No token provided", 401));
    }

    const decoded = jwt.verify(token, key);
    if (!decoded) {
      return next(new AppError("Token expired", 401));
    }

    const data = await employeModel.find({ registrationId: decoded.id });

    if (!data || data.length === 0) {
      return;
      // return next(new AppError("success", 404));
    }

    const attandanceData = await AttandanceModel.find({
      employeeId: data[0]._id,
    });

     console.log(attandanceData);
     
    const today = new Date().toLocaleDateString();
    const todayData = attandanceData.find((record) => {
      const loginDate = new Date(record.createdAt).toLocaleDateString();
      return loginDate === today;
    });

    const allData = {
      todayData: todayData,
      attandanceData: attandanceData,
      employeedata: data,
    };

    return res.status(200).json({
      success: true,
      message: "Success",
      data: allData,
    });
  } catch (err) {
    return next(new AppError(err.message || "", 401));
  }
};

const attendanceFilter = async (req, res, next) => {
  try {
    const { range } = req.query;
    // console.log("Range:", range);

    let startDate, endDate;
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    switch (range) {
      case "1":
        startDate = today;
        endDate = endOfToday;
        break;
      case "7days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        endDate = endOfToday;
        break;
      case "3months":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        endDate = endOfToday;
        break;
      case "6months":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = endOfToday;
        break;
      case "all":
      default:
        startDate = new Date("2000-01-01");
        endDate = endOfToday;
    }

    const data = await AttandanceModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $unwind: "$employee",
      },
      {
        $project: {
          employeeId: 1,
          date: 1,
          loginTime: 1,
          logoutTime: 1,
          locationIn: 1,
          locationOut: 1,
          totalWorkingHour: 1,
          isHalfDay: 1,
          isFullDay: 1,
          status: 1,
          reasonForLeave: 1,
          ipAddress: 1,
          deviceDetails: 1,
          isLate: 1,
          remark: 1,
          workingHours: 1,
          checkIn: 1,
          leave: 1,
          createdAt: 1,
          updatedAt: 1,
          "employee.name": 1,
          "employee.email": 1,
          "employee.mobile": 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "success",
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const monthelydetail = async (req, res, next) => {
  try {
    const { month, year, employeeId } = req.body;
    console.log(month);
    console.log("id+++", employeeId);
    console.log(year);

    const result = await AttandanceModel.aggregate([
      {
        $match: {
          employeeId: new ObjectId(employeeId) // ✅ correct match
        }
      },
      {
        $addFields: { month: { $month: "$createdAt" } },
      },
      {
        $addFields: { year: { $year: "$createdAt" } },
      },
      { $match: { month: month * 1, year: year * 1 } },
      {
        $project: {
          month: 0,
          year: 0
        }
      }
    ]);

    if (result.length === 0) {
      return next(new AppError("Data not found", 404))
    } else {
      return res.status(200).json({ success: true, data: result, message: "Monthly attendance fetched successfully" })
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export {
  attandanceLogin,
  attandanceLogout,
  absent,
  employee_attendence,
  all_employee_aatendance,
  testApi,
  getChartAttendance,
  getMonthalyDetail,
  attendanceFilter,
  monthelydetail,
};
