import {model,Schema} from "mongoose"
import { Timestamp } from "firebase-admin/firestore";
import { type } from "os";

const salarySlipSchema=new Schema (
    {
         employeeId:{
            type:Schema.Types.ObjectId,
            ref:"Employee",
            default:null
         },
         name:{
            type:String
         },
         email:{
            type:String
         },
         mobile:{
            type:String
         },
         actualSalary:{
            type:String
         },
         totalDay:{
            type:String
         },
         presentDay:{
            type:String
         },
         absentDay:{
            type:String
         },
         estimateSalary:{
            type:String
         }
    },
    {
        timestamps:true
    }
)

const salarySlipModel=model("SalarySlip",salarySlipSchema);

export default salarySlipModel;