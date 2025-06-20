import nodemailer from "nodemailer";

const sendMail = async (to, subject, text) => {
  console.log("process.env.SMTP_MAIL", process.env.SMTP_MAIL);
  console.log("process.env.SMTP_PASSWORD", process.env.SMTP_PASSWORD);  // ✅ Corrected line

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,  // ✅ Corrected line
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

const sendOtp=async(to,otp)=>{
      const transporter=nodemailer.createTransport({
         service:"gmail",
         auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD,
         },
      });

      const mailOptions={
        from:process.env.SMTP_MAIL,
        to,
        subject:"HRMS Password Reset - OTP Verification",
        text:`Your One-Time Password (OTP) for resetting your HRMS account password is: ${otp}. This code is valid for 5 minutes. Do not share it with anyone.`
      }
      await transporter.sendMail(mailOptions);
}

export { sendMail,sendOtp};
