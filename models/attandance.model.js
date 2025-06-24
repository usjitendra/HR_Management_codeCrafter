import { model, Schema } from "mongoose";
import { type } from "os";

const attandanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    loginTime: {
      type: Date,
      default: null,
      // required:true
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    locationIn: {
      type: String,
    },
    locationOut: {
      type: String,
    },
    totalWorkingHour: {
      type: String,
      default:"0h 0m 0s"
    },
    otTime:{
      type:String,
      default:"0h 0m 0s"
    },
    isHalfDay: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
    isFullDay: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
    status: {
      type: String,
      enum: ["present", "absent", "wfh"],
      default: "absent"
    },
    reasonForLeave: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    deviceDetails: {
      type: String,
    },
    isLate: {
      type: Boolean,
    },
    remark: {
      type: String,
    },
    workingHours: {
      type: String,
      default:"0h 0m 0s"
    },
    checkIn: {
      type: Boolean,
      default: false, 
    },
   leave:{
        type:Boolean,
        default:false
    },
    location:{
      type:{type:String,enum:['Point'],default:'Point'},
      coordinates:{type:[Number],default:[0,0]},
      name:{
         type:String,
         default:null
      }
    }
  },
  {
    timestamps: true,
  }
);

const AttandanceModel = model("Attandance", attandanceSchema);

export default AttandanceModel;
