import mongoose from "mongoose";

const salaryPaymentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 0 = Jan, 11 = Dec
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date }, // optional
  paidAmount: { type: Number }, // optional
  },
  {
    timestamps:true
  }
);

export default mongoose.model("SalaryPayment", salaryPaymentSchema);
