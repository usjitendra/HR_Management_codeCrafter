import cron from "node-cron";
import mongoose from "mongoose";
import EmployeeModel from "../models/employeeModel.js";
import AttendanceModel from "../models/attandance.model.js";

const cronJobAttendence = async () => {
  console.log("⏰ Running daily attendance auto-marking...");
  //    return;
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const allEmployees = await EmployeeModel.find();
    const todayAttendance = await AttendanceModel.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const markedIds = todayAttendance.map((a) => a.employeeId.toString());

    const unmarkedEmployees = allEmployees.filter(
      (emp) => !markedIds.includes(emp._id.toString())
    );

    const absentEntries = unmarkedEmployees.map((emp) => ({
      employeeId: emp._id,
      isHalfDay: false,
      isFullDay: false,
      checkIn:false
    }));

    if (absentEntries.length > 0) {
      await AttendanceModel.insertMany(absentEntries);
      console.log(`✅ Marked ${absentEntries.length} employees as absent`);
    } else {
      console.log("✨ All employees have attendance marked for today.");
    }
  } catch (error) {
    console.error("❌ Error in auto-marking attendance:", error);
  }
};

cron.schedule("0  0 1 * * *", async () => {
  console.log("⏰ Running daily attendance auto-marking...");
  //    return;
  cronJobAttendence();
});

cronJobAttendence();


