import { Router } from "express";

const notificationRoutes=Router();

import{getUserNotifications} from '../controllers/notification.controller.js'
 

notificationRoutes.get("/:id", getUserNotifications);
// notificationRoutes.put("/read/:id", markNotificationAsRead);



export default notificationRoutes;