import { model, Schema } from "mongoose";

const employeeBankSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
      unique: true,
    },
    branch: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    bankCode: {
      type: String,
    },
    bankAddress: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const employeeBankModel = model("BankDetail", employeeBankSchema);

export default employeeBankModel;
