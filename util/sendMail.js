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

export { sendMail };
