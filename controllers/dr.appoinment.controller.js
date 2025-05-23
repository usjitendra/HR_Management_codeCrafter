import { log } from "console";
import AppointmentModel from "../models/dr.appointment.model.js";
import AppError from "../util/appError.js";
import nodemailer from "nodemailer"

const createAppointment = async (req, res, next) => {
    try {
        console.log("i am coming for create appointment");

        const { patientName, phoneNumber, gender, purpose, dateTime, address, email } = req.body;
        console.log(req.body);

        if (!patientName || !dateTime) {
            return next(new AppError("Patient name and date/time required", 400));
        }

        const requestedTime = new Date(dateTime);

        // Convert to IST
        const requestedIST = new Date(requestedTime.getTime() + 5.5 * 60 * 60 * 1000);

        // Only allow 20-minute intervals
        const minutes = requestedTime.getMinutes();
        // if (minutes % 20 !== 0) {
        //   return next(new AppError("Please select correct slot", 400));
        // }

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
            to: 'ayushm185@gmail.com',
            subject: '🏥 New Appointment Request - Sadbhawana Clinic',
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Appointment Request</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f4f4f4;
                padding: 20px;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2c5aa0;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .clinic-name {
                color: #2c5aa0;
                font-size: 28px;
                font-weight: bold;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .subtitle {
                color: #666;
                font-size: 16px;
                margin: 5px 0 0 0;
            }
            .greeting {
                font-size: 18px;
                color: #2c5aa0;
                margin-bottom: 20px;
                font-weight: 600;
            }
            .message {
                font-size: 16px;
                margin-bottom: 25px;
                color: #555;
            }
            .details-container {
                background-color: #f9f9f9;
                border-left: 4px solid #2c5aa0;
                padding: 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            .details-title {
                font-size: 18px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
            }
            .detail-item {
                margin-bottom: 12px;
                display: flex;
                flex-wrap: wrap;
            }
            .detail-label {
                font-weight: bold;
                color: #333;
                min-width: 140px;
                margin-right: 10px;
            }
            .detail-value {
                color: #555;
                flex: 1;
            }
            .priority-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 25px 0;
                text-align: center;
            }
            .priority-text {
                color: #856404;
                font-weight: 600;
                margin: 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e9ecef;
                text-align: center;
            }
            .signature {
                color: #2c5aa0;
                font-weight: 600;
                font-size: 16px;
            }
            .team-name {
                color: #666;
                font-size: 14px;
                margin-top: 5px;
            }
            .icon {
                margin-right: 8px;
            }
            @media (max-width: 600px) {
                .container {
                    padding: 20px;
                }
                .clinic-name {
                    font-size: 24px;
                }
                .detail-item {
                    flex-direction: column;
                }
                .detail-label {
                    min-width: auto;
                    margin-bottom: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://sadbhawanaclinic.com/assets/logo-BOQLvDo3.png" alt="Sadbhawana Clinic Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;">
                <h1 class="clinic-name">Sadbhawana Clinic</h1>
                <p class="subtitle">Caring for Your Health with Compassion</p>
            </div>
            
            <div class="greeting">
                🙏 Namaste Team,
            </div>
            
            <div class="message">
                We have received a new appointment booking through our online system. Please find the patient details below and take necessary action at the earliest.
            </div>
            
            <div class="details-container">
                <div class="details-title">
                    <span class="icon">👤</span>
                    Patient Appointment Details
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">📝 Patient Name:</span>
                    <span class="detail-value">${patientName}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">📞 Phone Number:</span>
                    <span class="detail-value">${phoneNumber}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">✉️ Email Address:</span>
                    <span class="detail-value">${email}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">🏠 Address:</span>
                    <span class="detail-value">${address}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">📅 Appointment Date:</span>
                    <span class="detail-value">${requestedIST.toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">🕐 Appointment Time:</span>
                    <span class="detail-value">${requestedIST.toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}</span>
                </div>
            </div>
            
            <div class="priority-notice">
                <p class="priority-text">
                    ⚡ Please contact the patient within 2-4 hours to confirm the appointment
                </p>
            </div>
            
            <div class="footer">
                <div class="signature">
                    With Best Regards,<br>
                    <strong>Sadbhawana Clinic Team</strong>
                </div>
                <div class="team-name">
                    Healthcare Management System
                </div>
                
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                    <div style="color: #888; font-size: 14px; margin-bottom: 10px;">Powered By</div>
                    <img src="https://www.codecrafter.co.in/assets/logo-B56gx62B.png" alt="Code Crafter Logo" style="max-width: 150px; height: auto;">
                </div>
            </div>
        </div>
    </body>
    </html>
  `,
            // Fallback text version for email clients that don't support HTML
            text: `
🏥 SADBHAWANA CLINIC
Caring for Your Health with Compassion

Namaste Team,

We have received a new appointment booking with the following details:

PATIENT DETAILS:
==================
📝 Patient Name: ${patientName}
📞 Phone Number: ${phoneNumber}
✉️ Email Address: ${email}
🏠 Address: ${address}
📅 Appointment Date: ${requestedIST.toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
🕐 Appointment Time: ${requestedIST.toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}

⚡ IMPORTANT: Please contact the patient within 2-4 hours to confirm the appointment.

With Best Regards,
Sadbhawana Clinic Team
Healthcare Management System
  `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Inquiry email sent successfully",
        });

    } catch (err) {
        console.log(err);

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
