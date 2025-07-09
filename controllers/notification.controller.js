import notificationModel from "../models/notification.model.js";
import AppError from "../util/appError.js";
import dayjs from 'dayjs'; // Make sure to install dayjs if not already
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

const createNotification = async ({ fromId = null, toId = null, employeeId,title, message,url}, io) => {      
  try {
    // console.log("message",message);
    // console.log("title",title);
    // console.log("employeeId",employeeId);
    
    
    const notification = await notificationModel.create({employeeId:employeeId,fromId, toId, title, message,url });
    if (io && toId) {
      io.to(toId.toString()).emit("new_notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw new Error("Notification creation failed");
  }
};



const getUserNotifications = async (req, res,next) => {
  try {
    const userId = req.params.id; 
    const notifications = await notificationModel.find({employeeId: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success:true,
      message:"user notifications",
      data:notifications
    })
    res.status(200).json(notifications);
  } catch (error) {
    return next(new AppError("notification not fund",401))
  }
};

// 🟡 Mark a notification as read
 const markNotificationAsRead = async (req, res,next) => {
  try {
    const notificationId = req.params.id;
    // console.log(notificationId);
    // return;
    
    const updated = await notificationModel.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

    if (!updated) {
      return next(new AppError("Notification not found",401))
    }

    res.status(200).json({ message: "Marked as read", notification: updated });
  } catch (error) {
       return next(new AppError(error.message,401))
  }
};

const allnotification = async (req, res, next) => {
  try {
    const startOfToday = dayjs().startOf('day').toDate(); 
    const endOfToday = dayjs().endOf('day').toDate();     
    const result = await notificationModel.find({
      isRead: false,
      employeeId:null
    }).sort({ createdAt: -1 });

    if (!result) {
      return next(new AppError("No unread notifications for today", 404));
    }

    return res.status(200).json({ data: result });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};



export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await notificationModel.findByIdAndDelete(id);

    if (!deleted) {
      return next(new AppError("Notification not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};


export{createNotification,getUserNotifications,markNotificationAsRead,allnotification}