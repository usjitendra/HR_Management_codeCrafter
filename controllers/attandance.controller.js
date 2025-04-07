import employeModel from "../models/employeeModel.js";
import AppError from "../util/appError.js";
import AttandanceModel from "../models/attandance.model.js";
import employee from "../routes/employee.routes.js";

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

    if (filterEmployee && filterEmployee.status === "absent") {
      return next(new AppError("Employee is Absent", 400));
    }

    if (filterEmployee && !filterEmployee.loginTime) {
      return next(new AppError("Employee is Not Login", 400));
    }

    if (filterEmployee && filterEmployee.logoutTime) {
      return next(new AppError("Employee is Already logged out", 400));
    }
    filterEmployee.logoutTime = now;

    const data = await filterEmployee.save();

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
export { attandanceLogin, attandanceLogout, absent, employee_attendence,all_employee_aatendance,testApi};
