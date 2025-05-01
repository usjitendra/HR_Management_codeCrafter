import mongoose, { Schema, model } from "mongoose";

const appointmentSchema = new Schema({
  patientName: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
    unique: true, 
  },
});

const AppointmentModel = model("DrAppointment", appointmentSchema);
export default AppointmentModel;

