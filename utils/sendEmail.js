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

export const sendVerificationEmail = async (email, verificationLink) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or any other email provider
    auth: {
      user: process.env.GMAIL_USER, // your email user
      pass: process.env.GMAIL_PASS, // your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Account Activation",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #555;">Welcome to Our Service!</h2>
        <p>Thank you for signing up. Please confirm your email address to activate your account.</p>
        <p>
          Click <a href="${verificationLink}" style="color: #1a73e8; text-decoration: none;">here</a> to activate your account.
        </p>
        <p>If the above link doesn't work, please copy and paste the following URL into your browser:</p>
        <p style="word-wrap: break-word; color: #1a73e8;">${verificationLink}</p>
        <hr style="border: 0; height: 1px; background: #ccc;">
        <p style="font-size: 0.9em; color: #666;">If you didn’t request this email, please ignore it.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};