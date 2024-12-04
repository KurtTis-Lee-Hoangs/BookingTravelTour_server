import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: { name: "Reset Password Service", address: process.env.GMAIL_USER },
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">Password Reset</h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">
          Your password has been successfully reset. Below is your new password:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="display: inline-block; font-size: 18px; font-weight: bold; padding: 10px 20px; background-color: #f2f2f2; border: 1px solid #ccc; border-radius: 5px; color: #333;">${options.password}</p>
        </div>
        <p style="font-size: 16px;">
          Please use this password to log in and change it immediately for your security.
        </p>
        <p style="font-size: 16px;">Thank you!</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 14px; color: #777; text-align: center;">
          If you did not request this, please ignore this email or contact support.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};