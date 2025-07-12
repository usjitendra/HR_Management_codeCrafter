import { model, Schema } from "mongoose";

const employeeDocumentSchema = new Schema(
  {
      employeeid:{
        type:Schema.Types.ObjectId,
        ref:"Employee",
        default:null
      },
    pan: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" }
    },
    aadhaar: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" }
    },
    passbook: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" }
    },
    highSchool: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" }
    },
    graduation: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" }
    },
    salarySlip: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" }
    },
    //  additional: {
    //   public_id: { type: String, default: "" },
    //   secure_url: { type: String, default: "" }
    // },
  },
  {
    timestamps: true
  }
);

const documentModel = model("Document", employeeDocumentSchema);

export default documentModel;
