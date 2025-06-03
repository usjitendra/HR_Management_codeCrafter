import AppError from "../util/appError.js";
import employeeBankModel from "../models/employee.bank.model.js";
import employeModel from "../models/employeeModel.js";
import AttandanceModel from "../models/attandance.model.js";
import employeeWorkModel from "../models/employee.work.information.model.js";

const viewSallery_slipe = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Get all employees
    const allEmployees = await employeModel.find();

    // 2. Loop through each employee to gather salary + attendance
    const result = await Promise.all(
      allEmployees.map(async (employee) => {
        // Get salary from bank model
        const bankData = await employeeWorkModel.findOne({ employeeId: employee._id });
        const salary = bankData?.salary || "N/A";

        // Get attendance this month
        const attendanceRecords = await AttandanceModel.find({
          employeeId: employee._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const presentDays = attendanceRecords.filter((rec) => rec.status === "present").length;
        const absentDays = attendanceRecords.filter((rec) => rec.status === "absent").length;
        const oneday_salary=salary/30
        console.log("oneday_salary",oneday_salary);
        const estimate_salary=oneday_salary*presentDays
        console.log("estimate_salary",estimate_salary);
        return {
          employeeName: employee.name,
          email: employee.email,
          salary,
          presentDays,
          estimate_salary,
          absentDays:attendanceRecords.length-presentDays,
          totalWorkingDays: attendanceRecords.length,
          month: now.toLocaleString("default", { month: "long" }),
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "All salary slips fetched successfully",
      count: result.length,
      data: result,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export { viewSallery_slipe };
