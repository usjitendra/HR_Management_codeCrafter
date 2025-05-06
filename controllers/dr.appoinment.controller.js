import { log } from "console";
import AppointmentModel from "../models/dr.appointment.model.js";
import AppError from "../util/appError.js";

const createAppointment = async (req, res, next) => {
  try {
    const { patientName,phoneNumber,gender,purpose, dateTime,address } = req.body;

    if (!patientName || !dateTime) {
      return next(new AppError("Patient name and date/time required", 400));
    }

    const requestedTime = new Date(dateTime); 
    const now = new Date(); 
     
    if (requestedTime <= now) {
      return next(new AppError("Past time slot not allowed", 400));
    }

    const minutes = requestedTime.getMinutes();
    if (minutes % 20 !== 0) {
      return next(
        new AppError("Please select correct slot", 400)
      );
    }

    const existing = await AppointmentModel.findOne({
      dateTime: requestedTime,
    });

    if (existing) {
      return next(new AppError("This time slot is already booked", 409));
    }

    const newAppointment = await AppointmentModel.create({
      patientName,
      dateTime: requestedTime,
      phoneNumber,
      gender,
      purpose,
      address
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await AppointmentModel.find();

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export { createAppointment, getAllAppointments };
