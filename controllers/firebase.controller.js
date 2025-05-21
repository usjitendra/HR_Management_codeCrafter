
import AppError from "../util/appError.js"
import sendFirebaseNotification from '../util/send.Firebase.Notification.js'


export const generateFCM_notification=async(req,res,next)=>{
    try {
             let a="111";
             let b="bbb";
             const result= await sendFirebaseNotification(a,b)  
             console.log(result);
             
    } catch (error) {
          return next(new AppError(error.message,500))
    }
}