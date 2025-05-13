import { Router } from "express";

const notificationRoutes=Router();

import{getUserNotifications,allnotification,markNotificationAsRead} from '../controllers/notification.controller.js'
 

// notificationRoutes.put("/read/:id", markNotificationAsRead);
notificationRoutes.get("/all",allnotification)
notificationRoutes.get("/user/:id", getUserNotifications);
notificationRoutes.get("/isReade/:id", markNotificationAsRead);



export default notificationRoutes;