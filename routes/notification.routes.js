import { Router } from "express";

const notificationRoutes=Router();

import{getUserNotifications,allnotification} from '../controllers/notification.controller.js'
 

// notificationRoutes.put("/read/:id", markNotificationAsRead);
notificationRoutes.get("/all",allnotification)
notificationRoutes.get("/:id", getUserNotifications);



export default notificationRoutes;