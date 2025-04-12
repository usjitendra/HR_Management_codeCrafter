import { Schema,model } from "mongoose";
import { type } from "os";


const leaveSchema=new Schema(
    {
       employeeId:{
        type:Schema.Types.ObjectId,
        ref:"Employee",
        default:null
       },
       leaveType:{
          type:String,
          enum:['Casual','Sick','Earned','Maternity','Paternity','unpaid'],
          require:true
       },
       fromDate:{
        type:Date,
        require:true
       },
       toDate:{
        type:Date,
        require:true
       },
       reason:{
        type:String,
        require:true,
        trim:true
       },
       status:{
          type:String,
          enum:['Pending','Approved','Rejected'],
          default:'Pending'
       },
       adminDescription:{
        type:String
       },
       reviewedBy:{
        type:Schema.Types.ObjectId,
        ref:"Admin"
       },
       appliedAt:{
        type:Date,
         default:Date.now
       },
       teast1:{
          type:String
       },
    },
    {
        timestamps:true
    }
)


const leaveModel=model("Leave",leaveSchema);

export default leaveModel;