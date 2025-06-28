import mongoose, { model, Schema } from "mongoose";

const salaryPaymentSchema = new Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 0 = Jan, 11 = Dec
    isPaid: { type: Boolean, default: false },
    paidAmount: { type: Schema.Types.Mixed }, // optional
  },
  {
    timestamps: true,
  }
);

const salaryModel = model("SalaryPayment", salaryPaymentSchema);

export default salaryModel;
