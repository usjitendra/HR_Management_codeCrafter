import AppError from "../util/appError.js";
import leaveModel from "../models/leave.model.js";
import employeModel from "../models/employeeModel.js";
import jwt from "jsonwebtoken";
import { create } from "domain";
import { createNotification } from "./notification.controller.js";
import sendFirebaseNotification from '../util/send.Firebase.Notification.js';
import employeeWorkModel from "../models/employee.work.information.model.js";
const key = process.env.JWT_SECRET;
// import sendNotification from './fcm.notification.js'
const applyLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { breakDown, reason, leaveType, startDate, endDate, description } = req.body;

     if (!leaveType || !startDate || !endDate) {
      return next(new AppError("Please provide leave type, start date, end date, and reason.", 400));
    }

    const isValid = await employeModel.findById(id);
    if (!isValid) {
      return next(new AppError("Some error occured", 400));
    }
     
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start > end) {
      return next(new AppError("Start date cannot be after end date.", 400));
    }

    if (start < now.setHours(0, 0, 0, 0)) {
      return next(new AppError("Start date cannot be in the past.", 400));
    }

    const existingLeave = await leaveModel.findOne({
      employeeId: id,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (existingLeave) {
      return next(new AppError("Leave already applied", 400));
    }
    const newLeave = await leaveModel.create({
      employeeId: id,
      leaveType,
      startDate,
      endDate,
      reason,
      description,
      breakDown,
    });

     await employeModel.findByIdAndUpdate(id, { leaveID: newLeave._id });

    //create notification leave...
    const io = req.app.get("io");
    const title = " Leave Request";
    const message = `${isValid.name} has applied for leave from ${startDate} to ${endDate}.`;
    const fromId = id;
    const url="leave/logs"
    const result = await createNotification({title, message,url},io);
    io.emit("new-message", `${isValid.name} leave le lehlus re dada`); // 🔥 Total summary bhi emit karo
    
    if (isValid.fcmToken) {
      const payload = {
        title: "Leave Request Submitted",
        body: `${isValid.name}, your leave request has been submitted.`,
      };
      await sendFirebaseNotification(isValid.fcmToken, payload);
    }
    return res.status(200).json({
      success: true,
      message: "Leave Apply Successfully",
      leave: newLeave,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const getMyLeaves = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.params;
    if (startDate && endDate) {
      const response = await leaveModel
        .find({
          employeeId: id,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        })
        .sort({ appliedAt: -1 });
      if (response.length === 0) {
        return next(new AppError("No leave applications found.", 400));
      }
      
      return res.status(200).json({ success: true, data: response, message: "Leave data found successfully" });
    }
    else {
      const response = await leaveModel
        .find({ employeeId: id })
        .sort({ appliedAt: -1 });
      if (response.length === 0) {
        return next(new AppError("No leave applications found.", 400));
      }
      //  return
      return res.status(200).json({ success: true, data: response, message: "Leave data found successfully" });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { adminDescription } = req.body;
    const response = await leaveModel.findById(id);
    if (!response) {
      return next(new AppError("No Leave Applied", 400));
    }
    if (response.status !== "Pending") {
      return next(new AppError("Leave has already been reviewed", 400));
    }
    (response.status = "Approved");

    //create notification leave...
    const title = "Leave Request Update";
    const message = "Your leave request has been approved.";
    const employeeId = response.employeeId;
    const io = req.app.get("io");
    const url="leave/logs"
   await createNotification({ employeeId, title, message,url}, io);

    const data = await response.save();
    return res
      .status(200)
      .json({ success: true, message: "Leave Aproved", data: data });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("id hab bha++", id);
    //  return;
    const response = await leaveModel.findById(id)
    if (!response) {
      return next(new AppError("No Leave Apply h bhai", 400))
    }
    response.status = "Rejected"
    await response.save()
    
   const title = "Leave Rejected";
   const message = "Unfortunately, your leave request could not be approved at this time.";
   const url="leave/logs";
   const employeeId=response.employeeId;
  const io = req.app.get("io");
  await createNotification({ employeeId, title, message,url}, io);
    return res.status(200).json({ success: true, data: response, message: "Leave Reject" })
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// const approveLeave = async(req, res, next) => {
//   try {
//      const{id}=req.params;

//     //   return;
//      const {adminDescription}=req.body
//        const response=await leaveModel.findById(id);
//        if(!response){
//         return next(new AppError("No Leave Applay",400))
//        }
//        if (response.status !== 'Pending') {
//         return next(new AppError("Leave already reviewed", 400));
//       }
//        response.status="Approved",
//        response.adminDescription=adminDescription
//     //    response.reviewedBy=id
//     const result = await response.save();

//     return res
//       .status(200)
//       .json({ success: true, message: "Leave Rejected", result });
//   } catch (err) {
//     return next(new AppError(err.message, 500));
//   }
// };

const deleteLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await leaveModel.findById(id);
    if (result.status === "Approved") {
      return next(
        new AppError("Leave has been approved, cannot be deleted", 500)
      );
    }
    const response = await leaveModel.findByIdAndDelete(id);
    if (!response) {
      return next(new AppError("No Leave find", 400));
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Leave Delete Successfully" });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const alldetail = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    if (!token) {
      return next(new AppError("Unauthorized: No token provided", 401));
    }
    const decoded = jwt.verify(token, key);
    if (!decoded) {
      return next(new AppError("Token expired", 401));
    }
    const employeeData = await employeModel.findOne({
      registrationId: decoded.id,
    });
    const leaveData = await leaveModel
      .find({ employeeId: employeeData._id })
      .sort({ startDate: -1 });

    const data = {
      employeeData: {
        name: employeeData.name,
        mobile: employeeData.mobile,
        email: employeeData.email,
        id: employeeData._id,
      },
      leaveData: leaveData,
    };
    res.status(200).json({ success: true, data: data });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const leaveEdit = async (req, res, next) => {
  try {
    const { id } = req.params;
    //  console.log("asas++++",id);
    //  return;

    const { breakDown, leaveType, startDate, endDate, description } = req.body;
    const response = await leaveModel.findByIdAndUpdate(id, {
      breakDown,
      leaveType,
      startDate,
      endDate,
      description,
      status: "Pending",
    });
    if (response) {
      return res
        .status(200)
        .json({ success: true, message: "leave update Successfully" });
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const allEmployeeLeaveDetail = async (req, res, next) => {
  try {
    // Step 1: Get all leave records with basic employee info
    const leaveData = await leaveModel
      .find()
      .populate("employeeId", "name email mobile empId")
      .sort({ createdAt: -1 });

    // Step 2: Extract employee IDs from leave records
    const employeeIds = leaveData.map(leave => leave.employeeId._id);

    // Step 3: Fetch only department field from employeeWorkModel
    const workDetails = await employeeWorkModel.find(
      { employeeId: { $in: employeeIds } },
      { employeeId: 1, department: 1 } // ❗ Only select employeeId and department
    );
    
    
    // Step 4: Merge department into each leave record
    const mergedData = leaveData.map(leave => {
      const work = workDetails.find(
        w => w.employeeId.toString() === leave.employeeId._id.toString()
      );
      return {
        ...leave.toObject(),
        department: work?.department || null
      };
    });

    // Step 5: Send response
    return res.status(200).json({
      success: true,
      message: "All leave details with departments fetched successfully",
      data: mergedData
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const allLeave = async (req, res, next) => {
  try {
    const data = await leaveModel.find().sort({ createdAt: -1 });
    if (!data) {
      return next(new AppError("Leave data not found", 400));
    }
    return res.status(200).json({ success: true, data: data, message: "success" });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


const singleLeave = async (req, res, next) => {
  try {
    const { id } = req.params
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
      const leaves = await leaveModel.find({
        employeeId: id, createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      const approvedLeaves = leaves.filter(leave => leave.status === 'Approved').length;
      const rejectedLeaves = leaves.filter(leave => leave.status === 'Rejected').length;
      const data = {
        totalLeaves: leaves.length,
        approvedLeaves,
        rejectedLeaves
      }
      return res.status(200).json({
        success: true,
        message: "success",
        data: data
      })
    }

    else {
      //  console.log(id);
      const leaves = await leaveModel.find({ employeeId: id, })
      const approvedLeaves = leaves.filter(leave => leave.status === 'Approved').length;
      const rejectedLeaves = leaves.filter(leave => leave.status === 'Rejected').length;

      const data = {
        totalLeaves: leaves.length,
        approvedLeaves,
        rejectedLeaves
      }
      return res.status(200).json({
        success: true,
        message: "Employee leave",
        data: data
      })
    }

  } catch (err) {
    return next(new AppError(err.message, 500))
  }
}


const todayLeave = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const leaves = await leaveModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $lookup: {
          from: "employees", // 👈 collection name in MongoDB (usually lowercase plural)
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeInfo"
        }
      },
      {
        $unwind: "$employeeInfo"
      },
      {
        $project: {
          _id: 1,
          leaveDate: 1,
          reason: 1,
          employeeId: 1,
          employeeName: "$employeeInfo.name"
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "Today's leaves fetched successfully",
      data: leaves
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching today's leaves",
      error: error.message
    });
  }
};



export {
  applyLeave,
  getMyLeaves,
  approveLeave,
  deleteLeave,
  rejectLeave,
  alldetail,
  leaveEdit,
  allEmployeeLeaveDetail,
  allLeave,
  singleLeave,
  todayLeave
};
