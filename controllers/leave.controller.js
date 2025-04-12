import AppError from "../util/appError.js";
import leaveModel from "../models/leave.model.js";
import employeModel from "../models/employeeModel.js";

const applyLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leaveType, fromDate, toDate, reason } = req.body;
    const isValid = await employeModel.findById(id);
    if (!isValid) {
      return next(new AppError("Some error occured", 400));
    }
    const newLeave = await leaveModel.create({
      employeeId: id,
      leaveType,
      fromDate,
      toDate,
      reason,
    });

    //  return;
    await employeModel.findByIdAndUpdate(id, { leaveID: newLeave._id });

    return res
      .status(200)
      .json({
        sucess: true,
        message: "Leave Apply Successfully",
        leave: newLeave,
      });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const getMyLeaves = async(req, res, next) => {
  try {
        const{id}=req.params;
        const response=await leaveModel.find({employeeId:id}).sort({appliedAt:-1})
        if(response.length===0){
            return next(new AppError("No Leave Apply",400))
        }
         console.log(response);
        //  return
         

        return res.status(200).json({success:true,data:response})
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const approveLeave = async(req, res, next) => {
  try {
     const{id}=req.params;
      console.log("aaaa")
    //   return;
     const {adminDescription}=req.body
       const response=await leaveModel.findById(id);
       if(!response){
        return next(new AppError("No Leave Applay",400))
       }
       if (response.status !== 'Pending') {
        return next(new AppError("Leave already reviewed", 400));
      }
       response.status="Approved",
       response.adminDescription=adminDescription
    //    response.reviewedBy=id
       const data=await response.save()
       return res.status(200).json({success:true,message:"Leave Aproved",data:data})
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const rejectLeave = async(req, res, next) => {
  try {
      const {id}=req.params;
      const{adminDescription}=req.body;
      const response=await leaveModel.findById(id)
       if(!response){
          return next(new AppError("some error occured",400));
       }
       if (response.status !== 'Pending') {
        return next(new AppError("Leave already reviewed", 400));
      }
       response.status="Rejected",
       response.adminDescription=adminDescription
    //    response.reviewedBy=id
       const result= await response.save();

       return res.status(200).json({success:true,message:"Leave Reaject",result})

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const deleteLeave = async(req, res, next) => {
  try {
     const{id}=req.params;
     const response=await leaveModel.findByIdAndDelete(id);
       if(!response){
        return next(new AppError("No Leave find",400))
       }
       else{
        return res.status(200).json({success:true,message:"Leve Delete Successfully"})
       }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export { applyLeave,getMyLeaves,approveLeave,deleteLeave,rejectLeave};
