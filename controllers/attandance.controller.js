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
import { create } from "domain";
import axios from 'axios'
import moment from "moment";

const ObjectId = mongoose.Types.ObjectId;

const key = process.env.JWT_SECRET;

//****if employee Registration  id comming then.... */

const getLocationFromCoordinates = async (latitude, longitude) => {
   
};

const attandanceLogin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    console.log(req.body);

    if (!latitude || !longitude) {
      return next(new AppError("Location in required", 400));
    }
    // const locationName = await getLocationFromCoordinates(latitude, longitude);
    // console.log("locationName", locationName);
    // return;

    const validEmployee = await employeModel.findById(id);
    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }

    const leaveData = await leaveModel.find({ employeeId: validEmployee._id });

    // Get current date and time in IST
    const requestedTime = new Date();
    const now1 = new Date(requestedTime.getTime() + 5.5 * 60 * 60 * 1000);
    // const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const now = new Date();

    const startOfDay = new Date(now1);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now1);
    endOfDay.setHours(23, 59, 59, 999);

    const nineAM = new Date(now1);
    nineAM.setHours(9, 0, 0, 0);

    const eleAM = new Date(now1);
    tenAM.setHours(11, 0, 0, 0);

    const threePM = new Date(now1);
    threePM.setHours(15, 0, 0, 0);
    const twelvePM = new Date(now1);
    threePM.setHours(17, 0, 0, 0);;

    console.log("threePM", threePM);
    console.log("now", now);
    console.log("nineAM", nineAM);

    if (now1 < nineAM) {
      return next(new AppError("You are checking in too early", 400));
    }

    if (now1 > threePM) {
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

    if (now1 >= nineAM && now1 <= eleAM) {
      isFullDay = true;
    }
    else if (now1 > eleAM && now1 <= threePM) {
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
          // location: {
          //   type: "Point",
          //   coordinates: [longitude, latitude],
          //   name: locationName
          // },
        },
      },
      { new: true, upsert: true }
    );

    // Notification
    const title = "Check-In";
    const message = `${validEmployee.name} has successfully checked in.`;
    const fromId = validEmployee._id;
    const io = req.app.get("io");
    const url = "attendance/logs"
    await createNotification({ title, message, url }, io);

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
    console.log("jo id aa rahih", id);
    // return;
    const validEmployee = await employeModel.findById(id);

    if (!validEmployee) {
      return next(new AppError("Employee is Not Valid", 400));
    }

    // Get current IST time
    //   const requestedTime= new Date();
    // const now = new Date(requestedTime.getTime() + 5.5 * 60 * 60 * 1000);

    const now = new Date(new Date().toLocaleString());

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

    //ot time calculate
    const standardMs = 9 * 60 * 60 * 1000;

    if (diffMs > standardMs) {
      const otMs = diffMs - standardMs;
      const otHrs = Math.floor(otMs / (1000 * 60 * 60));
      const otMins = Math.floor((otMs % (1000 * 60 * 60)) / (1000 * 60));
      const otSecs = Math.floor((otMs % (1000 * 60)) / 1000);
      todayAttendance.otTime = `${otHrs}h ${otMins}m ${otSecs}s`; // 👈
    } else {
      todayAttendance.otTime = `0h 0m 0s`; // 👈 no overtime
    }
    await todayAttendance.save();

    // Notification
    const title = "Check-Out";
    const message = `${validEmployee.name} has successfully checked out.`;
    const fromId = validEmployee._id;
    const io = req.app.get("io");
    const url = "attendance/logs";

    await createNotification({ title, message, url }, io);
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
    const { startDate, endDate } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end date
    const attendanceData = await AttandanceModel.find({
      createdAt: { $gte: start, $lte: end }
    }).populate("employeeId", "name email mobile");

    const data = await AttandanceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
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
      { $unwind: "$employee" },
      {
        $addFields: {
          employeeStatus: {
            $cond: [
              { $eq: ["$leave", true] }, "L",  // Leave
              {
                $cond: [
                  { $eq: ["$isFullDay", true] }, "P",  // Present Full Day
                  {
                    $cond: [
                      { $eq: ["$isHalfDay", true] }, "HL",  // Half Leave
                      {
                        $cond: [
                          { $eq: ["$status", "WFH"] }, "WFH", // Work From Home
                          {
                            $cond: [
                              { $eq: ["$status", "WO"] }, "WO", // Weekly Off
                              {
                                $cond: [
                                  { $eq: ["$status", "H"] }, "H", // Holiday
                                  "A" // Default: Absent
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }
        }
      },
      {
        $project: {
          employeeId: 1,
          mpId: "$empId",
          date: 1,
          checkIn: "$loginTime",
          checkOutTime: "$logoutTime",
          workDuration: "$workingHours",
          status: "$employeeStatus",
          leave: 1, // <-- Added leave boolean field
          leaveReason: "$reasonForLeave", // Optional rename
          location: "$location",
          locationOut: 1,
          ipAddress: 1,
          deviceDetails: 1,
          remark: 1,
          createdAt: 1,
          updatedAt: 1,
          "employee.name": 1,
          "employee.email": 1,
          "employee.mobile": 1,
          "employee.empId": 1,
          "projectName": "$projectName" // optional
        },
      },
    ]);
    return res.status(200).json({
      message: "success",
      success: true,
      count: data.length,
      // attendanceData: attendanceData,
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

const individual_attandance_detai = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    console.log(startDate);
    console.log(endDate);

    if (startDate || endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const name = await employeModel.findById(id).select('name');
      const attendanceRecords = await AttandanceModel.find({
        employeeId: id,
        createdAt: {
          $gte: start,
          $lte: end
        }
      }).sort({ createdAt: -1 });

      console.log("attendanceRecords", attendanceRecords);
      // return;

      const attendance = attendanceRecords.map(record => {
        const date = new Date(record.createdAt);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return {
          ...record._doc,
          createdAt: `${day}-${month}-${year}`
        };
      });

      const data = {
        name,
        attendance
      }
      return res.status(200).json({ success: true, data: data })
    }

    const name = await employeModel.findById(id).select('name');
    const attendance = await AttandanceModel.find({ employeeId: id }).sort({ createdAt: -1 });
    const data = {
      name,
      attendance
    }
    return res.status(200).json({ success: true, data: data })

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
}

const todayCheckData = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find employee by registrationId
    const employee = await employeModel.findOne({ registrationId: id });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Get today's date range: from 00:00 to 23:59:59
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find today's attendance for that employee
    const todayAttendance = await AttandanceModel.findOne({
      employeeId: employee._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!todayAttendance) {
      return res.status(200).json({ success: true, message: "No attendance record for today" });
    }

    return res.status(200).json({
      success: true,
      data: todayAttendance
    });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const calendar_view = async (req, res, next) => {
  try {
    const { month } = req.query; // format: '2025-06'
    if (!month) {
      return next(new AppError("Month is required in YYYY-MM format", 400));
    }

    const startDate = moment(month).startOf("month").toDate();
    const endDate = moment(month).endOf("month").toDate();
    console.log("startDate", startDate);
    console.log("endDate", endDate);
    // return;

    const employees = await employeModel.find();

    const allAttendance = await AttandanceModel.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const result = employees.map((emp) => {
      const attendanceMap = {};

      // Loop all days of the month
      for (let day = moment(startDate); day <= moment(endDate); day.add(1, 'days')) {
        const currentDate = day.format("YYYY-MM-DD");

        const att = allAttendance.find(
          (a) =>
            a.employeeId.toString() === emp._id.toString() &&
            moment(a.date).format("YYYY-MM-DD") === currentDate
        );

        if (att) {
          if (att.leave) attendanceMap[currentDate] = "L";
          else if (att.status === "present" || att.isFullDay) attendanceMap[currentDate] = "P";
          else if (att.isHalfDay) attendanceMap[currentDate] = "HD";
          else if (att.status === "wfh") attendanceMap[currentDate] = "WFH";
          // else if (att.status === "WO") attendanceMap[currentDate] = "WO";
          // else if (att.status === "H") attendanceMap[currentDate] = "H";
          else attendanceMap[currentDate] = "A";
        } else {
          attendanceMap[currentDate] = "NA"; // Not Available
        }
      }

      return {
        employeeId: emp._id,
        name: emp.name,
        email: emp.email,
        mobile: emp.mobile,
        attendance: attendanceMap,
      };
    });

    res.status(200).json({
      success: true,
      message: "Calendar view generated successfully",
      data: result,
    });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const getWeeklyAttendanceChart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const date = moment().startOf("week").add(i, "days");
      const start = date.startOf("day").toDate();
      const end = date.endOf("day").toDate();

      const attendance = await AttandanceModel.findOne({
        employeeId: id,
        createdAt: { $gte: start, $lte: end }
      });

      console.log(attendance);
      

      const isPresent =
        attendance &&
        attendance.status === "present" &&
        (attendance.isFullDay || attendance.isHalfDay);

      weeklyData.push({
        name: date.format("ddd"), // Sun, Mon, etc.
        present: isPresent ? 1 : 0,
        absent: isPresent ? 0 : 1
      });
    }

    res.status(200).json({
      success: true,
      message: "Weekly Attendance Fetched",
      data: weeklyData
    });

  } catch (err) {
    next(new AppError(err.message, 500));
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
  individual_attandance_detai,
  todayCheckData,
  calendar_view,
  getWeeklyAttendanceChart
};
