import { log } from "console";
import AppointmentModel from "../models/dr.appointment.model.js";
import AppError from "../util/appError.js";

const createAppointment = async (req, res, next) => {
  try {
    const { patientName, phoneNumber, gender, purpose, dateTime, address, email } = req.body;
        // console.log(req.body);
        
    if (!patientName || !dateTime) {
      return next(new AppError("Patient name and date/time required", 400));
    }

    const requestedTime = new Date(dateTime);

    // Convert to IST
    const requestedIST = new Date(requestedTime.getTime() + 5.5 * 60 * 60 * 1000);
    const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);

    // Only allow 20-minute intervals
    const minutes = requestedTime.getMinutes();
    if (minutes % 20 !== 0) {
      return next(new AppError("Please select correct slot", 400));
    }

    const existing = await AppointmentModel.findOne({ dateTime: requestedTime });
    if (existing) {
      return next(new AppError("This time slot is already booked", 409));
    }

    const newAppointment = await AppointmentModel.create({
      patientName,
      dateTime: requestedTime,
      phoneNumber,
      gender,
      purpose,
      address,
      email,
    });

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content using template literal
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info@xpresstourtravels.com',
      subject: 'New Inquiry Received',
      text: `Dear Team,

We have received a new inquiry with the following details:

Name: ${patientName}
Phone Number: ${phoneNumber}
Email Address: ${email}
Purpose: ${purpose}
Gender: ${gender}
Address: ${address}
Preferred Date/Time: ${requestedIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Please address this inquiry at the earliest convenience.

Best regards,  
Code Crafter Team`,
    };

    await transporter.sendMail(mailOptions);

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
