import AppError from "../util/appError.js";
import leaveModel from "../models/leave.model.js";
import employeModel from "../models/employeeModel.js";
import jwt from "jsonwebtoken";
import { create } from "domain";
import { createNotification } from "./notification.controller.js";
import sendFirebaseNotification from '../util/send.Firebase.Notification.js';
const key = process.env.JWT_SECRET;



const applyLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { breakDown, leaveType, startDate, endDate, description } = req.body;

    const isValid = await employeModel.findById(id);
    if (!isValid) {
      return next(new AppError("Some error occured", 400));
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
      return next(new AppError("Leave all ready applay"));
    }
    const newLeave = await leaveModel.create({
      employeeId: id,
      leaveType,
      startDate,
      endDate,
      description,
      breakDown,
    });
    //  return;
    await employeModel.findByIdAndUpdate(id, { leaveID: newLeave._id });

    //create notification leave...
    const io = req.app.get("io");
    const title = " Leave Request";
    const message = `${isValid.name} leave Applay`;
    const fromId = id;
    const result = await createNotification({ fromId, title, message }, io);

    io.emit("new-message", "jitendra leave le lehlus re dada"); // 🔥 Total summary bhi emit karo
       //fcm notification ********
      //  console.log(isValid.fcmToken);
      //  return;
      if (isValid.fcmToken) {
      const payload = {
        title: "Leave Request Submitted",
        body: `${employee.name}, your leave request has been submitted.`,
      };
      await sendFirebaseNotification(employee.fcmToken, payload);
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
    const response = await leaveModel
      .find({ employeeId: id })
      .sort({ appliedAt: -1 });
    if (response.length === 0) {
      return next(new AppError("No leave applications found.", 400));
    }
    //  return

    return res.status(200).json({ success: true, data: response, message: "Leave data found successfully" });
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
    (response.status = "Approved"), (response.description = adminDescription);

    //create notification leave...
    const title = "Leave";
    const message = "Leave Approved";
    const fromId = response.employeeId;
    const io = req.app.get("io");
    const result = await createNotification({ fromId, title, message }, io);

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
     console.log("id hab bha++",id);
    //  return;
    const response = await leaveModel.findById(id)
    if (!response) {
      return next(new AppError("No Leave Apply h bhai", 400))
    }
      response.status="Rejected"
     await response.save()
    //  return
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
    const leaveData = await leaveModel
      .find()
      .populate("employeeId", "name email mobile") // fixed: pass as string
      .sort({ createdAt: -1 }); // latest leave on top

    return res.status(200).json({
      success: true,
      message: "All leave details fetched successfully",
      data: leaveData
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
};
