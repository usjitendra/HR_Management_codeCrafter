import notificationModel from "../models/notification.model.js";
import AppError from "../util/appError.js";
import dayjs from 'dayjs'; // Make sure to install dayjs if not already
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// 🟢 Create a new notification
const createNotification = async ({ fromId = null, toId = null, title, message }, io) => {
           
  try {
    const notification = await notificationModel.create({ fromId, toId, title, message });

    if (io && toId) {
      io.to(toId.toString()).emit("new_notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw new Error("Notification creation failed");
  }
};


//notification update....

// 🔵 Get all notifications for a user (toId)
const getUserNotifications = async (req, res,next) => {
  try {
    const userId = req.params.id; 
      console.log(userId,"hai bhai++");
      return;
      
    const notifications = await notificationModel.find({ toId: userId }).sort({ createdAt: -1 });
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
    const startOfToday = dayjs().startOf('day').toDate(); // today 00:00:00
    const endOfToday = dayjs().endOf('day').toDate();     // today 23:59:59

    const result = await notificationModel.find({
      isRead: false,
      // createdAt: {
      //   $gte: startOfToday,
      //   $lte: endOfToday,
      // }
    });

    if (!result || result.length === 0) {
      return next(new AppError("No unread notifications for today", 404));
    }

    return res.status(200).json({ data: result });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export{createNotification,getUserNotifications,markNotificationAsRead,allnotification}