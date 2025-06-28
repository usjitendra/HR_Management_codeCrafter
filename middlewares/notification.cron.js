import cron from 'node-cron'
import notificationModel from '../models/notification.model.js'
import { log } from 'node:console';



const notification=async()=>{
    try{
           const result =await notificationModel.deleteMany({});
           console.log(`notification delete at 1 Am: ${result.deletedCount}`);
           
    }catch(err){
        console.log("Error in aato delete in notification",err.message);
        
    }
}


// cron.schedule("0 1 * * *",async()=>{
//      console.log("Running dealy delete notification.");
//      notification()
// })

// notification();