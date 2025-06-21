import { model, Schema } from "mongoose";

const employeeWorkInformationSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    department: {
      type: String,
      default:null
    },
    shiftInformation: {
      type: String,
      enum: ["InternShip", "Permanent"],
    },
    employeeType: {
      type: String,
    },
    company: {
      type: String,
    },
    jobPosition: {
      type: String,
    },
    workType: {
      type: String,
      enum: ["Remote", "OnSite", "Hybrid"], 
    },
    salary: {
      type: String,
    },
    company: {
      type: String,
    },
    joiningDate: {
      type: Date, 
    },
    reportingManager: {
      type: String,
    },
    workLocation:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

const employeeWorkModel = model("EmployeeWork", employeeWorkInformationSchema);

export default employeeWorkModel;
