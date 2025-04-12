import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { type } from "os";

const employeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please provide a valid email address"],
    },
    workEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    alternateMobile: {
      type: String,
    },
    mobile: {
      type: String, 
      required: true,
      trim: true,
      unique: true,
    },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    qualification: { type: String },
    experience: { type: String },
    maritalStatus: { type: String },
    children: { type: String },
    emergencyContact: { type: String },

    employeeImage: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },

    employeeIdCard: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },

    employeeDocument: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },

    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee",
    },

    password: {
      type: String,
      required: true,
      trim: true, 
    },

    token: {
      type: String,
      default: "",
    },

    additional3: { type: String },
    additional4: { type: String },
    additional5: { type: String },
    workId:{
         type:Schema.Types.ObjectId,
         ref:"EmployeeWork"  
    },
    bankId:{
      type:Schema.Types.ObjectId,
      ref:"BankDetail"
    },
    attandanceId:{
      type:Schema.Types.ObjectId,
      ref:"AttandanceModel"
    },
    leaveID:{
        type:Schema.Types.ObjectId,
        ref:"Leave"
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const employeModel = model("Employee", employeeSchema);
export default employeModel;
