
import mongoose, { Schema,SchemaType,model } from "mongoose";

const notificationSchema=new Schema(
    {
        employeeId:{
           type:Schema.Types.ObjectId,
           ref:"Employee",
           default:null
        },
        fromId:{
            type:Schema.Types.ObjectId,
            default:null
        },
        url:{
           type:String,
           default:null
        },
        toId:{
          type:Schema.Types.ObjectId,
          default:null  
        },

        title:{
            type:String,
            require:true
        },
        message:{
            type:String,
            require:true
        },
        isRead:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
)


const notificationModel=model("Notification",notificationSchema)

export default notificationModel;