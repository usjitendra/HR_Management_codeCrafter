import { Router } from "express";


const firebaseRoute=Router();
import { generateFCM_notification } from "../controllers/firebase.controller.js";

  firebaseRoute.post('/generate/notifiction',generateFCM_notification)


export default firebaseRoute