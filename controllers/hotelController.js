import Hotel from "../models/Hotel.js";
import HotelRoom from "../models/HotelRoom.js";
import BookingHotel from "../models/BookingHotel.js";

// Đặt phòng
export const createHotelBooking = async (req, res) => {
  try {
    const { userId, roomId, checkInDate, checkOutDate } = req.body;

    // Kiểm tra phòng
    const room = await Hotel.findById(roomId);
    if (!room || room.status !== "Available") {
      return res.status(400).json({ message: "Phòng không khả dụng" });
    }

    // Tính tổng giá
    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = room.pricePerNight * nights;

    // Tạo booking
    const booking = new BookingHotel({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
    await booking.save();

    // Cập nhật trạng thái phòng
    room.status = "Booked";
    await room.save();

    res.status(201).json({ message: "Đặt phòng thành công", booking });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

// Xem danh sách phòng đã đặt
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ token
    const bookings = await BookingHotel.find({ userId }).populate("roomId");
    res.status(200).json(bookings);
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
    const hotelRooms = await HotelRoom.find({hotelId: id})
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
    const tour = await HotelRoom.findOne({ hotelId: id });

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
    await Hotel.findByIdAndUpdate(id, {active: false});

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
    await HotelRoom.findByIdAndUpdate(id, {status: "Unavailable"});

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
