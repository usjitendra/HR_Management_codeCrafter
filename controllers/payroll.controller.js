import AppError from "../util/appError.js";
import employeeBankModel from "../models/employee.bank.model.js";
import employeModel from "../models/employeeModel.js";
import AttandanceModel from "../models/attandance.model.js";
import employeeWorkModel from "../models/employee.work.information.model.js";
import salarySlipModel from "../models/salary.slip.model.js";
import PDFDocument from 'pdfkit';

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

const viewSallery_employee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please select start date and end date",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employee = await employeModel.findOne({ registrationId: id });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const attendanceRecords = await AttandanceModel.find({
      employeeId: employee._id,
      createdAt: { $gte: start, $lte: end },
    });

    const presentDays = attendanceRecords.filter((rec) => rec.status === "present").length;
    const totalDays = attendanceRecords.length;

    const bankData = await employeeWorkModel.findOne({ employeeId: employee._id });
    const salary = bankData?.salary || 0;
    const oneday_salary = salary / 30;
    const estimate_salary = oneday_salary * presentDays;

    const result = {
      employeeData: employee,
      work_data: bankData,
      salary,
      absentDays: totalDays - presentDays,
      totalDays,
      presentDays,
      estimate_salary,
    };

    return res.status(200).json({
      success: true,
      message: "Employee Monthly Salary",
      data: result,
    });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const add_salary_slip=async (req,res,next)=>{
       try {
              const {id,name,email,mobile,actualSalary,totalDay,presentDay,absentDay,estimateSalary}=req.body;
              const result=await salarySlipModel.create({
                employeeId:id,
                name,
                email,
                mobile,
                actualSalary,
                totalDay,
                presentDay,absentDay,estimateSalary
              })
              return res.status(200).json({success:true,messag:"salary create successfully",data:result})
       } catch (err) {
          return next(new AppError(err.message,500));
       } 
}



const download_salary_slip = async (req, res, next) => {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `salary-slip.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Company Info
    doc.fontSize(16).text('Code crafter', { align: 'left' });
    doc.fontSize(10).text('Addresh: IMC Tower 10 Lucknow, Uttar Pradesh', { align: 'left' });
    doc.moveDown();

    // Payslip period and Net Pay
    doc.fontSize(12).text('June 01, 2025 to June 09, 2025 Payslip', { continued: true });
    doc.font('Helvetica-Bold').text('   Employee Netpay :  USD 28715.58');
    doc.moveDown();

    // Employee Details
    doc.font('Helvetica-Bold').text('Employee ID : ', { continued: true }).font('Helvetica').text('50', { continued: true })
       .font('Helvetica-Bold').text('             Employee Name : ', { continued: true }).font('Helvetica').text('Pankaj Gulia (50)');
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Department : ', { continued: true }).font('Helvetica').text('MERN Stack Devloper:');
    doc.moveDown(1.5);

    // Allowance Table Header
    doc.font('Helvetica-Bold').text('Allowance', 70, doc.y, { continued: true });
    doc.text('Amount', 370);
    doc.moveTo(70, doc.y + 2).lineTo(530, doc.y + 2).stroke();
    doc.moveDown(0.5);

    // Allowance Data
    const allowances = [
      ['Basic Pay', '        10000'],
      ['test allownmxce',  '  0.00'],
      ['Other Allowances','0.00'],
      ['Total Gross Pay', '10000']
    ];

    allowances.forEach(([label, value]) => {
      doc.font('Helvetica').text(label, 70, doc.y, { continued: true });
      doc.text(value, 370);
    });

    doc.moveDown(1.5);

    // Deduction Table Header
    doc.font('Helvetica-Bold').text('Deduction', 70, doc.y, { continued: true });
    doc.text('Amount', 370);
    doc.moveTo(70, doc.y + 2).lineTo(530, doc.y + 2).stroke();
    doc.moveDown(0.5);

    // Deduction Data
    const deductions = [
      ['Loss of Pay', 'USD 0.00'],
      ['SSNIT', 'USD 1592.11'],
      ['Yemanuel Welfare', 'USD 150.00'],
      ['Total Deductions', 'USD 2465.79']
    ];

    deductions.forEach(([label, value]) => {
      doc.font('Helvetica').text(label, 70, doc.y, { continued: true });
      doc.text(value, 370);
    });

    doc.end();

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




export { viewSallery_slipe, viewSallery_employee,add_salary_slip,download_salary_slip };
