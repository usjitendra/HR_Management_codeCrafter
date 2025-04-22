import AppError from "../util/appError.js";
import leaveModel from "../models/leave.model.js";
import employeModel from "../models/employeeModel.js";
import jwt from 'jsonwebtoken';
const key = process.env.JWT_SECRET;
const applyLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    //   console.log("id++",id);
    //   console.log(req.body);
    //  return
    const {  breakDown,leaveType,  startDate,  endDate,  description } = req.body;
    const isValid = await employeModel.findById(id);
    if (!isValid) {
      return next(new AppError("Some error occured", 400));
    }
    const existingLeave=await leaveModel.findOne({
      employeeId:id,
      $or:[
        {
          startDate:{$lte:new Date(endDate)},
          endDate:{$gte:new Date(startDate)}
        }
      ]
    }) 
       console.log("aaaa",existingLeave);
       
     
    if(existingLeave){
       return next(new AppError("Leave all ready applay"));
    }
    const newLeave = await leaveModel.create({
      employeeId: id,
      leaveType,
      startDate,
      endDate,
      description,
      breakDown
    });
    //  return;
    await employeModel.findByIdAndUpdate(id, { leaveID: newLeave._id });

    return res
      .status(200)
      .json({
        success: true,
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

const alldetail=async(req,res,next)=>{
   try{
    const token = req.cookies?.authToken; 
    if (!token) {
        return next(new AppError("Unauthorized: No token provided", 401));
    }
    const decoded = jwt.verify(token,key); 
    if (!decoded) {
        return next(new AppError("Token expired", 401));
    }
       const employeeData=await employeModel.findOne({registrationId:decoded.id})
       const leaveData=await leaveModel.find({employeeId:employeeData._id}).sort({ startDate: -1 })
       const data={
          employeeData:{
            name:employeeData.name,
            id:employeeData._id,
          },
          leaveData:leaveData
       }
       res.status(200).json({success:true,data:data});
   }catch(err){
      return  next(new AppError(err.message,500));
   }
}

const leaveEdit=async(req,res,next)=>{
    try {
           const {id}=req.params;
          //  console.log("asas++++",id);
          //  return;
           
           const {  breakDown,leaveType,  startDate,  endDate,  description } = req.body;
           const response=await leaveModel.findByIdAndUpdate(id,{
            breakDown,
            leaveType,
            startDate,
            endDate,
            description
           })
           if(response){
            return res.status(200).json({success:true,message:"leave update Successfully"});
           }

    } catch (err) {
        return next(new AppError(err.message,500));
    }
}

export { applyLeave,getMyLeaves,approveLeave,deleteLeave,rejectLeave,alldetail,leaveEdit};
