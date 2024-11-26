import Booking from "../models/Booking.js";

// Create new booking
export const createBooking = async (req, res) => {
  const newBooking = new Booking(req.body);

  try {
    const savedBooking = await newBooking.save();
    res.status(200).json({
      success: true,
      message: "Your tour is booked successfully",
      data: savedBooking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Thông tin nhập vào đang bị sai",
    });
  }
};

// Get single bookings
export const getBooking = async (req, res) => {
  const id = req.params.id;

  try {
    const book = await Booking.findById(id);

    res.status(200).json({
      success: true,
      message: "Get booking successfully",
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Get booking failed. Not found booking",
    });
  }
};

// Get all bookings
export const getAllBooking = async (req, res) => {
  try {
    const bookAll = await Booking.find();

    res.status(200).json({
      success: true,
      message: "Get booking successfully",
      data: bookAll,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Get all booking failed. Not found booking",
    });
  }
};

// Get bookings by userId
export const getUserBookings = async (req, res) => {
  try {
    // Lọc bookings dựa trên userId trùng với _id người dùng đã đăng nhập
    const bookings = await Booking.find({ userId: req.user.id });
    
    res.status(200).json({
      success: true,
      message: "Get booking history successfully",
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",
      error: err.message,
    });
  }
};
