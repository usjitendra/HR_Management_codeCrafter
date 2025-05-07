import notificationModel from "../models/notification.model.js";
import AppError from "../util/appError.js";

// 🟢 Create a new notification
 const createNotification = async ({ fromId = null, toId, title, message }) => {
  try {
    const notification = await notificationModel.create({ fromId, toId, title, message });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw new Error("Notification creation failed");
  }
};

// 🔵 Get all notifications for a user (toId)
const getUserNotifications = async (req, res,next) => {
  try {
    const userId = req.user._id; // assuming you're using auth middleware
    const notifications = await natificationModel.find({ toId: userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    return next(new AppError("notification not fund",401))
  }
};

// 🟡 Mark a notification as read
 const markNotificationAsRead = async (req, res,next) => {
  try {
    const notificationId = req.params.id;
    const updated = await natificationModel.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

    if (!updated) {
      return next(new AppError("Notification not found",401))
    }

    res.status(200).json({ message: "Marked as read", notification: updated });
  } catch (error) {
       return next(new AppError(error.message,401))
  }
};



export{createNotification,getUserNotifications,markNotificationAsRead}