import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User registrantion
export const register = async (req, res) => {
  try {
    if (!req.body.password) {
      return res
        .status(401)
        .json({ success: false, message: "Password is required" });
    }
    // hasing password
    const salt = await bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      //   password: req.body.password,
      photo: req.body.photo,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Successfully created. User registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create. User registration failed. Try again",
    });
  }
};

// User login
export const login = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await User.findOne({ email });

    // if user doesn't exist
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // if user is exist then check the password or compare the password
    const checkCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    // if password is incorrect
    if (!checkCorrectPassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const { password, role, ...rest } = user._doc;

    // create jwt token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    // set token in browser cookies aand send the response to the client
    res.cookie("accessToken", token, {
      httpOnly: true,
      exprires: token.expiresIn,
      // secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      // sameSite: "strict",
    });
    res.status(200).json({
      // success: true,
      // message: "User logged in successfully",
      token,
      data: { ...rest },
      // role,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const googleCallback = (req, res) => {
  // Tạo JWT sau khi xác thực thành công
  const token = jwt.sign(
    { id: req.user._id, email: req.user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" }
  );

  const redirectUrl = `http://localhost:3000/homepage`;
  res.redirect(redirectUrl);
};
