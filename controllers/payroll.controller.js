import AppError from "../util/appError.js";
import employeeBankModel from "../models/employee.bank.model.js";
import employeModel from "../models/employeeModel.js";
import AttandanceModel from "../models/attandance.model.js";
import employeeWorkModel from "../models/employee.work.information.model.js";
import salarySlipModel from "../models/salary.slip.model.js";
import PDFDocument from 'pdfkit';
import salaryModel from "../models/salaryPayment/salaryPaymentModel.js"; // adjust path if needed
import dayjs from "dayjs"; // make sure you install dayjs

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
    //for app ke liye
    const { startDate, endDate, year } = req.query;

    if (startDate && endDate) {
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
    }
    console.log(year);

    //  return
    if (year) {
      const numericYear = Number(year);
      const currentYear = new Date().getFullYear();
      if (numericYear > currentYear) {
        return res.status(400).json({
          success: false,
          message: `Year ${numericYear} is in the future. Cannot generate data.`,
          data: [],
        });
      }
      const startOfYear = new Date(numericYear, 0, 1);
      const endOfYear = new Date(numericYear, 11, 31, 23, 59, 59, 999);

      const allEmployees = await employeModel.find(
        { createdAt: { $gte: startOfYear, $lte: endOfYear } }
      );
      const result = [];
      // return
      await Promise.all(
        allEmployees.map(async (employee) => {
          const bankData = await employeeWorkModel.findOne({ employeeId: employee._id });
          const salary = bankData?.salary || "N/A";
          const joiningDate = new Date(employee.createdAt || employee.joiningDate);

          const monthlyResults = await Promise.all(
            Array.from({ length: 12 }).map(async (_, month) => {
              // 👉 Only generate salary for months after joining
              if (
                numericYear < joiningDate.getFullYear() ||
                (numericYear === joiningDate.getFullYear() && month < joiningDate.getMonth())
              ) {
                return null;
              }

              const start = new Date(numericYear, month, 1);
              const end = new Date(numericYear, month + 1, 0, 23, 59, 59, 999);

              const attendanceRecords = await AttandanceModel.find({
                employeeId: employee._id,
                date: { $gte: start, $lte: end },
              });

              const presentDays = attendanceRecords.filter((rec) => rec.status === "present").length;
              const totalDays = attendanceRecords.length;
              const absentDays = totalDays - presentDays;

              const oneday_salary = salary !== "N/A" ? parseFloat(salary) / 30 : 0;
              const estimate_salary = oneday_salary * presentDays;

              const paymentStatus = await salaryModel.findOne({
                employeeId: employee._id,
                year: numericYear,
                month,
              });

              return {
                employeeId: employee._id,
                employeeName: employee.name,
                email: employee.email,
                salary,
                presentDays,
                absentDays,
                totalWorkingDays: totalDays,
                estimate_salary: salary === "N/A" ? "N/A" : Math.round(estimate_salary),
                year: numericYear,
                month: new Date(numericYear, month).toLocaleString("default", { month: "long" }),
                status: paymentStatus?.isPaid ? "Paid" : "Unpaid",
              };
            })
          );

          result.push(...monthlyResults.filter((item) => item !== null));
        })
      );
      
      return res.status(200).json({
        success: true,
        message: `Monthly salary slips for year ${numericYear}`,
        count: result.length,
        data: result,
      });
    }
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


const add_salary_slip = async (req, res, next) => {
  try {
    const { id, name, email, mobile, actualSalary, totalDay, presentDay, absentDay, estimateSalary } = req.body;
    const result = await salarySlipModel.create({
      employeeId: id,
      name,
      email,
      mobile,
      actualSalary,
      totalDay,
      presentDay, absentDay, estimateSalary
    })
    return res.status(200).json({ success: true, messag: "salary create successfully", data: result })
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
}

const download_salary_slip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Please select year and month",
      });
    }

    const startDate = new Date(year, month - 1, 1); // JS months 0-based hote hain
    const endDate = new Date(year, month, 0); // 0th day of next month gives last day of current month
    endDate.setHours(23, 59, 59, 999); // set end time to 23:59:59.999

    const employee = await employeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const attendanceRecords = await AttandanceModel.find({
      employeeId: employee._id,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const presentDays = attendanceRecords.filter((rec) => rec.status === "present").length;
    const hafDay=attendanceRecords.filter((rec)=>rec.isHalfDay==true).length;
    
    console.log("hafDay",hafDay);
    // return;
    
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

    console.log("result", result);
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const filename = `salary-slip-${new Date().getMonth() + 1}-${new Date().getFullYear()}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Company Logo placeholder and header
    // doc.rect(50, 50, 80, 60).stroke(); // Logo placeholder box
    // doc.fontSize(10).text('logo', 55, 75);
    // doc.fontSize(14).font('Helvetica-Bold').text(`Code Crafter Web Solutions`, 400, 50);

    // Company name and address at top right
   
    doc.fontSize(14).font('Helvetica-Bold').text(`Code Crafter Web Solutions`,{  align: 'left', }, 50, 50);
    doc.fontSize(10).font('Helvetica').text('', 400, 70);

    // Payslip title
    // doc.fontSize(12).font('Helvetica-Bold').text('Payslip for the month of April, 2024', 50, 130);

    doc.moveDown(1);

    // Employee Pay Summary section
    doc.fontSize(11).font('Helvetica-Bold').text('Employee Pay Summary', 50, 160);

    // Employee details in two columns
    const startY = 180;
    const leftCol = 50;
    const rightCol = 300;

    // Left column - Employee details
    doc.fontSize(10).font('Helvetica-Bold').text('Name', leftCol, startY);
    doc.font('Helvetica').text(`${result.employeeData.name}`, rightCol, startY);

    doc.font('Helvetica-Bold').text('Email', leftCol, startY + 15);
    doc.font('Helvetica').text(`${result.employeeData.email}`, rightCol, startY + 15);

    doc.font('Helvetica-Bold').text('Phone', leftCol, startY + 30);
    doc.font('Helvetica').text(`${result.employeeData.mobile}`, rightCol, startY + 30);

    doc.font('Helvetica-Bold').text('Department', leftCol, startY + 45);
    doc.font('Helvetica').text(`${result.work_data.department}`, rightCol, startY + 45);

    doc.font('Helvetica-Bold').text('Employee ID', leftCol, startY + 60);
    doc.font('Helvetica').text(`${result.employeeData.empId}`, rightCol, startY + 60);

    doc.font('Helvetica-Bold').text('Date of Joining (dd-mm-yyyy)', leftCol, startY + 75);
    doc.font('Helvetica').text(
      `${new Date(result.employeeData.createdAt).toLocaleDateString()}`,
      rightCol,
      startY + 75
    );

    doc.font('Helvetica-Bold').text('JobPosition', leftCol, startY + 90);
    doc.font('Helvetica').text(`${result.work_data.jobPosition}`, rightCol, startY + 90);

    // doc.font('Helvetica-Bold').text('Location', leftCol, startY + 75);
    // doc.font('Helvetica').text('Days Worked', rightCol, startY + 75);

    // doc.font('Helvetica-Bold').text('Pay Date (dd-mm-yyyy)', leftCol, startY + 90);

    // Main table layout - Three columns
    const tableStartY = 290;
    const col1X = 50;  // EARNINGS
    const col2X = 200; // Master Earnings 
    const col3X = 300; // Particulars
    const col4X = 420; // Deductions
    const col5X = 500; // Amount

    // Table headers
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('EARNINGS', col1X, tableStartY);
    doc.text('Master Earnings', col2X, tableStartY);
    doc.text('Particulars', col3X, tableStartY);
    doc.text('Deductions', col4X, tableStartY);

    // Draw header line
    doc.moveTo(50, tableStartY + 15).lineTo(550, tableStartY + 15).stroke();

    // Earnings data
    const earningsData = [
      ['Basic', `₹${result.salary}`, '₹0.00', 'Income Tax Deduction'],
      ['House Rent Allowance', '₹0.00', '₹0.00', 'Profession Tax'],
      ['Special Allowance', '₹0.00', '₹0.00', 'P.F.'],
      ['Statutory Bonus', '₹0.00', '₹0.00', 'Other Deduction 1'],
      ['LTA Allowance', '₹0.00', '₹0.00', 'Other Deduction 2'],
      ['Other Earning 1', '₹0.00', '₹0.00', 'Other Deduction 3'],
      ['Other Earning 2', '₹0.00', '', ''],
      ['Other Earning 3', '₹0.00', '', '']
    ];

    let currentY = tableStartY + 25;
    doc.fontSize(9).font('Helvetica');

    earningsData.forEach(([earning, amount1, amount2, deduction]) => {
      doc.text(earning, col1X, currentY);
      doc.text(amount1, col2X, currentY);
      if (amount2) doc.text(amount2, col3X, currentY);
      if (deduction) doc.text(deduction, col4X, currentY);
      doc.text('₹0.00', col5X, currentY);
      currentY += 15;
    });

    // Gross Earnings line
    currentY += 10;
    doc.font('Helvetica-Bold').text('Gross Earnings', col1X, currentY);
    doc.text(`₹${result.estimate_salary}`, col2X, currentY);
    doc.text('Total Deductions', col4X, currentY);
    doc.text('₹0.00', col5X, currentY);

    // REIMBURSEMENTS section
    currentY += 30;
    doc.fontSize(11).font('Helvetica-Bold').text('REIMBURSEMENTS', col1X, currentY);

    currentY += 20;
    doc.fontSize(9).font('Helvetica');
    doc.text('Reimbursement 1', col1X, currentY);
    doc.text('₹0.00', col2X, currentY);
    doc.text('₹0.00', col3X, currentY);

    currentY += 15;
    doc.text('Reimbursement 2', col1X, currentY);
    doc.text('₹0.00', col2X, currentY);
    doc.text('₹0.00', col3X, currentY);

    currentY += 20;
    doc.font('Helvetica-Bold').text('Total Reimbursements', col1X, currentY);
    doc.text(`₹${result.salary - result.estimate_salary}`, col2X, currentY);

    // NET PAY AMOUNT section
    currentY += 30;
    doc.fontSize(11).font('Helvetica-Bold').text('NETPAY AMOUNT', col1X, currentY);

    currentY += 20;
    doc.fontSize(9).font('Helvetica');
    doc.text('Gross Earnings', col1X, currentY);
    doc.text('₹0.00', col2X, currentY);

    currentY += 15;
    doc.text('Total Deductions', col1X, currentY);
    doc.text('₹0.00', col2X, currentY);

    currentY += 15;
    doc.text('Total Reimbursements', col1X, currentY);
    doc.text('₹0.00', col2X, currentY);

    // L.O.P. Days
    currentY += 20;
    doc.text('L.O.P. Days :', col1X, currentY);

    // Final amounts
    currentY += 20;
    doc.font('Helvetica-Bold').text('Total Net Payable', col1X, currentY);
    doc.text(`${result.estimate_salary}`, col2X, currentY);

    currentY += 20;
    doc.fontSize(10).text(`Total Net Payable ${result.estimate_salary} Amount`, col1X, currentY);

    // Footer note
    currentY += 30;
    // doc.fontSize(8).font('Helvetica').text('**Total Net Payable = Gross Earnings - Total Deductions + Total Reimbursements', col1X, currentY);

    // Page number
    doc.text('Page 1', 500, 750);

    doc.end();

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const SalaryPay = async (req, res, next) => {
  try {
    const { employeeId, year, month, isPaid, paidAmount } = req.body;

    console.log(req.body);
    // return
    if (!employeeId) {
      return next(new AppError("Employee ID,are required.", 400));
    }

    const record = await salaryModel.create({
      employeeId,
      year,
      month,
      isPaid,
      paidAmount: paidAmount
    });
    return res.status(200).json({
      success: true,
      message: "Salary payment status updated successfully.",
      data: record,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};


export const viewSalary_ByMonth = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: "Year and month are required in query" });
    }
    // Calculate start and end date of the month using dayjs

    const start = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const end = dayjs(start).endOf('month').toDate();

    const employee = await employeModel.findById(id);

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
    const paysalary = await salaryModel.findOne({
      registrationId: id, createdAt: {
        $gte: start, $lte: end
      }
    })

    const salaryDetail = {
      salary,
      absentDays: totalDays - presentDays,
      totalDays,
      presentDays,
      estimate_salary,
      status: paysalary ? "Paid" : "Pending"
    }

    const result = {
      // employeeData: employee,
      salaryDetail
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


 export const total_paid_unpaid=async(req,res,next)=>{
        try{
              const {year,month}=req.query;
              console.log("year",year);
              console.log("month",month);
              
        }catch(err){
           return next(new AppError())
        }            
 }


export { viewSallery_slipe, viewSallery_employee, add_salary_slip, download_salary_slip };
