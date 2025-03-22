import { model, Schema } from "mongoose";


const attandanceSchema=new Schema(
    {
        employeeId:
        {
            type: Schema.Types.ObjectId,
            ref: "Employee", 
            default: null,
        },
        date:{
            type:Date,
            required:true,
            default:Date.now
        },
        loginTime:{
            type:Date,
            // required:true
        },
        logoutTime:{
            type:Date,
        },
        locationIn:{
            type:String
        },
        locationOut:{
            type:String
        },
        totalWorkingHour:{
            type:String
        },
        isHalfDay:{
            type:Boolean,
            default:false,
            enum:[true,false]
        },
        isFullDay:{
            type:Boolean,
            default:false,
            enum:[true,false]
        },
        status:{
            type:String,
            enum:["present","absent",,"wfh"]
        },
        reasonForLeave:{
            type:String
        },
        ipAddress:{
            type:String
        },
        deviceDetails:{
            type:String
        },
        isLate:{
            type:Boolean
        },
        remark:{
            type:String
        }
    },
    {
         timestamps:true
    }
)


const AttandanceModel=model("AttandanceModel",attandanceSchema)

export default AttandanceModel