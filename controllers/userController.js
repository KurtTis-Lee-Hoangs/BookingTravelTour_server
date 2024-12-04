import User from "../models/User.js";
import bcrypt from "bcryptjs";
import {sendEmail} from "../utils/sendEmail.js"
// Create a new User
export const createUser = async (req, res) => {
  // const newUser = new User(req.body);

  // try {
  //   const savedUser = await newUser.save();

  //   res.status(200).json({
  //     success: true,
  //     message: "Sussessfully created a new user",
  //     data: savedUser,
  //   });
  // } catch (err) {
  //   res.status(500).json({
  //     success: false,
  //     message: "Failed created a new user. Try again",
  //   });
  // }

  const { username, email, password, role } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
  });

  try {
    const savedUser = await newUser.save();
    res.status(200).json({
      success: true,
      message: "Successfully created a new user",
      data: savedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create a new user. Try again",
    });
  }
};

// Update a User
export const updateUser = async (req, res) => {
  // const id = req.params.id;

  // try {

  //   // Check if password is provided in the request body
  //   if (req.body.password) {
  //     const salt = await bcrypt.genSalt(10);
  //     req.body.password = await bcrypt.hash(req.body.password, salt);
  //   }

  //   const updatedUser = await User.findByIdAndUpdate(
  //     id,
  //     {
  //       $set: req.body,
  //     },
  //     { new: true }
  //   );

  //   res.status(200).json({
  //     success: true,
  //     message: "Sussessfully updated the user",
  //     data: updatedUser,
  //   });
  // } catch (err) {
  //   res.status(500).json({
  //     success: false,
  //     message: "Failed update a user. Try again",
  //   });
  // }

  const id = req.params.id;

  // Check if password is provided in the request body
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  // Check if there's a new avatar (Cloudinary URL)
  if (req.body.avatar) {
    // Optionally delete old avatar from Cloudinary (if you want)
    // cloudinary.v2.uploader.destroy(old_avatar_public_id);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Successfully updated the user",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update user. Try again",
    });
  }
};

// Delete a User
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Sussessfully delete the user",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed delete a user. Try again",
    });
  }
};

// Get a User
export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);

    res.status(200).json({
      success: true,
      message: "Sussessfully get single user",
      data: user,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the user. Try again",
    });
  }
};

// Get all User
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).json({
      success: true,
      message: "Sussessfully get all users",
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the users. Try again",
    });
  }
};


export const forgotPasswordCtrl = async (req, res) => {
  const account = await User.findOne({ email: req.body.email });
  if (!account) {
    return res.status(401).json({
      status: "failed",
      message: "Account not found. Please check your email!",
    });
  }

  // Tạo mật khẩu mới ngẫu nhiên
  const newPassword = Math.random().toString(36).slice(-8); // Sinh mật khẩu 8 ký tự ngẫu nhiên
  const hashedPassword = bcrypt.hashSync(newPassword, 10); // Hash mật khẩu mới

  // Cập nhật mật khẩu trong cơ sở dữ liệu
  account.password = hashedPassword;
  await account.save();

  try {
    await sendEmail({
      email: account.email,
      subject: "Your New Password",
      password: newPassword, // Truyền mật khẩu mới vào
    });

    res.status(200).json({
      status: "success",
      message: "A new password has been sent to your email!",
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "Failed to send email. Please try again later.",
    });
  }
};