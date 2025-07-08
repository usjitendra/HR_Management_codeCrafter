import mongoose from 'mongoose';

const employeeIdGenerateSchema = new mongoose.Schema(
  {
    _id: String, // e.g., 'employeeId'
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const empIdModel = mongoose.model("CounterEMP", employeeIdGenerateSchema);
export default empIdModel;
