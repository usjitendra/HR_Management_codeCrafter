import AppError from "../util/appError.js";
import employeeBankModel from "../models/employee.bank.model.js";
import employeModel from "../models/employeeModel.js";
import AttandanceModel from "../models/attandance.model.js";
import employeeWorkModel from "../models/employee.work.information.model.js";

// const viewSallery_slipe = async (req, res, next) => {
//   try {
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

//     // 1. Get all employees
//     const allEmployees = await employeModel.find();

//     // 2. Loop through each employee to gather salary + attendance
//     const result = await Promise.all(
//       allEmployees.map(async (employee) => {
//         // Get salary from bank model
//         const bankData = await employeeWorkModel.findOne({ employeeId: employee._id });
//         const salary = bankData?.salary || "N/A";

//         // Get attendance this month
//         const attendanceRecords = await AttandanceModel.find({
//           employeeId: employee._id,
//           date: { $gte: startOfMonth, $lte: endOfMonth },
//         });

//         const presentDays = attendanceRecords.filter((rec) => rec.status === "present").length;
//         const absentDays = attendanceRecords.filter((rec) => rec.status === "absent").length;
//         const oneday_salary=salary/30
//         const estimate_salary=oneday_salary*presentDays
//         return {
//           employeeName: employee.name,
//           email: employee.email,
//           salary,
//           presentDays,
//           estimate_salary,
//           absentDays:attendanceRecords.length-presentDays,
//           totalWorkingDays: attendanceRecords.length,
//           month: now.toLocaleString("default", { month: "long" }),
//         };
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       message: "All salary slips fetched successfully",
//       count: result.length,
//       data: result,
//     });
//   } catch (err) {
//     return next(new AppError(err.message, 500));
//   }
// };


const viewSallery_slipe = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

      console.log("startDate",startDate);
      console.log("endDate",endDate);
    //   return
    // Use provided dates or fallback to current month
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Get all employees
    const allEmployees = await employeModel.find();

    // 2. Process salary and attendance
    const result = await Promise.all(
      allEmployees.map(async (employee) => {
        const bankData = await employeeWorkModel.findOne({ employeeId: employee._id });
        const salary = bankData?.salary || "N/A";

        const attendanceRecords = await AttandanceModel.find({
          employeeId: employee._id,
          date: { $gte: start, $lte: end },
        });

        const presentDays = attendanceRecords.filter((rec) => rec.status === "present").length;
        const totalDays = attendanceRecords.length;
        const oneday_salary = salary !== "N/A" ? salary / 30 : 0;
        const estimate_salary = oneday_salary * presentDays;

        return {
          employeeName: employee.name,
          email: employee.email,
          salary,
          presentDays,
          absentDays: totalDays - presentDays,
          totalWorkingDays: totalDays,
          estimate_salary: salary === "N/A" ? "N/A" : Math.round(estimate_salary),
          month: start.toLocaleString("default", { month: "long" }), // based on start date
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
