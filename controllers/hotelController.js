import Hotel from "../models/Hotel.js";
import HotelRoom from "../models/HotelRoom.js";
import BookingHotel from "../models/BookingHotel.js";
import { paymentZalopay, paymentVnpay } from "./paymentController.js";

// Đặt phòng
export const createHotelBooking = async (req, res) => {
  try {
    const {
      userId,
      hotelRoomId,
      checkInDate,
      checkOutDate,
      paymentMethod,
      totalPrice,
    } = req.body;

    // Kiểm tra phòng
    const room = await HotelRoom.findById(hotelRoomId);
    if (!room || room.status !== "Available") {
      return res.status(400).json({ message: "Room is not available" });
    }

    // Tạo booking
    const newBooking = new BookingHotel({
      hotelRoomId,
      userId,
      checkInDate,
      checkOutDate,
      totalPrice,
      paymentMethod,
      status: "Pending",
      typeBooking: "hotel",
    });
    await newBooking.save();

    let paymentUrl;
    if (paymentMethod === "ZaloPay") {
      paymentUrl = await paymentZalopay(newBooking._id, newBooking.typeBooking);
      if (!paymentUrl) {
        return res.status(503).json({
          success: false,
          message: "Payment creation failed.",
        });
      }
      // Trả về URL để frontend xử lý việc chuyển hướng
      return res.status(200).json({
        success: true,
        message: "Booking created successfully",
        order: newBooking,
        paymentUrl: paymentUrl,
      });
    }

    if (paymentMethod === "VNPay") {
      paymentUrl = await paymentVnpay(
        newBooking._id,
        newBooking.typeBooking,
        req,
        res
      );
      if (!paymentUrl) {
        return res.status(503).json({
          success: false,
          message: "Payment creation failed.",
        });
      }
      // Trả về URL để frontend xử lý việc chuyển hướng
      return res.status(200).json({
        success: true,
        message: "Booking created successfully",
        order: newBooking,
        paymentUrl: paymentUrl,
      });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

// Xem danh sách phòng đã đặt
export const getUserBookings = async (req, res) => {
  try {
    const id = req.params.id;
    const bookings = await BookingHotel.find({ userId: id });
    res.status(200).json({
      success: true,
      message: "Get booking history successfully",
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const getAllHotel = async (req, res) => {
  // pagianaion
  const page = parseInt(req.query.page);

  try {
    const hotels = await Hotel.find({})
      .skip(page * 8)
      .limit(8);

    res.status(200).json({
      success: true,
      count: hotels.length,
      message: "Sussessfully get all hotels",
      data: hotels,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the hotel. Try again",
    });
  }
};

export const getAllHotelRoom = async (req, res) => {
  // pagianaion
  const page = parseInt(req.query.page);
  const id = req.params.id;

  try {
    const hotelRooms = await HotelRoom.find({ hotelId: id })
      .skip(page * 8)
      .limit(8);

    res.status(200).json({
      success: true,
      count: hotelRooms.length,
      message: "Sussessfully get all hotel rooms",
      data: hotelRooms,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the hotel room. Try again",
    });
  }
};

export const createHotel = async (req, res) => {
  const newHotel = new Hotel(req.body);

  try {
    const savedHotel = await newHotel.save();

    res.status(200).json({
      success: true,
      message: "Sussessfully created a new hotel",
      data: savedHotel,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed created a new hotel. Try again",
    });
  }
};

export const createHotelRoom = async (req, res) => {
  const newHotelRoom = new HotelRoom(req.body);

  try {
    const savedHotelRoom = await newHotelRoom.save();

    res.status(200).json({
      success: true,
      message: "Sussessfully created a new hotel room",
      data: savedHotelRoom,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getSingleHotel = async (req, res) => {
  const id = req.params.id;

  try {
    const tour = await Hotel.findById(id);

    res.status(200).json({
      success: true,
      message: "Sussessfully get single hotel.",
      data: tour,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the hotel. Try again",
    });
  }
};

export const getSingleHotelRoom = async (req, res) => {
  const id = req.params.id;

  try {
    const tour = await HotelRoom.findById(id);

    res.status(200).json({
      success: true,
      message: "Sussessfully get single hotel room",
      data: tour,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found the hotel room. Try again",
    });
  }
};

export const updateHotel = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Sussessfully updated the hotel.",
      data: updatedHotel,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed update a hotel. Try again",
    });
  }
};

export const updateHotelRoom = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedHotelRoom = await HotelRoom.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Sussessfully updated the hotel room",
      data: updatedHotelRoom,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getHotelCount = async (req, res) => {
  try {
    const hotelCount = await Hotel.estimatedDocumentCount();

    res.status(200).json({
      success: true,
      data: hotelCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch",
    });
  }
};

export const deleteHotel = async (req, res) => {
  const id = req.params.id;

  try {
    await Hotel.findByIdAndUpdate(id, { active: false });

    res.status(200).json({
      success: true,
      message: "Sussessfully delete the hotel.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed delete a hotel. Try again",
    });
  }
};

export const deleteHotelRoom = async (req, res) => {
  const id = req.params.id;

  try {
    await HotelRoom.findByIdAndUpdate(id, { status: "Unavailable" });

    res.status(200).json({
      success: true,
      message: "Sussessfully delete the hotel room",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed delete a hotel room. Try again",
    });
  }
};
