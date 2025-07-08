import empIdModel from "../models/employeeDocument/empId.js";

export const getNextEmployeeId = async () => {
  const counter = await empIdModel.findByIdAndUpdate(
    { _id: 'employeeId' }, // fixed ID
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const numberPart = String(counter.seq).padStart(6, '0');
  return `CC${numberPart}`;
};
