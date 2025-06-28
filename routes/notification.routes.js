import { Router } from "express";

const notificationRoutes=Router();

import{getUserNotifications,allnotification,markNotificationAsRead,deleteNotification} from '../controllers/notification.controller.js'
 

notificationRoutes.get("/all",allnotification)
notificationRoutes.get("/user/:id", getUserNotifications);
notificationRoutes.get("/isReade/:id", markNotificationAsRead);
notificationRoutes.delete("/delete/:id",deleteNotification)


export default notificationRoutes;