import mongoose, { Schema, model } from "mongoose";
import { type } from "os";

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
  mobile: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  purpose: {
    type: String,
  },

});

const AppointmentModel = model("DrAppointment", appointmentSchema);
export default AppointmentModel;

